import csv
import io
import os
import re
import secrets


from django.contrib.auth.models import Group, User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.files.storage import default_storage
from django.db import IntegrityError, transaction

from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .views import IsTasteLocalAdmin

from .models import Vendor


class AdminVendorBulkImportView(APIView):
    """Bulk-import Vendor records and match optional logo images by filename."""

    permission_classes = [IsAuthenticated, IsTasteLocalAdmin]
    parser_classes = [MultiPartParser, FormParser]

    REQUIRED_FIELDS = [
        'business_name',
        'owner_name',
        'email',
        'phone',
        'address',
        'city',
    ]
    ALLOWED_FIELDS = [
        'business_name',
        'owner_name',
        'email',
        'phone',
        'description',
        'website',
        'social_media',
        'address',
        'city',
        'area',
        'latitude',
        'longitude',
        'logo',
    ]

    MAX_CSV_SIZE = 2 * 1024 * 1024
    MAX_LOGO_SIZE = 5 * 1024 * 1024
    MAX_RECORDS = 500
    ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"error": "Please upload a CSV file using the 'file' field."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if uploaded_file.size > self.MAX_CSV_SIZE:
            return Response(
                {"error": "The CSV file must not exceed 2 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            content = uploaded_file.read().decode("utf-8-sig")
        except UnicodeDecodeError:
            return Response(
                {"error": "The CSV file must use UTF-8 encoding."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reader = csv.DictReader(io.StringIO(content))
            headers = reader.fieldnames
            if not headers:
                return Response(
                    {"error": "The CSV file is empty or has no header row."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            headers = [header.strip() if header else "" for header in headers]
            reader.fieldnames = headers

            if len(headers) != len(set(headers)):
                return Response(
                    {"error": "The CSV file contains duplicate column names."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            missing_fields = [
                field for field in self.REQUIRED_FIELDS if field not in headers
            ]
            if missing_fields:
                return Response(
                    {
                        "error": "The CSV file is missing required columns.",
                        "missing_fields": missing_fields,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            unknown_fields = [
                field for field in headers if field not in self.ALLOWED_FIELDS
            ]
            if unknown_fields:
                return Response(
                    {
                        "error": "The CSV file contains unsupported columns.",
                        "unknown_fields": unknown_fields,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            rows = list(reader)
        except csv.Error:
            return Response(
                {"error": "Unable to read the CSV file. Check its formatting."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(rows) > self.MAX_RECORDS:
            return Response(
                {
                    "error": (
                        f"The CSV file cannot contain more than "
                        f"{self.MAX_RECORDS} records."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider_group, _ = Group.objects.get_or_create(name='Vendor')
        imported = []
        skipped = []
        seen_emails = set()

        for row_number, row in enumerate(rows, start=2):
            row = {
                key: (value or "").strip()
                for key, value in row.items()
                if key is not None
            }
            if not any(row.values()):
                continue

            missing_values = [
                field for field in self.REQUIRED_FIELDS if not row.get(field)
            ]
            if missing_values:
                skipped.append({
                    "row": row_number,
                    "reason": "Missing required values: " + ", ".join(missing_values),
                })
                continue

            email = row["email"].lower()
            try:
                validate_email(email)
            except ValidationError:
                skipped.append({"row": row_number, "reason": "Invalid email address."})
                continue

            if email in seen_emails:
                skipped.append({
                    "row": row_number,
                    "reason": "Duplicate email address in this CSV file.",
                })
                continue
            seen_emails.add(email)

            if User.objects.filter(email__iexact=email).exists():
                skipped.append({
                    "row": row_number,
                    "reason": "An account with this email already exists.",
                })
                continue

            logo_storage_name = None
            logo_filename = row.get("logo", "").strip()

            if logo_filename:
                # CSV must contain only the image filename, not a folder path.
                safe_filename = os.path.basename(logo_filename)

                if safe_filename != logo_filename or safe_filename in {"", ".", ".."}:
                    skipped.append({
                        "row": row_number,
                        "reason": "Logo must contain only the image filename.",
                    })
                    continue

                extension = os.path.splitext(safe_filename)[1].lower()

                if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
                    skipped.append({
                        "row": row_number,
                        "reason": "Logo must be JPG, JPEG, PNG or WEBP.",
                    })
                    continue

                logo_storage_name = "vendor_logos/" + safe_filename

                if not default_storage.exists(logo_storage_name):
                    skipped.append({
                        "row": row_number,
                        "reason": (
                            f"Logo '{safe_filename}' was not found in "
                            "backend/media/vendor_logos/."
                        ),
                    })
                    continue

            base_username = re.sub(
                r"[^a-zA-Z0-9_.-]", "", email.split("@")[0]
            ) or 'vendor'
            username = base_username
            suffix = 1
            while User.objects.filter(username__iexact=username).exists():
                username = f"{base_username}{suffix}"
                suffix += 1

            initial_password = secrets.token_urlsafe(16)
            try:
                with transaction.atomic():
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=initial_password,
                        first_name=row["owner_name"][:150],
                    )
                    user.groups.add(provider_group)

                    provider = Vendor(
                        user=user,
                        business_name=row["business_name"],
                        owner_name=row["owner_name"],
                        email=email,
                        phone=row["phone"],
                        description=row.get("description", ""),
                        address=row["address"],
                        city=row["city"],
                        area=row.get("area", ""),
                        latitude=row.get("latitude") or None,
                        longitude=row.get("longitude") or None,
                        website=row.get("website", ""),
                        social_media=row.get("social_media", ""),
                        status="pending",
                    )
                    if logo_storage_name:
                        # Attach the existing media file; do not upload/copy it again.
                        provider.logo.name = logo_storage_name

                    provider.full_clean()
                    provider.save()

                imported.append({
                    'vendor_id': provider.id,
                    "business_name": provider.business_name,
                    "username": user.username,
                    "email": user.email,
                    "initial_password": initial_password,
                    "status": provider.status,
                    "logo_assigned": bool(logo_storage_name),
                })
            except (ValidationError, IntegrityError) as error:
                if isinstance(error, ValidationError) and hasattr(error, "message_dict"):
                    reason = "; ".join(
                        message
                        for messages in error.message_dict.values()
                        for message in messages
                    )
                else:
                    reason = str(error)
                skipped.append({
                    "row": row_number,
                    "reason": reason or "The record could not be saved.",
                })

        response = Response(
            {
                "message": 'Vendor CSV import completed.',
                "imported_count": len(imported),
                "skipped_count": len(skipped),
                "imported": imported,
                "skipped": skipped,
            },
            status=status.HTTP_200_OK,
        )
        response["Cache-Control"] = "no-store"
        return response

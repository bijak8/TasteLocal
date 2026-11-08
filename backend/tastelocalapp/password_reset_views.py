
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle


logger = logging.getLogger(__name__)

User = get_user_model()


class PasswordResetRequestView(APIView):
    """
    Accepts an email address and sends a password-reset link
    when an active account exists for that email.
    """

    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        email = request.data.get('email', '')

        if not isinstance(email, str):
            return Response(
                {'email': ['Enter a valid email address.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = email.strip()

        if not email:
            return Response(
                {'email': ['Email address is required.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_email(email)
        except DjangoValidationError:
            return Response(
                {'email': ['Enter a valid email address.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        users = User.objects.filter(
            email__iexact=email,
            is_active=True
        )

        for user in users:
            if not user.has_usable_password():
                continue

            uid = urlsafe_base64_encode(force_bytes(user.pk))

            token = default_token_generator.make_token(user)

            frontend_url = getattr(
                settings,
                'FRONTEND_URL',
                'http://localhost:5173'
            ).rstrip('/')

            reset_link = (
                f'{frontend_url}/reset-password/{uid}/{token}'
            )

            subject = 'Reset Your TasteLocal Password'

            message = (
                f'Hello {user.username},\n\n'
                'We received a request to reset your TasteLocal password.\n\n'
                'Click the link below to create a new password:\n\n'
                f'{reset_link}\n\n'
                'This link is temporary and can only be used once.\n\n'
                'If you did not request a password reset, '
                'you can safely ignore this email.\n\n'
                'Regards,\n'
                'The TasteLocal Team'
            )

            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=getattr(
                        settings,
                        'DEFAULT_FROM_EMAIL',
                        None
                    ),
                    recipient_list=[user.email],
                    fail_silently=False
                )
            except Exception:
                logger.exception(
                    'Unable to send password reset email for user ID %s.',
                    user.pk
                )

        # Use the same response whether the email exists or not.
        # This prevents people from discovering registered email addresses.
        return Response(
            {
                'message': (
                    'If an account exists with that email address, '
                    'a password reset link has been sent.'
                )
            },
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    """
    Validates the reset token and saves the user's new password.
    """

    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request, uidb64, token):
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not password or not confirm_password:
            return Response(
                {
                    'password': ['Both password fields are required.']
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != confirm_password:
            return Response(
                {
                    'confirm_password': ['Passwords do not match.']
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Decode the user ID from the reset link.
        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))

            user = User.objects.get(
                pk=user_id,
                is_active=True
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            DjangoValidationError,
            User.DoesNotExist
        ):
            return Response(
                {
                    'detail': 'This password reset link is invalid or expired.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check whether the reset token is still valid.
        if not default_token_generator.check_token(user, token):
            return Response(
                {
                    'detail': 'This password reset link is invalid or expired.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Apply Django's configured password validators.
        try:
            validate_password(password, user=user)

        except DjangoValidationError as error:
            return Response(
                {
                    'password': error.messages
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save the new password securely.
        user.set_password(password)
        user.save(update_fields=['password'])

        return Response(
            {
                'message': (
                    'Your password has been reset successfully. '
                    'You can now log in.'
                )
            },
            status=status.HTTP_200_OK
        )

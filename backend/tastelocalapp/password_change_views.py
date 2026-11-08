
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


class AuthenticatedPasswordChangeView(APIView):
    """
    Allows an authenticated user to change their password
    after verifying their current password.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Check that all fields are provided.
        if not current_password or not new_password or not confirm_password:
            return Response(
                {
                    'detail': 'Please complete all password fields.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify the current password.
        if not user.check_password(current_password):
            return Response(
                {
                    'current_password': 'Your current password is incorrect.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check that the new passwords match.
        if new_password != confirm_password:
            return Response(
                {
                    'confirm_password': 'New passwords do not match.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Do not allow the user to reuse the existing password.
        if user.check_password(new_password):
            return Response(
                {
                    'new_password': (
                        'Your new password must be different '
                        'from your current password.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Apply Django's configured password validators.
        try:
            validate_password(new_password, user=user)

        except DjangoValidationError as error:
            return Response(
                {
                    'new_password': error.messages
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save the new password securely.
        user.set_password(new_password)
        user.save(update_fields=['password'])

        return Response(
            {
                'message': (
                    'Your password has been changed successfully. '
                    'Please log in again with your new password.'
                )
            },
            status=status.HTTP_200_OK
        )
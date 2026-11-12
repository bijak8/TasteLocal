
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .views import IsTasteLocalAdmin

from .models import (
    Vendor,
    TourOperator,
    CuisineCategory,
    ExperienceCategory,
    FoodTourCategory,
)

from .serializers import (
    VendorProfileSerializer,
    TourOperatorProfileSerializer,
    CuisineCategorySerializer,
    ExperienceCategorySerializer,
    FoodTourCategorySerializer,
)


# ==========================================
# BASE ADMIN PROVIDER LIST VIEW
# ==========================================

class AdminProviderListView(APIView):

    permission_classes = [IsTasteLocalAdmin]

    provider_model = None
    serializer_class = None

    def get(self, request):

        queryset = self.provider_model.objects.all().order_by(
            '-created_at'
        )

        # Filter by provider status
        status_filter = request.query_params.get('status')

        if status_filter:

            valid_statuses = dict(
                self.provider_model.STATUS_CHOICES
            )

            if status_filter not in valid_statuses:
                return Response(
                    {
                        'error': 'Invalid status filter.',
                        'valid_statuses': list(valid_statuses.keys()),
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            queryset = queryset.filter(
                status=status_filter
            )

        # Search by business name, owner name or email
        search = request.query_params.get(
            'search', ''
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(business_name__icontains=search) |
                Q(owner_name__icontains=search) |
                Q(email__icontains=search)
            )

        serializer = self.serializer_class(
            queryset,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data)


# ==========================================
# BASE ADMIN PROVIDER STATUS UPDATE VIEW
# ==========================================

class AdminProviderStatusView(APIView):

    permission_classes = [IsTasteLocalAdmin]

    provider_model = None
    serializer_class = None

    def patch(self, request, pk):

        provider = get_object_or_404(
            self.provider_model,
            pk=pk
        )

        new_status = request.data.get('status')

        valid_statuses = dict(
            self.provider_model.STATUS_CHOICES
        )

        if new_status not in valid_statuses:
            return Response(
                {
                    'error': 'Invalid provider status.',
                    'valid_statuses': list(valid_statuses.keys()),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        provider.status = new_status

        provider.save(
            update_fields=['status']
        )

        serializer = self.serializer_class(
            provider,
            context={'request': request}
        )

        return Response({
            'message': (
                f'{self.provider_model.__name__} status '
                f'updated to {new_status}.'
            ),
            'profile': serializer.data,
        })


# ==========================================
# ADMIN VENDOR MANAGEMENT
# ==========================================

class AdminVendorListView(AdminProviderListView):

    provider_model = Vendor
    serializer_class = VendorProfileSerializer


class AdminVendorStatusView(AdminProviderStatusView):

    provider_model = Vendor
    serializer_class = VendorProfileSerializer


# ==========================================
# ADMIN TOUR OPERATOR MANAGEMENT
# ==========================================

class AdminTourOperatorListView(AdminProviderListView):

    provider_model = TourOperator
    serializer_class = TourOperatorProfileSerializer


class AdminTourOperatorStatusView(AdminProviderStatusView):

    provider_model = TourOperator
    serializer_class = TourOperatorProfileSerializer


# ==========================================
# ADMIN USER ROLE IDENTIFICATION
# ==========================================

def get_admin_user_role(user):

    if user.is_staff or user.is_superuser:
        return 'Admin'

    if user.groups.filter(name='Tourist').exists():
        return 'Tourist'

    if user.groups.filter(name='Vendor').exists():
        return 'Vendor'

    if user.groups.filter(name='Tour Operator').exists():
        return 'Tour Operator'

    return 'User'


# ==========================================
# ADMIN USER SERIALIZER
# ==========================================

def serialize_admin_user(user):

    role = get_admin_user_role(user)

    business_name = None
    profile_status = None

    if role == 'Vendor':

        vendor = user.vendors.first()

        if vendor:
            business_name = vendor.business_name
            profile_status = vendor.status

    elif role == 'Tour Operator':

        operator = user.tour_operators.first()

        if operator:
            business_name = operator.business_name
            profile_status = operator.status

    return {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'role': role,
        'business_name': business_name,
        'profile_status': profile_status,
        'is_active': user.is_active,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
    }


# ==========================================
# ADMIN USER MANAGEMENT
# ==========================================

class AdminUserListView(APIView):

    permission_classes = [IsTasteLocalAdmin]

    def get(self, request):

        queryset = User.objects.all().prefetch_related(
            'groups',
            'vendors',
            'tour_operators',
        ).order_by('-date_joined')

        # ----------------------------------
        # Filter by user role
        # ----------------------------------

        role_filter = request.query_params.get('role')

        valid_roles = [
            'Tourist',
            'Vendor',
            'Tour Operator',
            'Admin',
            'User',
        ]

        if role_filter:

            if role_filter not in valid_roles:
                return Response(
                    {
                        'error': 'Invalid role filter.',
                        'valid_roles': valid_roles,
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if role_filter == 'Admin':

                queryset = queryset.filter(
                    Q(is_staff=True) |
                    Q(is_superuser=True)
                )

            elif role_filter == 'User':

                queryset = queryset.exclude(
                    Q(is_staff=True) |
                    Q(is_superuser=True) |
                    Q(groups__name='Tourist') |
                    Q(groups__name='Vendor') |
                    Q(groups__name='Tour Operator')
                )

            else:

                queryset = queryset.filter(
                    groups__name=role_filter
                )

        # ----------------------------------
        # Filter by account status
        # ----------------------------------

        active_filter = request.query_params.get(
            'is_active'
        )

        if active_filter is not None:

            if active_filter.lower() not in ['true', 'false']:
                return Response(
                    {
                        'error': 'is_active must be true or false.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            queryset = queryset.filter(
                is_active=active_filter.lower() == 'true'
            )

        # ----------------------------------
        # Search users
        # ----------------------------------

        search = request.query_params.get(
            'search', ''
        ).strip()

        if search:

            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(vendors__business_name__icontains=search) |
                Q(tour_operators__business_name__icontains=search)
            )

        queryset = queryset.distinct()

        # ----------------------------------
        # Pagination
        # ----------------------------------

        try:

            limit = int(
                request.query_params.get('limit', 50)
            )

            offset = int(
                request.query_params.get('offset', 0)
            )

        except (TypeError, ValueError):

            return Response(
                {
                    'error': 'Limit and offset must be valid integers.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if limit < 1 or offset < 0:

            return Response(
                {
                    'error': 'Limit must be positive and offset cannot be negative.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        limit = min(limit, 100)

        total_count = queryset.count()

        users = queryset[offset:offset + limit]

        results = [
            serialize_admin_user(user)
            for user in users
        ]

        return Response({
            'count': total_count,
            'limit': limit,
            'offset': offset,
            'results': results,
        })

# ==========================================
# ADMIN CATEGORY MANAGEMENT
# ==========================================

class AdminCategoryListCreateView(APIView):

    permission_classes = [IsTasteLocalAdmin]

    category_model = None
    serializer_class = None

    # List all categories
    def get(self, request):

        categories = self.category_model.objects.all().order_by(
            'name'
        )

        serializer = self.serializer_class(
            categories,
            many=True
        )

        return Response(serializer.data)

    # Create a new category
    def post(self, request):

        serializer = self.serializer_class(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class AdminCategoryDetailView(APIView):

    permission_classes = [IsTasteLocalAdmin]

    category_model = None
    serializer_class = None

    # Retrieve one category
    def get(self, request, pk):

        category = get_object_or_404(
            self.category_model,
            pk=pk
        )

        serializer = self.serializer_class(category)

        return Response(serializer.data)

    # Edit category name or active status
    def patch(self, request, pk):

        category = get_object_or_404(
            self.category_model,
            pk=pk
        )

        serializer = self.serializer_class(
            category,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# ==========================================
# CUISINE CATEGORY MANAGEMENT
# ==========================================

class AdminCuisineCategoryListCreateView(
    AdminCategoryListCreateView
):

    category_model = CuisineCategory
    serializer_class = CuisineCategorySerializer


class AdminCuisineCategoryDetailView(
    AdminCategoryDetailView
):

    category_model = CuisineCategory
    serializer_class = CuisineCategorySerializer


# ==========================================
# EXPERIENCE CATEGORY MANAGEMENT
# ==========================================

class AdminExperienceCategoryListCreateView(
    AdminCategoryListCreateView
):

    category_model = ExperienceCategory
    serializer_class = ExperienceCategorySerializer


class AdminExperienceCategoryDetailView(
    AdminCategoryDetailView
):

    category_model = ExperienceCategory
    serializer_class = ExperienceCategorySerializer


# ==========================================
# FOOD TOUR CATEGORY MANAGEMENT
# ==========================================

class AdminFoodTourCategoryListCreateView(
    AdminCategoryListCreateView
):

    category_model = FoodTourCategory
    serializer_class = FoodTourCategorySerializer


class AdminFoodTourCategoryDetailView(
    AdminCategoryDetailView
):

    category_model = FoodTourCategory
    serializer_class = FoodTourCategorySerializer

# ==========================================
# ADMIN ACTIVATE / DEACTIVATE USER
# ==========================================

class AdminUserStatusView(APIView):

    permission_classes = [IsTasteLocalAdmin]

    def patch(self, request, pk):

        user = get_object_or_404(
            User,
            pk=pk
        )

        is_active = request.data.get('is_active')

        # Validate account status input
        if not isinstance(is_active, bool):

            return Response(
                {
                    'error': 'is_active must be true or false.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent administrator from deactivating themselves
        if user.pk == request.user.pk:

            return Response(
                {
                    'error': 'You cannot deactivate your own account.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Protect administrator accounts
        if user.is_staff or user.is_superuser:

            return Response(
                {
                    'error': 'Administrator accounts cannot be changed through this endpoint.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        user.is_active = is_active

        user.save(
            update_fields=['is_active']
        )

        return Response({
            'message': (
                'User account activated successfully.'
                if is_active
                else 'User account deactivated successfully.'
            ),
            'user': serialize_admin_user(user),
        })

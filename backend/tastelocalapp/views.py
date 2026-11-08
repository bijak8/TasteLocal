from django.contrib.auth.models import User
from django.shortcuts import render

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone

from .models import (
    TouristProfile,
    Vendor,
    TourOperator,
    FoodExperience,
    FoodTour,
    TourStop,
    Booking,
    Review,
    Itinerary,
    ItineraryItem,
    Favourite,
)

from .serializers import (
    TouristRegistrationSerializer,
    TouristProfileSerializer,
    VendorRegistrationSerializer,
    TourOperatorRegistrationSerializer,
    FoodExperienceSerializer,
    FoodTourSerializer,
    TourStopSerializer,
    BookingSerializer,
    BookingUpdateSerializer,
    ReviewSerializer,
    ItinerarySerializer,
    ItineraryItemSerializer,
    FavouriteSerializer,
    ReviewUpdateSerializer,
    VendorProfileSerializer,
    TourOperatorProfileSerializer,
    ProviderReviewSerializer,
)


# ==========================================
# TOURIST REGISTRATION
# ==========================================

class TouristRegistrationView(generics.CreateAPIView):
    serializer_class = TouristRegistrationSerializer
    permission_classes = [AllowAny]


# ==========================================
# TOURIST PROFILE
# ==========================================

class TouristProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = TouristProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        user = self.request.user

        if not user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                "Only registered tourists can access this profile."
            )

        profile, created = TouristProfile.objects.get_or_create(
            user=user
        )

        return profile


# ==========================================
# CURRENT LOGGED-IN USER
# ==========================================

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Determine the user's role
        if user.is_superuser or user.is_staff:
            role = 'Admin'

        elif user.groups.filter(name='Tourist').exists():
            role = 'Tourist'

        elif user.groups.filter(name='Vendor').exists():
            role = 'Vendor'

        elif user.groups.filter(name='Tour Operator').exists():
            role = 'Tour Operator'

        else:
            role = 'User'

        # Basic user information
        data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': role,
            'profile_image': None,
            'business_name': None,
            'account_status': None,
        }

        # Tourist profile information
        if role == 'Tourist':
            profile = TouristProfile.objects.filter(
                user=user
            ).first()

            if profile and profile.profile_image:
                data['profile_image'] = request.build_absolute_uri(
                    profile.profile_image.url
                )

        # Vendor information
        elif role == 'Vendor':
            vendor = user.vendors.first()

            if vendor:
                data['business_name'] = vendor.business_name
                data['account_status'] = vendor.status

        # Tour Operator information
        elif role == 'Tour Operator':
            operator = user.tour_operators.first()

            if operator:
                data['business_name'] = operator.business_name
                data['account_status'] = operator.status

        return Response(data)

# ==========================================
# VENDOR REGISTRATION
# ==========================================

class VendorRegistrationView(generics.CreateAPIView):
    serializer_class = VendorRegistrationSerializer
    permission_classes = [AllowAny]


# ==========================================
# TOUR OPERATOR REGISTRATION
# ==========================================

class TourOperatorRegistrationView(generics.CreateAPIView):
    serializer_class = TourOperatorRegistrationSerializer
    permission_classes = [AllowAny]

# ==========================================
# VENDOR PROFILE
# ==========================================

class VendorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = VendorProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        user = self.request.user

        if not user.groups.filter(name='Vendor').exists():
            raise PermissionDenied(
                "Only registered vendors can access this profile."
            )

        vendor = user.vendors.first()

        if not vendor:
            raise NotFound("Vendor profile not found.")

        return vendor


# ==========================================
# TOUR OPERATOR PROFILE
# ==========================================

class TourOperatorProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = TourOperatorProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        user = self.request.user

        if not user.groups.filter(name='Tour Operator').exists():
            raise PermissionDenied(
                "Only registered tour operators can access this profile."
            )

        operator = user.tour_operators.first()

        if not operator:
            raise NotFound("Tour Operator profile not found.")

        return operator


# ==========================================
# CREATE FOOD EXPERIENCE
# ==========================================

class FoodExperienceCreateView(generics.CreateAPIView):
    serializer_class = FoodExperienceSerializer
    permission_classes = [IsAuthenticated]


# ==========================================
# CREATE FOOD TOUR
# ==========================================

class FoodTourCreateView(generics.CreateAPIView):
    serializer_class = FoodTourSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        operator = self.request.user.tour_operators.first()

        if not operator:
            raise PermissionDenied(
                "Only Tour Operators can create food tours."
            )

        if operator.status != 'approved':
            raise PermissionDenied(
                "Your Tour Operator profile must be approved."
            )

        serializer.save()


# ==========================================
# CREATE TOUR STOP
# ==========================================

class TourStopCreateView(generics.CreateAPIView):
    serializer_class = TourStopSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        food_tour = serializer.validated_data['food_tour']
        operator = self.request.user.tour_operators.first()

        if not operator:
            raise PermissionDenied(
                "You do not have a Tour Operator profile."
            )

        if food_tour.tour_operator_id != operator.id:
            raise PermissionDenied(
                "You can only add stops to your own food tours."
            )

        if operator.status != 'approved':
            raise PermissionDenied(
                "Your Tour Operator profile must be approved."
            )

        serializer.save()


# ==========================================
# TOUR OPERATOR TOUR STOP MANAGEMENT
# ==========================================

class TourOperatorTourStopListView(generics.ListAPIView):
    serializer_class = TourStopSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        operator = self.request.user.tour_operators.first()

        if not operator:
            raise PermissionDenied(
                "You do not have a Tour Operator profile."
            )

        queryset = TourStop.objects.filter(
            food_tour__tour_operator=operator
        ).select_related('food_tour').order_by(
            'food_tour_id', 'stop_order'
        )

        # Optionally filter stops by a specific food tour
        food_tour_id = self.request.query_params.get('tour_id')

        if food_tour_id:
            queryset = queryset.filter(
                food_tour_id=food_tour_id
            )

        return queryset


class TourOperatorTourStopDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = TourStopSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        operator = self.request.user.tour_operators.first()

        if not operator:
            raise PermissionDenied(
                "You do not have a Tour Operator profile."
            )

        return TourStop.objects.filter(
            food_tour__tour_operator=operator
        )

    def perform_update(self, serializer):
        operator = self.request.user.tour_operators.first()

        food_tour = serializer.validated_data.get(
            'food_tour',
            serializer.instance.food_tour
        )

        if food_tour.tour_operator_id != operator.id:
            raise PermissionDenied(
                "You can only assign stops to your own food tours."
            )

        if operator.status != 'approved':
            raise PermissionDenied(
                "Your Tour Operator profile must be approved."
            )

        serializer.save()


# ==========================================
# FOOD EXPERIENCE LISTING
# ==========================================

class FoodExperienceListView(generics.ListAPIView):
    serializer_class = FoodExperienceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return FoodExperience.objects.filter(
            status='approved'
        ).order_by('-created_at')


# ==========================================
# PUBLIC FOOD EXPERIENCE DETAILS
# ==========================================

class FoodExperienceDetailView(generics.RetrieveAPIView):
    serializer_class = FoodExperienceSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'experience_id'

    def get_queryset(self):
        return FoodExperience.objects.filter(
            status='approved'
        )


# ==========================================
# PUBLIC FOOD TOUR LISTING
# ==========================================

class FoodTourListView(generics.ListAPIView):
    serializer_class = FoodTourSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return FoodTour.objects.filter(
            status='approved'
        ).order_by('-created_at')


# ==========================================
# PUBLIC FOOD TOUR DETAILS
# ==========================================

class FoodTourDetailView(generics.RetrieveAPIView):
    serializer_class = FoodTourSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'tour_id'

    def get_queryset(self):
        return FoodTour.objects.filter(
            status='approved'
        )


# ==========================================
# PUBLIC TOUR STOP LISTING
# ==========================================

class TourStopListView(generics.ListAPIView):
    serializer_class = TourStopSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        food_tour_id = self.kwargs['food_tour_id']

        return TourStop.objects.filter(
            food_tour_id=food_tour_id,
            food_tour__status='approved'
        ).order_by('stop_order')


# ==========================================
# CREATE BOOKING REQUEST
# ==========================================

class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        # Only tourists can submit bookings
        if not user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                "Only registered tourists can submit bookings."
            )

        food_experience = serializer.validated_data.get(
            'food_experience'
        )

        food_tour = serializer.validated_data.get('food_tour')

        # Check that the selected food experience is approved
        if food_experience and food_experience.status != 'approved':
            raise PermissionDenied(
                "This food experience is not available for booking."
            )

        # Check that the selected food tour is approved
        if food_tour and food_tour.status != 'approved':
            raise PermissionDenied(
                "This food tour is not available for booking."
            )

        serializer.save(tourist=user)


# ==========================================
# PROVIDER BOOKING LIST
# ==========================================

class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Vendor: show bookings for their own food experiences
        vendor = user.vendors.first()

        if vendor:
            return Booking.objects.filter(
                food_experience__vendor=vendor
            ).order_by('-created_at')

        # Tour Operator: show bookings for their own food tours
        operator = user.tour_operators.first()

        if operator:
            return Booking.objects.filter(
                food_tour__tour_operator=operator
            ).order_by('-created_at')

        raise PermissionDenied(
            "You do not have a Vendor or Tour Operator profile."
        )


# ==========================================
# PROVIDER BOOKING UPDATE
# ==========================================

class BookingUpdateView(generics.UpdateAPIView):
    serializer_class = BookingUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        vendor = user.vendors.first()

        if vendor:
            return Booking.objects.filter(
                food_experience__vendor=vendor
            )

        operator = user.tour_operators.first()

        if operator:
            return Booking.objects.filter(
                food_tour__tour_operator=operator
            )

        return Booking.objects.none()

    def update(self, request, *args, **kwargs):
        status_value = request.data.get('status')

        if status_value not in ['confirmed', 'rejected']:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                "Booking status must be confirmed or rejected."
            )

        return super().update(request, *args, **kwargs)


# ==========================================
# TOURIST BOOKING HISTORY
# ==========================================

class TouristBookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            tourist=self.request.user
        ).order_by('-created_at')


# ==========================================
# CREATE REVIEW
# ==========================================

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can submit reviews.'
            )

        serializer.save()


# ==========================================
# REVIEW LIST
# ==========================================

class ReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Review.objects.select_related(
            'tourist',
            'food_experience',
            'food_tour'
        ).order_by('-created_at')

        experience_id = self.request.query_params.get('food_experience')
        tour_id = self.request.query_params.get('food_tour')

        if experience_id:
            return queryset.filter(
                food_experience_id=experience_id
            )

        if tour_id:
            return queryset.filter(
                food_tour_id=tour_id
            )

        return queryset


# ==========================================
# TOURIST REVIEW LIST
# ==========================================

class TouristReviewListView(generics.ListAPIView):
    serializer_class = ReviewUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can access their reviews.'
            )

        return Review.objects.filter(
            tourist=user
        ).select_related(
            'food_experience',
            'food_tour'
        ).order_by('-created_at')


# ==========================================
# TOURIST REVIEW UPDATE AND DELETE
# ==========================================

class TouristReviewDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ReviewUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can manage their reviews.'
            )

        return Review.objects.filter(
            tourist=user
        ).select_related(
            'food_experience',
            'food_tour'
        )

# ==========================================
# PROVIDER REVIEW LIST
# ==========================================

class ProviderReviewListView(generics.ListAPIView):
    serializer_class = ProviderReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Vendor: reviews for their own food experiences
        if user.groups.filter(name='Vendor').exists():
            vendor = user.vendors.first()

            if not vendor:
                raise PermissionDenied(
                    "You do not have a Vendor profile."
                )

            return Review.objects.filter(
                food_experience__vendor=vendor
            ).select_related(
                'tourist',
                'food_experience',
                'food_tour'
            ).order_by('-created_at')

        # Tour Operator: reviews for their own food tours
        if user.groups.filter(name='Tour Operator').exists():
            operator = user.tour_operators.first()

            if not operator:
                raise PermissionDenied(
                    "You do not have a Tour Operator profile."
                )

            return Review.objects.filter(
                food_tour__tour_operator=operator
            ).select_related(
                'tourist',
                'food_experience',
                'food_tour'
            ).order_by('-created_at')

        raise PermissionDenied(
            "Only Vendors and Tour Operators can access provider reviews."
        )


# ==========================================
# PROVIDER REVIEW RESPONSE
# ==========================================

class ProviderReviewResponseView(generics.UpdateAPIView):
    serializer_class = ProviderReviewSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch', 'options', 'head']

    def get_queryset(self):
        user = self.request.user

        # Vendor: can respond only to reviews for their own experiences
        if user.groups.filter(name='Vendor').exists():
            vendor = user.vendors.first()

            if not vendor:
                raise PermissionDenied(
                    "You do not have a Vendor profile."
                )

            return Review.objects.filter(
                food_experience__vendor=vendor
            )

        # Tour Operator: can respond only to reviews for their own tours
        if user.groups.filter(name='Tour Operator').exists():
            operator = user.tour_operators.first()

            if not operator:
                raise PermissionDenied(
                    "You do not have a Tour Operator profile."
                )

            return Review.objects.filter(
                food_tour__tour_operator=operator
            )

        raise PermissionDenied(
            "Only Vendors and Tour Operators can respond to reviews."
        )

    def perform_update(self, serializer):
        serializer.save(
            provider_responded_at=timezone.now()
        )

# ==========================================
# ITINERARY LIST AND CREATE
# ==========================================

class ItineraryListCreateView(generics.ListCreateAPIView):
    serializer_class = ItinerarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can access itineraries.'
            )

        return Itinerary.objects.filter(
            tourist=self.request.user
        ).prefetch_related(
            'items__food_experience',
            'items__food_tour'
        ).order_by('-created_at')

    def perform_create(self, serializer):
        if not self.request.user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can create itineraries.'
            )

        serializer.save(tourist=self.request.user)


# ==========================================
# ITINERARY DETAIL
# ==========================================

class ItineraryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ItinerarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can access itineraries.'
            )

        return Itinerary.objects.filter(
            tourist=self.request.user
        ).prefetch_related(
            'items__food_experience',
            'items__food_tour'
        )


# ==========================================
# CREATE ITINERARY ITEM
# ==========================================

class ItineraryItemCreateView(generics.CreateAPIView):
    serializer_class = ItineraryItemSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can add itinerary items.'
            )

        itinerary_id = self.kwargs['itinerary_id']

        itinerary = Itinerary.objects.filter(
            id=itinerary_id,
            tourist=self.request.user
        ).first()

        if not itinerary:
            raise NotFound('Itinerary not found.')

        serializer.save(itinerary=itinerary)


# ==========================================
# DELETE ITINERARY ITEM
# ==========================================

class ItineraryItemDeleteView(generics.DestroyAPIView):
    serializer_class = ItineraryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can remove itinerary items.'
            )

        return ItineraryItem.objects.filter(
            itinerary__tourist=self.request.user
        )


# ==========================================
# TOURIST FAVOURITE LIST AND CREATE
# ==========================================

class FavouriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavouriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can access favourites.'
            )

        return Favourite.objects.filter(
            tourist=self.request.user
        ).select_related(
            'food_experience',
            'food_tour'
        ).order_by('-created_at')

    def perform_create(self, serializer):
        if not self.request.user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can add favourites.'
            )

        serializer.save(tourist=self.request.user)


# ==========================================
# REMOVE FAVOURITE
# ==========================================

class FavouriteDeleteView(generics.DestroyAPIView):
    serializer_class = FavouriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                'Only tourists can remove favourites.'
            )

        return Favourite.objects.filter(
            tourist=self.request.user
        )


# ==========================================
# VENDOR DASHBOARD
# ==========================================

class VendorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vendor = request.user.vendors.first()

        if not vendor:
            raise PermissionDenied(
                "You do not have a Vendor profile."
            )

        experiences = FoodExperience.objects.filter(
            vendor=vendor
        )

        bookings = Booking.objects.filter(
            food_experience__vendor=vendor
        )

        return Response({
            'business_name': vendor.business_name,
            'vendor_status': vendor.status,
            'total_experiences': experiences.count(),
            'upcoming_experiences': experiences.filter(
                date__gte=timezone.localdate()
            ).count(),
            'total_bookings': bookings.count(),
            'pending_bookings': bookings.filter(
                status='pending'
            ).count(),
            'confirmed_bookings': bookings.filter(
                status='confirmed'
            ).count(),
        })


# ==========================================
# VENDOR'S OWN FOOD EXPERIENCES
# ==========================================

class VendorFoodExperienceListView(generics.ListAPIView):
    serializer_class = FoodExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        vendor = self.request.user.vendors.first()

        if not vendor:
            raise PermissionDenied(
                "You do not have a Vendor profile."
            )

        return FoodExperience.objects.filter(
            vendor=vendor
        ).order_by('-created_at')


# ==========================================
# VIEW, EDIT AND DELETE OWN FOOD EXPERIENCE
# ==========================================

class VendorFoodExperienceDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = FoodExperienceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        vendor = self.request.user.vendors.first()

        if not vendor:
            raise PermissionDenied(
                "You do not have a Vendor profile."
            )

        return FoodExperience.objects.filter(
            vendor=vendor
        )


# ==========================================
# TOUR OPERATOR DASHBOARD
# ==========================================

class TourOperatorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        operator = request.user.tour_operators.first()

        if not operator:
            raise PermissionDenied(
                "You do not have a Tour Operator profile."
            )

        tours = FoodTour.objects.filter(
            tour_operator=operator
        )

        bookings = Booking.objects.filter(
            food_tour__tour_operator=operator
        )

        return Response({
            'business_name': operator.business_name,
            'operator_status': operator.status,
            'total_tours': tours.count(),
            'upcoming_tours': tours.filter(
                date__gte=timezone.localdate()
            ).count(),
            'total_bookings': bookings.count(),
            'pending_bookings': bookings.filter(
                status='pending'
            ).count(),
            'confirmed_bookings': bookings.filter(
                status='confirmed'
            ).count(),
        })


# ==========================================
# TOUR OPERATOR'S OWN FOOD TOURS
# ==========================================

class TourOperatorFoodTourListView(generics.ListAPIView):
    serializer_class = FoodTourSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        operator = self.request.user.tour_operators.first()

        if not operator:
            raise PermissionDenied(
                "You do not have a Tour Operator profile."
            )

        return FoodTour.objects.filter(
            tour_operator=operator
        ).order_by('-created_at')


# ==========================================
# VIEW, EDIT AND DELETE OWN FOOD TOURS
# ==========================================

class TourOperatorFoodTourDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = FoodTourSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        operator = self.request.user.tour_operators.first()

        if not operator:
            raise PermissionDenied(
                "You do not have a Tour Operator profile."
            )

        return FoodTour.objects.filter(
            tour_operator=operator
        )


# ==========================================
# ADMIN PERMISSION
# ==========================================

class IsTasteLocalAdmin(BasePermission):
    """
    Allow access only to Django staff and superuser accounts.
    """

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or user.is_superuser)
        )


# ==========================================
# ADMIN DASHBOARD
# ==========================================

class AdminDashboardView(APIView):
    permission_classes = [IsTasteLocalAdmin]

    def get(self, request):

        return Response({

            # User statistics
            'total_users': User.objects.count(),

            'total_tourists': User.objects.filter(
                groups__name='Tourist'
            ).distinct().count(),

            # Vendor statistics
            'total_vendors': Vendor.objects.count(),

            'pending_vendors': Vendor.objects.filter(
                status='pending'
            ).count(),

            'approved_vendors': Vendor.objects.filter(
                status='approved'
            ).count(),

            'rejected_vendors': Vendor.objects.filter(
                status='rejected'
            ).count(),

            # Tour Operator statistics
            'total_tour_operators': TourOperator.objects.count(),

            'pending_tour_operators': TourOperator.objects.filter(
                status='pending'
            ).count(),

            'approved_tour_operators': TourOperator.objects.filter(
                status='approved'
            ).count(),

            'rejected_tour_operators': TourOperator.objects.filter(
                status='rejected'
            ).count(),

            # Food Experience statistics
            'total_food_experiences': FoodExperience.objects.count(),

            # Food Tour statistics
            'total_food_tours': FoodTour.objects.count(),

            # Booking statistics
            'total_bookings': Booking.objects.count(),

            'pending_bookings': Booking.objects.filter(
                status='pending'
            ).count(),

            'confirmed_bookings': Booking.objects.filter(
                status='confirmed'
            ).count(),

            'rejected_bookings': Booking.objects.filter(
                status='rejected'
            ).count(),

            'cancelled_bookings': Booking.objects.filter(
                status='cancelled'
            ).count(),

            # Review statistics
            'total_reviews': Review.objects.count(),

        })

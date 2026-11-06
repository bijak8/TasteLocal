from django.shortcuts import render

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied
from django.utils import timezone

from .models import (
    FoodExperience,
    FoodTour,
    TourStop,
    Booking,
    Review,
    Itinerary,
    ItineraryItem,
    Favourite
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

    def get_object(self):
        user = self.request.user

        if not user.groups.filter(name='Tourist').exists():
            raise PermissionDenied(
                "Only registered tourists can access this profile."
            )

        return user


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
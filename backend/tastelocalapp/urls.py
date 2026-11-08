
from django.urls import path

# ==========================================
# APPLICATION VIEWS
# ==========================================

from .views import (
    TouristRegistrationView,
    TouristProfileView,
    CurrentUserView,
    VendorRegistrationView,
    TourOperatorRegistrationView,
    VendorProfileView,
    TourOperatorProfileView,

    FoodExperienceCreateView,
    FoodTourCreateView,
    TourStopCreateView,
    TourOperatorTourStopListView,
    TourOperatorTourStopDetailView,

    FoodExperienceListView,
    FoodExperienceDetailView,
    FoodTourListView,
    FoodTourDetailView,
    TourStopListView,

    BookingCreateView,
    BookingListView,
    BookingUpdateView,
    TouristBookingListView,

    ReviewCreateView,
    ReviewListView,
    TouristReviewListView,
    TouristReviewDetailView,
    ProviderReviewListView,
    ProviderReviewResponseView,

    ItineraryListCreateView,
    ItineraryDetailView,
    ItineraryItemCreateView,
    ItineraryItemDeleteView,

    FavouriteListCreateView,
    FavouriteDeleteView,

    VendorDashboardView,
    VendorFoodExperienceListView,
    VendorFoodExperienceDetailView,

    TourOperatorDashboardView,
    TourOperatorFoodTourListView,
    TourOperatorFoodTourDetailView,

    AdminDashboardView,
)


# ==========================================
# PASSWORD MANAGEMENT VIEWS
# ==========================================

from .password_reset_views import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

from .password_change_views import (
    AuthenticatedPasswordChangeView,
)


# ==========================================
# ADMIN MANAGEMENT VIEWS
# ==========================================

from .admin_views import (
    AdminVendorListView,
    AdminVendorStatusView,
    AdminTourOperatorListView,
    AdminTourOperatorStatusView,
    AdminUserListView,
    AdminUserStatusView,
)


# ==========================================
# URL PATTERNS
# ==========================================

urlpatterns = [

    # ==========================================
    # 1. USER REGISTRATION
    # ==========================================

    path(
        'register/tourist/',
        TouristRegistrationView.as_view(),
        name='tourist-register'
    ),

    path(
        'register/vendor/',
        VendorRegistrationView.as_view(),
        name='vendor-register'
    ),

    path(
        'register/tour-operator/',
        TourOperatorRegistrationView.as_view(),
        name='tour-operator-register'
    ),


    # ==========================================
    # 2. PASSWORD MANAGEMENT
    # ==========================================

    path(
        'password-reset/',
        PasswordResetRequestView.as_view(),
        name='password-reset'
    ),

    path(
        'password-reset-confirm/<uidb64>/<token>/',
        PasswordResetConfirmView.as_view(),
        name='password-reset-confirm'
    ),

    path(
        'password-change/',
        AuthenticatedPasswordChangeView.as_view(),
        name='password-change'
    ),


    # ==========================================
    # 3. USER PROFILES
    # ==========================================

    path(
        'me/',
        CurrentUserView.as_view(),
        name='current-user'
    ),

    path(
        'tourist/profile/',
        TouristProfileView.as_view(),
        name='tourist-profile'
    ),

    path(
        'vendor/profile/',
        VendorProfileView.as_view(),
        name='vendor-profile'
    ),

    path(
        'operator/profile/',
        TourOperatorProfileView.as_view(),
        name='operator-profile'
    ),


    # ==========================================
    # 4. FOOD EXPERIENCE MANAGEMENT
    # ==========================================

    # Create food experience
    path(
        'food-experiences/create/',
        FoodExperienceCreateView.as_view(),
        name='food-experience-create'
    ),

    # Public food experience listing
    path(
        'food-experiences/',
        FoodExperienceListView.as_view(),
        name='food-experience-list'
    ),

    # Food experience details
    path(
        'food-experiences/<int:experience_id>/',
        FoodExperienceDetailView.as_view(),
        name='food-experience-detail'
    ),

    # Vendor's own food experiences
    path(
        'vendor/food-experiences/',
        VendorFoodExperienceListView.as_view(),
        name='vendor-food-experience-list'
    ),

    # View, edit and delete own food experience
    path(
        'vendor/food-experiences/<int:pk>/',
        VendorFoodExperienceDetailView.as_view(),
        name='vendor-food-experience-detail'
    ),


    # ==========================================
    # 5. FOOD TOUR MANAGEMENT
    # ==========================================

    # Create food tour
    path(
        'food-tours/create/',
        FoodTourCreateView.as_view(),
        name='food-tour-create'
    ),

    # Public food tour listing
    path(
        'food-tours/',
        FoodTourListView.as_view(),
        name='food-tour-list'
    ),

    # Public food tour details
    path(
        'food-tours/<int:tour_id>/',
        FoodTourDetailView.as_view(),
        name='food-tour-detail'
    ),

    # Public tour stops
    path(
        'food-tours/<int:food_tour_id>/stops/',
        TourStopListView.as_view(),
        name='food-tour-stops'
    ),

    # Tour Operator's own food tours
    path(
        'operator/food-tours/',
        TourOperatorFoodTourListView.as_view(),
        name='operator-food-tour-list'
    ),

    # View, edit and delete own food tours
    path(
        'operator/food-tours/<int:pk>/',
        TourOperatorFoodTourDetailView.as_view(),
        name='operator-food-tour-detail'
    ),


    # ==========================================
    # 6. TOUR STOP MANAGEMENT
    # ==========================================

    # Create tour stop
    path(
        'tour-stops/create/',
        TourStopCreateView.as_view(),
        name='tour-stop-create'
    ),

    # Tour Operator's tour stop listing
    path(
        'operator/tour-stops/',
        TourOperatorTourStopListView.as_view(),
        name='operator-tour-stop-list'
    ),

    # View, edit and delete tour stop
    path(
        'operator/tour-stops/<int:pk>/',
        TourOperatorTourStopDetailView.as_view(),
        name='operator-tour-stop-detail'
    ),


    # ==========================================
    # 7. BOOKING MANAGEMENT
    # ==========================================

    # Create booking request
    path(
        'bookings/create/',
        BookingCreateView.as_view(),
        name='booking-create'
    ),

    # Provider booking list
    path(
        'bookings/',
        BookingListView.as_view(),
        name='provider-booking-list'
    ),

    # Provider updates booking status
    path(
        'bookings/<int:pk>/update/',
        BookingUpdateView.as_view(),
        name='booking-update'
    ),

    # Tourist booking history
    path(
        'my-bookings/',
        TouristBookingListView.as_view(),
        name='tourist-booking-list'
    ),


    # ==========================================
    # 8. REVIEW MANAGEMENT
    # ==========================================

    # Create review
    path(
        'reviews/create/',
        ReviewCreateView.as_view(),
        name='review-create'
    ),

    # Public review listing
    path(
        'reviews/',
        ReviewListView.as_view(),
        name='review-list'
    ),

    # Tourist review listing
    path(
        'my-reviews/',
        TouristReviewListView.as_view(),
        name='tourist-review-list'
    ),

    # Tourist view, edit and delete review
    path(
        'my-reviews/<int:pk>/',
        TouristReviewDetailView.as_view(),
        name='tourist-review-detail'
    ),

    # Provider review listing
    path(
        'provider/reviews/',
        ProviderReviewListView.as_view(),
        name='provider-review-list'
    ),

    # Provider responds to review
    path(
        'provider/reviews/<int:pk>/respond/',
        ProviderReviewResponseView.as_view(),
        name='provider-review-respond'
    ),


    # ==========================================
    # 9. ITINERARY MANAGEMENT
    # ==========================================

    # List and create itineraries
    path(
        'itineraries/',
        ItineraryListCreateView.as_view(),
        name='itinerary-list-create'
    ),

    # View, edit and delete itinerary
    path(
        'itineraries/<int:pk>/',
        ItineraryDetailView.as_view(),
        name='itinerary-detail'
    ),

    # Add item to itinerary
    path(
        'itineraries/<int:itinerary_id>/items/',
        ItineraryItemCreateView.as_view(),
        name='itinerary-item-create'
    ),

    # Delete itinerary item
    path(
        'itineraries/<int:itinerary_id>/items/<int:pk>/',
        ItineraryItemDeleteView.as_view(),
        name='itinerary-item-delete'
    ),


    # ==========================================
    # 10. FAVOURITES
    # ==========================================

    # List and add favourites
    path(
        'favourites/',
        FavouriteListCreateView.as_view(),
        name='favourite-list-create'
    ),

    # Delete favourite
    path(
        'favourites/<int:pk>/',
        FavouriteDeleteView.as_view(),
        name='favourite-delete'
    ),


    # ==========================================
    # 11. VENDOR DASHBOARD
    # ==========================================

    path(
        'vendor/dashboard/',
        VendorDashboardView.as_view(),
        name='vendor-dashboard'
    ),


    # ==========================================
    # 12. TOUR OPERATOR DASHBOARD
    # ==========================================

    path(
        'operator/dashboard/',
        TourOperatorDashboardView.as_view(),
        name='operator-dashboard'
    ),


    # ==========================================
    # 13. ADMIN DASHBOARD
    # ==========================================

    path(
        'admin/dashboard/',
        AdminDashboardView.as_view(),
        name='admin-dashboard'
    ),


    # ==========================================
    # 14. ADMIN VENDOR MANAGEMENT
    # ==========================================

    # List and search vendors
    path(
        'admin/vendors/',
        AdminVendorListView.as_view(),
        name='admin-vendor-list'
    ),

    # Approve, reject or update vendor status
    path(
        'admin/vendors/<int:pk>/status/',
        AdminVendorStatusView.as_view(),
        name='admin-vendor-status'
    ),


    # ==========================================
    # 15. ADMIN TOUR OPERATOR MANAGEMENT
    # ==========================================

    # List and search tour operators
    path(
        'admin/tour-operators/',
        AdminTourOperatorListView.as_view(),
        name='admin-tour-operator-list'
    ),

    # Approve, reject or update tour operator status
    path(
        'admin/tour-operators/<int:pk>/status/',
        AdminTourOperatorStatusView.as_view(),
        name='admin-tour-operator-status'
    ),


    # ==========================================
    # 16. ADMIN USER MANAGEMENT
    # ==========================================

    # List, search and filter users
    path(
        'admin/users/',
        AdminUserListView.as_view(),
        name='admin-user-list'
    ),

    # Activate or deactivate user accounts
    path(
        'admin/users/<int:pk>/status/',
        AdminUserStatusView.as_view(),
        name='admin-user-status'
    ),

]


from django.urls import path

from .views import (
    TouristProfileView,
    TouristRegistrationView,
    VendorRegistrationView,
    TourOperatorRegistrationView,
    FoodExperienceCreateView,
    FoodTourCreateView,
    TourStopCreateView,
    FoodExperienceListView,
    FoodTourListView,
    TourStopListView,
    FoodExperienceDetailView,
    FoodTourDetailView,
    BookingCreateView,
    BookingListView,
    BookingUpdateView,
    TouristBookingListView,
    ReviewCreateView,
    ReviewListView,
    TouristReviewListView,
    TouristReviewDetailView,
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
    TourOperatorTourStopListView,
    TourOperatorTourStopDetailView,
)

urlpatterns = [
    #User Registration
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

    #Tourist Profile
    path(
        'tourist/profile/',
        TouristProfileView.as_view(),
        name='tourist-profile'
    ),

    #Food Experience
    path(
        'food-experiences/create/',
        FoodExperienceCreateView.as_view(),
        name='food-experience-create'
    ),
    path(
        'food-experiences/',
        FoodExperienceListView.as_view(),
        name='food-experience-list'
    ),
    path(
        'food-experiences/<int:experience_id>/',
        FoodExperienceDetailView.as_view(),
        name='food-experience-detail'
    ),

    #Food Tour
    path(
        'food-tours/create/',
        FoodTourCreateView.as_view(),
        name='food-tour-create'
    ),
    path(
        'food-tours/',
        FoodTourListView.as_view(),
        name='food-tour-list'
    ),
    path(
        'food-tours/<int:tour_id>/',
        FoodTourDetailView.as_view(),
        name='food-tour-detail'
    ),

    #Tour Stops
    path(
        'tour-stops/create/',
        TourStopCreateView.as_view(),
        name='tour-stop-create'
    ),
    path(
        'food-tours/<int:food_tour_id>/stops/',
        TourStopListView.as_view(),
        name='tour-stop-list'
    ),

    #Bookings
    path(
        'bookings/create/',
        BookingCreateView.as_view(),
        name='booking-create'
    ),
    path(
        'bookings/',
        BookingListView.as_view(),
        name='booking-list'
    ),
    path(
        'bookings/<int:pk>/update/',
        BookingUpdateView.as_view(),
        name='booking-update'
    ),
    path(
        'my-bookings/',
        TouristBookingListView.as_view(),
        name='tourist-booking-list'
    ),
    path(
        'reviews/create/', 
        ReviewCreateView.as_view(), 
        name='review-create'
    ),

    #Reviews
    path(
        'reviews/', 
        ReviewListView.as_view(), 
        name='review-list'
    ),

    #Itineraries
    path(
        'itineraries/',
        ItineraryListCreateView.as_view(),
        name='itinerary-list-create'
    ),
    path(
        'itineraries/<int:pk>/',
        ItineraryDetailView.as_view(),
        name='itinerary-detail'
    ),
    path(
        'itineraries/<int:itinerary_id>/items/',
        ItineraryItemCreateView.as_view(),
        name='itinerary-item-create'
    ),
    path(
        'itinerary-items/<int:pk>/',
        ItineraryItemDeleteView.as_view(),
        name='itinerary-item-delete'
    ),

    #Favourties
    path(
        'favourites/',
        FavouriteListCreateView.as_view(),
        name='favourite-list-create'
    ),
    path(
        'favourites/<int:pk>/',
        FavouriteDeleteView.as_view(),
        name='favourite-delete'
    ),

    #Vendor Dashboard
    path(
        'vendor/dashboard/',
        VendorDashboardView.as_view(),
        name='vendor-dashboard'
    ),

    #Vendor's Food Experiences
    path(
        'vendor/food-experiences/',
        VendorFoodExperienceListView.as_view(),
        name='vendor-food-experience-list'
    ),

    #View, Edit and Delete Vendor Food Experience
    path(
        'vendor/food-experiences/<int:pk>/',
        VendorFoodExperienceDetailView.as_view(),
        name='vendor-food-experience-detail'
),

    #Tour Operator Dashboard
    path(
        'operator/dashboard/',
        TourOperatorDashboardView.as_view(),
        name='operator-dashboard'
    ),
    path(
        'operator/food-tours/',
        TourOperatorFoodTourListView.as_view(),
        name='operator-food-tour-list'
    ),
    path(
        'operator/food-tours/<int:pk>/',
        TourOperatorFoodTourDetailView.as_view(),
        name='operator-food-tour-detail'
    ),

    #Tour Operator Tour Stop Management
    path(
        'operator/tour-stops/',
        TourOperatorTourStopListView.as_view(),
        name='operator-tour-stop-list'
    ),
    path(
        'operator/tour-stops/<int:pk>/',
        TourOperatorTourStopDetailView.as_view(),
        name='operator-tour-stop-detail'
    ),
    #Tourist Review Management
    path(
        'my-reviews/',
        TouristReviewListView.as_view(),
        name='tourist-review-list'
    ),
    path(
        'my-reviews/<int:pk>/',
        TouristReviewDetailView.as_view(),
        name='tourist-review-detail'
    ),
]

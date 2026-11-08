
from django.contrib import admin

from .models import (
    Vendor,
    TourOperator,
    FoodExperience,
    FoodTour,
    TourStop,
    Booking,
    Review,
    TouristProfile,
    Itinerary,
    ItineraryItem,
    Favourite,
)


# ==========================================
# VENDOR MANAGEMENT
# ==========================================

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):

    list_display = (
        'business_name',
        'owner_name',
        'email',
        'city',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
        'city',
    )

    search_fields = (
        'business_name',
        'owner_name',
        'email',
    )

    ordering = ('-created_at',)

    actions = [
        'approve_selected_vendors',
        'reject_selected_vendors',
    ]

    @admin.action(description='Approve selected vendors')
    def approve_selected_vendors(self, request, queryset):
        updated = queryset.update(status='approved')

        self.message_user(
            request,
            f'{updated} vendor(s) successfully approved.'
        )

    @admin.action(description='Reject selected vendors')
    def reject_selected_vendors(self, request, queryset):
        updated = queryset.update(status='rejected')

        self.message_user(
            request,
            f'{updated} vendor(s) successfully rejected.'
        )


# ==========================================
# TOUR OPERATOR MANAGEMENT
# ==========================================

@admin.register(TourOperator)
class TourOperatorAdmin(admin.ModelAdmin):

    list_display = (
        'business_name',
        'owner_name',
        'email',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
    )

    search_fields = (
        'business_name',
        'owner_name',
        'email',
    )

    ordering = ('-created_at',)

    actions = [
        'approve_selected_operators',
        'reject_selected_operators',
    ]

    @admin.action(description='Approve selected tour operators')
    def approve_selected_operators(self, request, queryset):
        updated = queryset.update(status='approved')

        self.message_user(
            request,
            f'{updated} tour operator(s) successfully approved.'
        )

    @admin.action(description='Reject selected tour operators')
    def reject_selected_operators(self, request, queryset):
        updated = queryset.update(status='rejected')

        self.message_user(
            request,
            f'{updated} tour operator(s) successfully rejected.'
        )


# ==========================================
# FOOD EXPERIENCE MANAGEMENT
# ==========================================

@admin.register(FoodExperience)
class FoodExperienceAdmin(admin.ModelAdmin):

    list_display = (
        'title',
        'vendor',
        'category',
        'city',
        'area',
        'price',
        'status',
    )

    list_filter = (
        'status',
        'category',
        'city',
    )

    search_fields = (
        'title',
        'vendor__business_name',
    )

    ordering = ('-created_at',)

    # Admin can view status but does not approve listings
    readonly_fields = (
        'status',
    )


# ==========================================
# FOOD TOUR MANAGEMENT
# ==========================================

@admin.register(FoodTour)
class FoodTourAdmin(admin.ModelAdmin):

    list_display = (
        'title',
        'tour_operator',
        'city',
        'area',
        'price',
        'status',
    )

    list_filter = (
        'status',
        'city',
    )

    search_fields = (
        'title',
        'tour_operator__business_name',
    )

    ordering = ('-created_at',)

    # Admin can view status but does not approve listings
    readonly_fields = (
        'status',
    )


# ==========================================
# TOUR STOP MANAGEMENT
# ==========================================

@admin.register(TourStop)
class TourStopAdmin(admin.ModelAdmin):

    list_display = (
        'name',
        'food_tour',
        'city',
        'area',
        'stop_order',
    )

    list_filter = (
        'city',
        'area',
    )

    search_fields = (
        'name',
        'address',
        'food_tour__title',
    )

    ordering = (
        'food_tour',
        'stop_order',
    )


# ==========================================
# BOOKING MANAGEMENT
# ==========================================

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'tourist',
        'food_experience',
        'food_tour',
        'number_of_participants',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
        'created_at',
    )

    search_fields = (
        'tourist__username',
        'tourist__email',
        'food_experience__title',
        'food_tour__title',
    )

    ordering = ('-created_at',)


# ==========================================
# REVIEW MANAGEMENT
# ==========================================

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'tourist',
        'food_experience',
        'food_tour',
        'rating',
        'created_at',
    )

    list_filter = (
        'rating',
        'created_at',
    )

    search_fields = (
        'tourist__username',
        'food_experience__title',
        'food_tour__title',
        'comment',
    )

    ordering = ('-created_at',)


# ==========================================
# TOURIST PROFILE MANAGEMENT
# ==========================================

@admin.register(TouristProfile)
class TouristProfileAdmin(admin.ModelAdmin):

    list_display = (
        'user',
        'phone',
        'location',
        'created_at',
        'updated_at',
    )

    search_fields = (
        'user__username',
        'user__email',
        'phone',
        'location',
    )

    list_filter = (
        'created_at',
    )

    readonly_fields = (
        'created_at',
        'updated_at',
    )


# ==========================================
# ITINERARY MANAGEMENT
# ==========================================

@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):

    list_display = (
        'title',
        'tourist',
        'created_at',
    )

    search_fields = (
        'title',
        'tourist__username',
        'tourist__email',
    )

    list_filter = (
        'created_at',
    )

    ordering = ('-created_at',)


# ==========================================
# ITINERARY ITEM MANAGEMENT
# ==========================================

@admin.register(ItineraryItem)
class ItineraryItemAdmin(admin.ModelAdmin):

    list_display = (
        'itinerary',
        'food_experience',
        'food_tour',
        'position',
        'created_at',
    )

    search_fields = (
        'itinerary__title',
        'itinerary__tourist__username',
        'food_experience__title',
        'food_tour__title',
    )

    list_filter = (
        'created_at',
    )

    ordering = (
        'itinerary',
        'position',
    )


# ==========================================
# FAVOURITE MANAGEMENT
# ==========================================

@admin.register(Favourite)
class FavouriteAdmin(admin.ModelAdmin):

    list_display = (
        'tourist',
        'food_experience',
        'food_tour',
        'created_at',
    )

    search_fields = (
        'tourist__username',
        'tourist__email',
        'food_experience__title',
        'food_tour__title',
    )

    list_filter = (
        'created_at',
    )

    ordering = ('-created_at',)


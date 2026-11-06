
from django.contrib import admin

from .models import (
    Vendor,
    TourOperator,
    FoodExperience,
    FoodTour,
    TourStop,
    Booking,
    Review,
)


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
    list_filter = ('status', 'city')
    search_fields = ('business_name', 'owner_name', 'email')


@admin.register(TourOperator)
class TourOperatorAdmin(admin.ModelAdmin):
    list_display = (
        'business_name',
        'owner_name',
        'email',
        'status',
        'created_at',
    )
    list_filter = ('status',)
    search_fields = ('business_name', 'owner_name', 'email')


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
    list_filter = ('status', 'category', 'city')
    search_fields = ('title', 'vendor__business_name')


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
    list_filter = ('status', 'city')
    search_fields = ('title', 'tour_operator__business_name')


@admin.register(TourStop)
class TourStopAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'food_tour',
        'city',
        'area',
        'stop_order',
    )
    list_filter = ('city', 'area')
    search_fields = ('name', 'address')


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
    list_filter = ('status', 'created_at')
    search_fields = (
        'tourist__username',
        'food_experience__title',
        'food_tour__title',
    )


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
    list_filter = ('rating', 'created_at')
    search_fields = (
        'tourist__username',
        'food_experience__title',
        'food_tour__title',
        'comment',
    )

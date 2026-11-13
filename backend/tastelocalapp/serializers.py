from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import (
    TouristProfile,
    Vendor,
    TourOperator,
    CuisineCategory,
    ExperienceCategory,
    FoodTourCategory,
    FoodExperience,
    FoodTour,
    TourStop,
    Booking,
    Review,
    Itinerary,
    ItineraryItem,
    Favourite,
    AvailabilitySession,
)


def validate_registration_password(password, username, email):
    user = User(
        username=username,
        email=email,
    )

    try:
        validate_password(password, user=user)
    except DjangoValidationError as error:
        raise serializers.ValidationError({
            'password': error.messages
        })


class TouristRegistrationSerializer(serializers.ModelSerializer):

    phone = serializers.CharField(
        write_only=True,
        required=True,
        max_length=30
    )

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email address is already registered."
            )
        return value

    def validate(self, attrs):
        validate_registration_password(
            password=attrs['password'],
            username=attrs['username'],
            email=attrs['email'],
        )
        return attrs

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        tourist_group, created = Group.objects.get_or_create(
            name='Tourist'
        )

        user.groups.add(tourist_group)

        TouristProfile.objects.create(
            user=user,
            phone=phone
        )

        return user


# ==========================================
# TOURIST PROFILE SERIALIZER
# ==========================================


class TouristProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    first_name = serializers.CharField(
        source='user.first_name',
        required=False
    )

    last_name = serializers.CharField(
        source='user.last_name',
        required=False
    )

    email = serializers.EmailField(
        source='user.email',
        required=False
    )

    profile_image = serializers.ImageField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = TouristProfile
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'profile_image',
            'phone',
            'bio',
            'location',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'username',
            'created_at',
            'updated_at',
        ]

    def validate_email(self, value):
        user = self.instance.user

        if User.objects.filter(
            email__iexact=value
        ).exclude(pk=user.pk).exists():
            raise serializers.ValidationError(
                "This email address is already registered."
            )

        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})

        for attribute, value in user_data.items():
            setattr(instance.user, attribute, value)

        if user_data:
            instance.user.save()

        return super().update(instance, validated_data)


class VendorRegistrationSerializer(serializers.ModelSerializer):

    username = serializers.CharField(write_only=True)
    area = serializers.CharField(required=True, allow_blank=False)

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = Vendor
        fields = [
            'username',
            'password',
            'business_name',
            'owner_name',
            'email',
            'phone',
            'description',
            'address',
            'city',
            'area',
            'latitude',
            'longitude',
            'website',
            'social_media',
        ]

        extra_kwargs = {
            'description': {
                'required': False,
                'allow_blank': True,
            },
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email address is already registered."
            )
        return value

    def validate(self, attrs):
        validate_registration_password(
            password=attrs['password'],
            username=attrs['username'],
            email=attrs['email'],
        )
        return attrs

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=password
        )

        vendor_group, created = Group.objects.get_or_create(
            name='Vendor'
        )

        user.groups.add(vendor_group)

        vendor = Vendor.objects.create(
            user=user,
            **validated_data
        )

        return vendor


class TourOperatorRegistrationSerializer(serializers.ModelSerializer):

    username = serializers.CharField(write_only=True)

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = TourOperator
        fields = [
            'username',
            'password',
            'business_name',
            'owner_name',
            'email',
            'phone',
            'description',
            'website',
            'social_media'
        ]

        extra_kwargs = {
            'description': {
                'required': False,
                'allow_blank': True,
            },
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email address is already registered."
            )
        return value

    def validate(self, attrs):
        validate_registration_password(
            password=attrs['password'],
            username=attrs['username'],
            email=attrs['email'],
        )
        return attrs

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=password
        )

        operator_group, created = Group.objects.get_or_create(
            name='Tour Operator'
        )

        user.groups.add(operator_group)

        tour_operator = TourOperator.objects.create(
            user=user,
            **validated_data
        )

        return tour_operator


# ==========================================
# CATEGORY SERIALIZERS
# ==========================================

class CuisineCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = CuisineCategory
        fields = ['id', 'name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ExperienceCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ExperienceCategory
        fields = ['id', 'name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class FoodTourCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = FoodTourCategory
        fields = ['id', 'name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


# ==========================================
# VENDOR PROFILE SERIALIZER
# ==========================================


class VendorProfileSerializer(serializers.ModelSerializer):

    cuisine_categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=CuisineCategory.objects.filter(is_active=True),
        required=False
    )

    cuisine_category_details = CuisineCategorySerializer(
        source='cuisine_categories',
        many=True,
        read_only=True
    )

    class Meta:
        model = Vendor
        fields = [
            'id',
            'business_name',
            'owner_name',
            'email',
            'phone',
            'logo',
            'description',
            'address',
            'city',
            'area',
            'latitude',
            'longitude',
            'website',
            'social_media',
            'cuisine_categories',
            'cuisine_category_details',
            'status',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'status',
            'created_at',
        ]

    def validate_cuisine_categories(self, value):
        if self.instance and self.instance.status != 'approved':
            raise serializers.ValidationError(
                "Cuisine categories can only be selected after vendor approval."
            )

        return value


# ==========================================
# TOUR OPERATOR PROFILE SERIALIZER
# ==========================================

class TourOperatorProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = TourOperator
        fields = [
            'id',
            'business_name',
            'owner_name',
            'email',
            'phone',
            'logo',
            'description',
            'website',
            'social_media',
            'status',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'status',
            'created_at',
        ]



class FoodExperienceSerializer(serializers.ModelSerializer):

    vendor_business_name = serializers.CharField(
        source='vendor.business_name',
        read_only=True
    )

    experience_category = serializers.PrimaryKeyRelatedField(
        queryset=ExperienceCategory.objects.filter(is_active=True),
        required=False,
        allow_null=True
    )

    experience_category_name = serializers.CharField(
        source='experience_category.name',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = FoodExperience
        fields = [
            'id',
            'title',
            'description',
            'category',
            'experience_category',
            'experience_category_name',
            'price',
            'date',
            'start_time',
            'end_time',
            'capacity',
            'address',
            'city',
            'area',
            'latitude',
            'longitude',
            'image',
            'status',
            'created_at',
            'vendor_business_name',
        ]

        read_only_fields = [
            'id',
            'status',
            'created_at',
        ]

        extra_kwargs = {
            'category': {
                'required': False,
                'allow_blank': True,
            }
        }

    def create(self, validated_data):
        vendor = self.context['request'].user.vendors.first()

        if not vendor:
            raise serializers.ValidationError(
                "You do not have a vendor profile."
            )

        if vendor.status != 'approved':
            raise serializers.ValidationError(
                "Your vendor profile must be approved before creating food experiences."
            )

        experience_category = validated_data.get('experience_category')

        if not experience_category:
            experience_category = ExperienceCategory.objects.get(
                name="Food Discovery"
            )

            validated_data['experience_category'] = experience_category

        if not validated_data.get('category'):
            validated_data['category'] = experience_category.name

        return FoodExperience.objects.create(
            vendor=vendor,
            status='approved',
            **validated_data
        )



class FoodTourSerializer(serializers.ModelSerializer):

    tour_operator_business_name = serializers.CharField(
        source='tour_operator.business_name',
        read_only=True
    )

    tour_category = serializers.PrimaryKeyRelatedField(
        queryset=FoodTourCategory.objects.filter(is_active=True),
        required=False,
        allow_null=True
    )

    tour_category_name = serializers.CharField(
        source='tour_category.name',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = FoodTour
        fields = [
            'id',
            'title',
            'description',
            'tour_category',
            'tour_category_name',
            'city',
            'area',
            'price',
            'date',
            'start_time',
            'end_time',
            'capacity',
            'image',
            'status',
            'created_at',
            'tour_operator_business_name',
        ]

        read_only_fields = [
            'id',
            'status',
            'created_at',
        ]

    def create(self, validated_data):
        operator = self.context['request'].user.tour_operators.first()

        if not operator:
            raise serializers.ValidationError(
                "You do not have a Tour Operator profile."
            )

        if operator.status != 'approved':
            raise serializers.ValidationError(
                "Your Tour Operator profile must be approved before creating food tours."
            )

        if not validated_data.get('tour_category'):
            validated_data['tour_category'] = (
                FoodTourCategory.objects.get(name="Guided Food Tour")
            )

        return FoodTour.objects.create(
            tour_operator=operator,
            status='approved',
            **validated_data
        )


class AvailabilitySessionSerializer(serializers.ModelSerializer):

    remaining_seats = serializers.SerializerMethodField()

    class Meta:
        model = AvailabilitySession
        fields = [
            'id',
            'food_experience',
            'food_tour',
            'date',
            'start_time',
            'end_time',
            'capacity',
            'remaining_seats',
            'is_active',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'remaining_seats',
            'created_at',
        ]

    def get_remaining_seats(self, obj):
        reserved_seats = sum(
            obj.bookings.filter(
                status__in=['pending', 'confirmed']
            ).values_list(
                'number_of_participants',
                flat=True
            )
        )

        return max(0, obj.capacity - reserved_seats)

    def validate(self, attrs):
        instance = self.instance

        food_experience = attrs.get(
            'food_experience',
            instance.food_experience if instance else None
        )

        food_tour = attrs.get(
            'food_tour',
            instance.food_tour if instance else None
        )

        if bool(food_experience) == bool(food_tour):
            raise serializers.ValidationError(
                'A session must belong to either a food experience or a food tour, not both.'
            )

        start_time = attrs.get(
            'start_time',
            instance.start_time if instance else None
        )

        end_time = attrs.get(
            'end_time',
            instance.end_time if instance else None
        )

        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({
                'end_time': 'End time must be later than start time.'
            })

        capacity = attrs.get(
            'capacity',
            instance.capacity if instance else None
        )

        if instance and capacity is not None:
            reserved_seats = sum(
                instance.bookings.filter(
                    status__in=['pending', 'confirmed']
                ).values_list(
                    'number_of_participants',
                    flat=True
                )
            )

            if capacity < reserved_seats:
                raise serializers.ValidationError({
                    'capacity': (
                        f'Capacity cannot be lower than {reserved_seats} '
                        'already reserved seats.'
                    )
                })

        request = self.context.get('request')

        if not request:
            return attrs

        user = request.user

        if food_experience:
            vendor = user.vendors.first()

            if not vendor:
                raise serializers.ValidationError(
                    'Only vendors can manage food experience availability.'
                )

            if vendor.status != 'approved':
                raise serializers.ValidationError(
                    'Your vendor profile must be approved.'
                )

            if food_experience.vendor_id != vendor.id:
                raise serializers.ValidationError(
                    'You can only manage availability for your own experiences.'
                )

        if food_tour:
            operator = user.tour_operators.first()

            if not operator:
                raise serializers.ValidationError(
                    'Only tour operators can manage food tour availability.'
                )

            if operator.status != 'approved':
                raise serializers.ValidationError(
                    'Your Tour Operator profile must be approved.'
                )

            if food_tour.tour_operator_id != operator.id:
                raise serializers.ValidationError(
                    'You can only manage availability for your own tours.'
                )

        return attrs


class TourStopSerializer(serializers.ModelSerializer):

    class Meta:
        model = TourStop
        fields = [
            'id',
            'food_tour',
            'name',
            'description',
            'address',
            'city',
            'area',
            'latitude',
            'longitude',
            'stop_order',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
        ]



class BookingSerializer(serializers.ModelSerializer):

    availability_session = serializers.PrimaryKeyRelatedField(
        queryset=AvailabilitySession.objects.all(),
        required=True
    )

    # Listing information for the My Bookings dashboard
    listing_title = serializers.SerializerMethodField()
    listing_type = serializers.SerializerMethodField()
    listing_url = serializers.SerializerMethodField()

    # Availability session information
    session_date = serializers.DateField(
        source='availability_session.date',
        read_only=True
    )

    session_start_time = serializers.TimeField(
        source='availability_session.start_time',
        read_only=True
    )

    session_end_time = serializers.TimeField(
        source='availability_session.end_time',
        read_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'id',
            'tourist',
            'food_experience',
            'food_tour',
            'listing_title',
            'listing_type',
            'listing_url',
            'availability_session',
            'session_date',
            'session_start_time',
            'session_end_time',
            'number_of_participants',
            'price_per_participant',
            'total_price',
            'status',
            'special_request',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'tourist',
            'listing_title',
            'listing_type',
            'listing_url',
            'session_date',
            'session_start_time',
            'session_end_time',
            'price_per_participant',
            'total_price',
            'status',
            'created_at',
            'updated_at',
        ]

    def get_listing_title(self, obj):
        if obj.food_experience:
            return obj.food_experience.title

        if obj.food_tour:
            return obj.food_tour.title

        return None

    def get_listing_type(self, obj):
        if obj.food_experience:
            return 'Food Experience'

        if obj.food_tour:
            return 'Food Tour'

        return None

    def get_listing_url(self, obj):
        if obj.food_experience:
            return f'/food-experiences/{obj.food_experience_id}'

        if obj.food_tour:
            return f'/food-tours/{obj.food_tour_id}'

        return None

    def validate(self, data):
        food_experience = data.get('food_experience')
        food_tour = data.get('food_tour')
        availability_session = data.get('availability_session')

        if food_experience and food_tour:
            raise serializers.ValidationError(
                "A booking can only be for a food experience or a food tour."
            )

        if not food_experience and not food_tour:
            raise serializers.ValidationError(
                "Please select either a food experience or a food tour."
            )

        if not availability_session:
            raise serializers.ValidationError(
                "Please select an availability session."
            )

        participants = data.get('number_of_participants', 0)

        if participants < 1:
            raise serializers.ValidationError(
                "At least one participant is required."
            )

        if food_experience:
            if availability_session.food_experience_id != food_experience.id:
                raise serializers.ValidationError(
                    "The selected session does not belong to this food experience."
                )

        if food_tour:
            if availability_session.food_tour_id != food_tour.id:
                raise serializers.ValidationError(
                    "The selected session does not belong to this food tour."
                )

        if not availability_session.is_active:
            raise serializers.ValidationError(
                "This availability session is no longer active."
            )

        return data


class BookingUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Booking
        fields = ['status']


class ReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = [
            'id',
            'tourist',
            'food_experience',
            'food_tour',
            'rating',
            'comment',
            'created_at',
            'provider_response',
            'provider_responded_at',
        ]

        read_only_fields = [
            'id',
            'tourist',
            'created_at',
            'provider_response',
            'provider_responded_at',
        ]

    def validate(self, data):
        food_experience = data.get('food_experience')
        food_tour = data.get('food_tour')

        request = self.context['request']
        tourist = request.user

        # A review must belong to either a food experience or a food tour.
        if bool(food_experience) == bool(food_tour):
            raise serializers.ValidationError(
                'A review must belong to either a food experience or a food tour, not both.'
            )

        # Check that the tourist has a confirmed booking.
        booking_filter = {
            'tourist': tourist,
            'status': 'confirmed',
        }

        if food_experience:
            booking_filter['food_experience'] = food_experience
        else:
            booking_filter['food_tour'] = food_tour

        has_booking = Booking.objects.filter(**booking_filter).exists()

        if not has_booking:
            raise serializers.ValidationError(
                'You can only review a food experience or food tour that you have booked and had confirmed.'
            )

        # Prevent the same tourist from reviewing the same item twice.
        existing_review = Review.objects.filter(tourist=tourist)

        if food_experience:
            existing_review = existing_review.filter(
                food_experience=food_experience
            )
        else:
            existing_review = existing_review.filter(
                food_tour=food_tour
            )

        if existing_review.exists():
            raise serializers.ValidationError(
                'You have already submitted a review for this item.'
            )

        return data

    def create(self, validated_data):
        validated_data['tourist'] = self.context['request'].user
        return Review.objects.create(**validated_data)


# ==========================================
# PROVIDER REVIEW SERIALIZER
# ==========================================

class ProviderReviewSerializer(serializers.ModelSerializer):

    tourist_username = serializers.CharField(
        source='tourist.username',
        read_only=True
    )

    food_experience_title = serializers.CharField(
        source='food_experience.title',
        read_only=True,
        allow_null=True
    )

    food_tour_title = serializers.CharField(
        source='food_tour.title',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Review
        fields = [
            'id',
            'tourist_username',
            'food_experience',
            'food_experience_title',
            'food_tour',
            'food_tour_title',
            'rating',
            'comment',
            'created_at',
            'provider_response',
            'provider_responded_at',
        ]

        read_only_fields = [
            'id',
            'tourist_username',
            'food_experience',
            'food_experience_title',
            'food_tour',
            'food_tour_title',
            'rating',
            'comment',
            'created_at',
            'provider_responded_at',
        ]

# ==========================================
# TOURIST REVIEW UPDATE SERIALIZER
# ==========================================

class ReviewUpdateSerializer(serializers.ModelSerializer):

    food_experience_title = serializers.CharField(
        source='food_experience.title',
        read_only=True,
        allow_null=True
    )

    food_tour_title = serializers.CharField(
        source='food_tour.title',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Review
        fields = [
            'id',
            'food_experience',
            'food_tour',
            'food_experience_title',
            'food_tour_title',
            'rating',
            'comment',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'food_experience',
            'food_tour',
            'food_experience_title',
            'food_tour_title',
            'created_at',
        ]

class ItineraryItemSerializer(serializers.ModelSerializer):

    food_experience_title = serializers.CharField(
        source='food_experience.title',
        read_only=True
    )

    food_tour_title = serializers.CharField(
        source='food_tour.title',
        read_only=True
    )

    class Meta:
        model = ItineraryItem
        fields = [
            'id',
            'itinerary',
            'food_experience',
            'food_experience_title',
            'food_tour',
            'food_tour_title',
            'position',
            'notes',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'itinerary',
            'created_at',
        ]

    def validate(self, data):
        food_experience = data.get('food_experience')
        food_tour = data.get('food_tour')

        if bool(food_experience) == bool(food_tour):
            raise serializers.ValidationError(
                'An itinerary item must contain either a food experience or a food tour, not both.'
            )

        if food_experience and food_experience.status != 'approved':
            raise serializers.ValidationError(
                'This food experience is not available.'
            )

        if food_tour and food_tour.status != 'approved':
            raise serializers.ValidationError(
                'This food tour is not available.'
            )

        return data


class ItinerarySerializer(serializers.ModelSerializer):

    items = ItineraryItemSerializer(many=True, read_only=True)

    class Meta:
        model = Itinerary
        fields = [
            'id',
            'title',
            'description',
            'created_at',
            'items',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'items',
        ]


class FavouriteSerializer(serializers.ModelSerializer):

    food_experience_title = serializers.CharField(
        source='food_experience.title',
        read_only=True
    )

    food_tour_title = serializers.CharField(
        source='food_tour.title',
        read_only=True
    )

    class Meta:
        model = Favourite
        fields = [
            'id',
            'food_experience',
            'food_experience_title',
            'food_tour',
            'food_tour_title',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
        ]

    def validate(self, attrs):
        food_experience = attrs.get('food_experience')
        food_tour = attrs.get('food_tour')

        if bool(food_experience) == bool(food_tour):
            raise serializers.ValidationError(
                'Please select either a food experience or a food tour, not both.'
            )

        # Only allow favourites for approved content
        if food_experience and food_experience.status != 'approved':
            raise serializers.ValidationError(
                'Only approved food experiences can be favourited.'
            )

        if food_tour and food_tour.status != 'approved':
            raise serializers.ValidationError(
                'Only approved food tours can be favourited.'
            )

        return attrs
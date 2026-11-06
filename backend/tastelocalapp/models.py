
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User

class TouristProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='tourist_profile'
    )

    profile_image = models.ImageField(
        upload_to='tourist_profiles/',
        blank=True,
        null=True
    )

    phone = models.CharField(max_length=30, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Vendor(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='vendors'
    )

    business_name = models.CharField(max_length=150)
    owner_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30)

    logo = models.ImageField(
        upload_to='vendor_logos/',
        blank=True,
        null=True
    )

    description = models.TextField(blank=True)

    address = models.TextField()
    city = models.CharField(max_length=100)

    area = models.CharField(
        max_length=100,
        blank=True,
        default=''
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    website = models.URLField(blank=True)
    social_media = models.URLField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.business_name


class TourOperator(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tour_operators'
    )

    business_name = models.CharField(max_length=150)
    owner_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30)

    logo = models.ImageField(
        upload_to='tour_operator_logos/',
        blank=True,
        null=True
    )

    description = models.TextField(blank=True)

    website = models.URLField(blank=True)
    social_media = models.URLField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.business_name


class FoodExperience(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    vendor = models.ForeignKey(
        Vendor,
        on_delete=models.CASCADE,
        related_name='experiences'
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    capacity = models.PositiveIntegerField()
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True, default='')
    area = models.CharField(max_length=100, blank=True, default='')

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    image = models.ImageField(
        upload_to='experience_images/',
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class FoodTour(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    tour_operator = models.ForeignKey(
        TourOperator,
        on_delete=models.CASCADE,
        related_name='food_tours'
    )

    title = models.CharField(max_length=200)
    description = models.TextField()

    city = models.CharField(
        max_length=100,
        blank=True,
        default=''
    )

    area = models.CharField(
        max_length=100,
        blank=True,
        default=''
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    capacity = models.PositiveIntegerField()

    image = models.ImageField(
        upload_to='food_tour_images/',
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class TourStop(models.Model):
    food_tour = models.ForeignKey(
        FoodTour,
        on_delete=models.CASCADE,
        related_name='tour_stops'
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100, blank=True, default='')
    area = models.CharField(max_length=100, blank=True, default='')

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True
    )

    stop_order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['stop_order']

    def __str__(self):
        return f"{self.food_tour.title} - {self.name}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    tourist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    food_experience = models.ForeignKey(
        FoodExperience,
        on_delete=models.CASCADE,
        related_name='bookings',
        null=True,
        blank=True
    )

    food_tour = models.ForeignKey(
        FoodTour,
        on_delete=models.CASCADE,
        related_name='bookings',
        null=True,
        blank=True
    )

    number_of_participants = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    special_request = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.food_experience and self.food_tour:
            raise ValidationError(
                'A booking can only be for a food experience or a food tour, not both.'
            )

        if not self.food_experience and not self.food_tour:
            raise ValidationError(
                'A booking must be for a food experience or a food tour.'
            )

    def __str__(self):
        if self.food_experience:
            return f"Booking #{self.id} - {self.food_experience.title}"

        return f"Booking #{self.id} - {self.food_tour.title}"


class Review(models.Model):
    food_experience = models.ForeignKey(
        FoodExperience,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )

    food_tour = models.ForeignKey(
        FoodTour,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True
    )

    tourist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    rating = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )

    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        from django.core.exceptions import ValidationError

        if self.food_experience and self.food_tour:
            raise ValidationError(
                'A review can only be for a food experience or a food tour, not both.'
            )

        if not self.food_experience and not self.food_tour:
            raise ValidationError(
                'A review must be for a food experience or a food tour.'
            )

    def __str__(self):
        if self.food_experience:
            return f"{self.food_experience.title} - {self.rating}/5"

        return f"{self.food_tour.title} - {self.rating}/5"


class Itinerary(models.Model):
    tourist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='itineraries'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title} - {self.tourist.username}'


class ItineraryItem(models.Model):
    itinerary = models.ForeignKey(
        Itinerary,
        on_delete=models.CASCADE,
        related_name='items'
    )
    food_experience = models.ForeignKey(
        FoodExperience,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='itinerary_items'
    )
    food_tour = models.ForeignKey(
        FoodTour,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='itinerary_items'
    )
    position = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'created_at']

    def clean(self):
        from django.core.exceptions import ValidationError

        if bool(self.food_experience) == bool(self.food_tour):
            raise ValidationError(
                'An itinerary item must contain either a food experience or a food tour, not both.'
            )

    def __str__(self):
        return f'Item {self.position} - {self.itinerary.title}'


class Favourite(models.Model):
    tourist = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favourites'
    )

    food_experience = models.ForeignKey(
        FoodExperience,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='favourites'
    )

    food_tour = models.ForeignKey(
        FoodTour,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='favourites'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['tourist', 'food_experience'],
                name='unique_tourist_favourite_experience'
            ),
            models.UniqueConstraint(
                fields=['tourist', 'food_tour'],
                name='unique_tourist_favourite_tour'
            ),
        ]

    def clean(self):
        from django.core.exceptions import ValidationError

        if bool(self.food_experience) == bool(self.food_tour):
            raise ValidationError(
                'A favourite must contain either a food experience or a food tour, not both.'
            )

    def __str__(self):
        if self.food_experience:
            return f'{self.tourist.username} - {self.food_experience.title}'

        return f'{self.tourist.username} - {self.food_tour.title}'


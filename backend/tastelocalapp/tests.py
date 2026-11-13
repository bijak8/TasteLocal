from datetime import date, time
from decimal import Decimal
from types import SimpleNamespace

from django.contrib.auth.models import Group, User
from django.test import TestCase
from rest_framework import serializers

from .models import (
    AvailabilitySession,
    Booking,
    ExperienceCategory,
    Favourite,
    FoodExperience,
    FoodTour,
    FoodTourCategory,
    Itinerary,
    ItineraryItem,
    Review,
    TourOperator,
    Vendor,
)
from .serializers import (
    AvailabilitySessionSerializer,
    BookingSerializer,
    FavouriteSerializer,
    FoodExperienceSerializer,
    FoodTourSerializer,
    ItineraryItemSerializer,
    ReviewSerializer,
    TouristRegistrationSerializer,
)


class TasteLocalUnitTests(TestCase):
    """Twenty focused unit tests for TasteLocal serializer business rules."""

    def setUp(self):
        self.tourist = User.objects.create_user(
            username="tourist_one",
            email="tourist@example.com",
            password="T@steLocalStrongPass2026!",
        )
        self.vendor_user = User.objects.create_user(
            username="vendor_one",
            email="vendor@example.com",
            password="T@steLocalStrongPass2026!",
        )
        self.operator_user = User.objects.create_user(
            username="operator_one",
            email="operator@example.com",
            password="T@steLocalStrongPass2026!",
        )

        self.vendor = Vendor.objects.create(
            user=self.vendor_user,
            business_name="TasteLocal Kitchen",
            owner_name="Aminah",
            email="vendor@example.com",
            phone="0123456789",
            address="123 Food Street",
            city="Kuala Lumpur",
            area="Sentul",
            status="approved",
        )
        self.operator = TourOperator.objects.create(
            user=self.operator_user,
            business_name="KL Food Trails",
            owner_name="Farid",
            email="operator@example.com",
            phone="0191234567",
            status="approved",
        )

        self.experience_category = ExperienceCategory.objects.create(
            name="Food Discovery"
        )
        self.tour_category = FoodTourCategory.objects.create(
            name="Guided Food Tour"
        )

        self.experience = FoodExperience.objects.create(
            vendor=self.vendor,
            title="Traditional Malay Cooking",
            description="Learn to prepare traditional Malay dishes.",
            category="Cooking",
            experience_category=self.experience_category,
            price=Decimal("120.00"),
            date=date(2027, 1, 15),
            start_time=time(10, 0),
            end_time=time(12, 0),
            capacity=10,
            status="approved",
        )
        self.tour = FoodTour.objects.create(
            tour_operator=self.operator,
            title="Little India Food Tour",
            description="Explore local food favourites.",
            tour_category=self.tour_category,
            city="Kuala Lumpur",
            area="Brickfields",
            price=Decimal("80.00"),
            date=date(2027, 1, 16),
            start_time=time(9, 0),
            end_time=time(12, 0),
            capacity=12,
            status="approved",
        )
        self.experience_session = AvailabilitySession.objects.create(
            food_experience=self.experience,
            date=date(2027, 1, 15),
            start_time=time(10, 0),
            end_time=time(12, 0),
            capacity=10,
            is_active=True,
        )
        self.tour_session = AvailabilitySession.objects.create(
            food_tour=self.tour,
            date=date(2027, 1, 16),
            start_time=time(9, 0),
            end_time=time(12, 0),
            capacity=12,
            is_active=True,
        )

    # 1
    def test_tourist_registration_creates_user_profile_and_group(self):
        data = {
            "username": "new_tourist",
            "email": "newtourist@example.com",
            "phone": "0121112222",
            "password": "T@steLocalStrongPass2026!",
        }
        serializer = TouristRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertTrue(user.check_password(data["password"]))
        self.assertTrue(user.groups.filter(name="Tourist").exists())
        self.assertEqual(user.tourist_profile.phone, data["phone"])

    # 2
    def test_tourist_registration_rejects_duplicate_email_case_insensitively(self):
        serializer = TouristRegistrationSerializer(data={
            "username": "another_tourist",
            "email": "TOURIST@example.com",
            "phone": "0121112222",
            "password": "T@steLocalStrongPass2026!",
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    # 3
    def test_tourist_registration_rejects_weak_password(self):
        serializer = TouristRegistrationSerializer(data={
            "username": "weak_password_user",
            "email": "weak@example.com",
            "phone": "0121112222",
            "password": "password",
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    # 4
    def test_approved_vendor_can_create_food_experience(self):
        request = SimpleNamespace(user=self.vendor_user)
        serializer = FoodExperienceSerializer(
            data={
                "title": "Make Kuih",
                "description": "Learn to make traditional kuih.",
                "category": "Cooking",
                "experience_category": self.experience_category.pk,
                "price": "75.00",
                "date": "2027-02-01",
                "start_time": "10:00:00",
                "end_time": "12:00:00",
                "capacity": 8,
                "city": "Kuala Lumpur",
                "area": "Sentul",
            },
            context={"request": request},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        experience = serializer.save()
        self.assertEqual(experience.vendor, self.vendor)
        self.assertEqual(experience.status, "approved")

    # 5
    def test_unapproved_vendor_cannot_create_food_experience(self):
        self.vendor.status = "pending"
        self.vendor.save(update_fields=["status"])
        serializer = FoodExperienceSerializer(
            data={
                "title": "Pending Vendor Class",
                "description": "A cooking class.",
                "category": "Cooking",
                "price": "50.00",
                "date": "2027-02-01",
                "start_time": "10:00:00",
                "end_time": "12:00:00",
                "capacity": 8,
            },
            context={"request": SimpleNamespace(user=self.vendor_user)},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        with self.assertRaises(serializers.ValidationError):
            serializer.save()

    # 6
    def test_approved_operator_can_create_food_tour(self):
        serializer = FoodTourSerializer(
            data={
                "title": "Chinatown Food Walk",
                "description": "Taste local favourites.",
                "tour_category": self.tour_category.pk,
                "city": "Kuala Lumpur",
                "area": "Chinatown",
                "price": "95.00",
                "date": "2027-02-02",
                "start_time": "09:00:00",
                "end_time": "12:00:00",
                "capacity": 10,
            },
            context={"request": SimpleNamespace(user=self.operator_user)},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        tour = serializer.save()
        self.assertEqual(tour.tour_operator, self.operator)
        self.assertEqual(tour.status, "approved")

    # 7
    def test_unapproved_operator_cannot_create_food_tour(self):
        self.operator.status = "pending"
        self.operator.save(update_fields=["status"])
        serializer = FoodTourSerializer(
            data={
                "title": "Pending Operator Tour",
                "description": "A food tour.",
                "tour_category": self.tour_category.pk,
                "price": "95.00",
                "date": "2027-02-02",
                "start_time": "09:00:00",
                "end_time": "12:00:00",
                "capacity": 10,
            },
            context={"request": SimpleNamespace(user=self.operator_user)},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        with self.assertRaises(serializers.ValidationError):
            serializer.save()

    # 8
    def test_availability_session_accepts_one_valid_food_experience(self):
        serializer = AvailabilitySessionSerializer(data={
            "food_experience": self.experience.pk,
            "date": "2027-02-03",
            "start_time": "10:00:00",
            "end_time": "12:00:00",
            "capacity": 6,
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)

    # 9
    def test_availability_session_rejects_both_listing_types(self):
        serializer = AvailabilitySessionSerializer(data={
            "food_experience": self.experience.pk,
            "food_tour": self.tour.pk,
            "date": "2027-02-03",
            "start_time": "10:00:00",
            "end_time": "12:00:00",
            "capacity": 6,
        })
        self.assertFalse(serializer.is_valid())

    # 10
    def test_availability_session_rejects_end_time_before_or_equal_to_start(self):
        serializer = AvailabilitySessionSerializer(data={
            "food_experience": self.experience.pk,
            "date": "2027-02-03",
            "start_time": "12:00:00",
            "end_time": "12:00:00",
            "capacity": 6,
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("end_time", serializer.errors)

    # 11
    def test_availability_capacity_cannot_be_lower_than_reserved_seats(self):
        Booking.objects.create(
            tourist=self.tourist,
            food_experience=self.experience,
            availability_session=self.experience_session,
            number_of_participants=4,
            status="confirmed",
        )
        serializer = AvailabilitySessionSerializer(
            self.experience_session,
            data={"capacity": 3},
            partial=True,
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("capacity", serializer.errors)

    # 12
    def test_booking_accepts_matching_active_session(self):
        serializer = BookingSerializer(data={
            "food_experience": self.experience.pk,
            "availability_session": self.experience_session.pk,
            "number_of_participants": 2,
            "special_request": "Vegetarian meal, please.",
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)

    # 13
    def test_booking_rejects_zero_participants(self):
        serializer = BookingSerializer(data={
            "food_experience": self.experience.pk,
            "availability_session": self.experience_session.pk,
            "number_of_participants": 0,
        })
        self.assertFalse(serializer.is_valid())

    # 14
    def test_booking_rejects_session_belonging_to_another_listing(self):
        serializer = BookingSerializer(data={
            "food_experience": self.experience.pk,
            "availability_session": self.tour_session.pk,
            "number_of_participants": 2,
        })
        self.assertFalse(serializer.is_valid())

    # 15
    def test_booking_rejects_inactive_session(self):
        self.experience_session.is_active = False
        self.experience_session.save(update_fields=["is_active"])
        serializer = BookingSerializer(data={
            "food_experience": self.experience.pk,
            "availability_session": self.experience_session.pk,
            "number_of_participants": 2,
        })
        self.assertFalse(serializer.is_valid())

    # 16
    def test_tourist_can_review_listing_after_confirmed_booking(self):
        Booking.objects.create(
            tourist=self.tourist,
            food_experience=self.experience,
            availability_session=self.experience_session,
            number_of_participants=2,
            status="confirmed",
        )
        serializer = ReviewSerializer(
            data={
                "food_experience": self.experience.pk,
                "rating": 5,
                "comment": "Wonderful experience!",
            },
            context={"request": SimpleNamespace(user=self.tourist)},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        review = serializer.save()
        self.assertEqual(review.tourist, self.tourist)
        self.assertEqual(review.rating, 5)

    # 17
    def test_tourist_cannot_review_without_confirmed_booking(self):
        serializer = ReviewSerializer(
            data={
                "food_experience": self.experience.pk,
                "rating": 4,
                "comment": "Looks interesting.",
            },
            context={"request": SimpleNamespace(user=self.tourist)},
        )
        self.assertFalse(serializer.is_valid())

    # 18
    def test_tourist_cannot_submit_duplicate_review(self):
        Booking.objects.create(
            tourist=self.tourist,
            food_experience=self.experience,
            availability_session=self.experience_session,
            number_of_participants=1,
            status="confirmed",
        )
        Review.objects.create(
            tourist=self.tourist,
            food_experience=self.experience,
            rating=5,
            comment="Already reviewed.",
        )
        serializer = ReviewSerializer(
            data={
                "food_experience": self.experience.pk,
                "rating": 4,
                "comment": "Trying again.",
            },
            context={"request": SimpleNamespace(user=self.tourist)},
        )
        self.assertFalse(serializer.is_valid())

    # 19
    def test_itinerary_item_rejects_unapproved_food_experience(self):
        pending_experience = FoodExperience.objects.create(
            vendor=self.vendor,
            title="Pending Cooking Class",
            description="Not yet approved.",
            category="Cooking",
            price=Decimal("50.00"),
            date=date(2027, 2, 5),
            start_time=time(10, 0),
            end_time=time(11, 0),
            capacity=5,
            status="pending",
        )
        serializer = ItineraryItemSerializer(data={
            "food_experience": pending_experience.pk,
            "position": 1,
        })
        self.assertFalse(serializer.is_valid())

    # 20
    def test_favourite_rejects_unapproved_food_tour(self):
        pending_tour = FoodTour.objects.create(
            tour_operator=self.operator,
            title="Pending Food Tour",
            description="Not yet approved.",
            tour_category=self.tour_category,
            city="Kuala Lumpur",
            area="Chinatown",
            price=Decimal("60.00"),
            date=date(2027, 2, 6),
            start_time=time(9, 0),
            end_time=time(11, 0),
            capacity=8,
            status="pending",
        )
        serializer = FavouriteSerializer(data={"food_tour": pending_tour.pk})
        self.assertFalse(serializer.is_valid())


# Create your tests here.

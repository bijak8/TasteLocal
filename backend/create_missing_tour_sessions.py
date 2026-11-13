
from django.core.exceptions import ValidationError
from django.db import transaction

from tastelocalapp.models import FoodTour, AvailabilitySession

created = 0
skipped = 0
errors = []

print("\nCREATING MISSING FOOD TOUR SESSIONS")
print("=" * 60)

with transaction.atomic():
    for tour in FoodTour.objects.all().order_by("id"):

        existing_sessions = tour.availability_sessions.exists()

        if existing_sessions:
            skipped += 1
            print(
                f"SKIPPED: Tour {tour.id} - {tour.title} "
                f"(already has {tour.availability_sessions.count()} session(s))"
            )
            continue

        if not all([
            tour.date,
            tour.start_time,
            tour.end_time,
            tour.capacity,
        ]):
            errors.append(
                f"Tour {tour.id} - {tour.title}: "
                "Missing date, start time, end time or capacity"
            )
            continue

        session = AvailabilitySession(
            food_tour=tour,
            date=tour.date,
            start_time=tour.start_time,
            end_time=tour.end_time,
            capacity=tour.capacity,
            is_active=True,
        )

        try:
            session.full_clean()
            session.save()
            created += 1

            print(
                f"CREATED: Tour {tour.id} - {tour.title} "
                f"| {session.date} "
                f"| {session.start_time}-{session.end_time} "
                f"| Capacity: {session.capacity}"
            )

        except ValidationError as error:
            errors.append(f"Tour {tour.id} - {tour.title}: {error}")

print("\n" + "=" * 60)
print("SESSION CREATION SUMMARY")
print("New sessions created:", created)
print("Tours skipped (already have sessions):", skipped)
print("Errors:", len(errors))

for error in errors:
    print("ERROR:", error)

print("\nTOTAL FOOD TOUR SESSIONS:",
      AvailabilitySession.objects.filter(food_tour__isnull=False).count())

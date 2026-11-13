
from pathlib import Path

from django.conf import settings
from tastelocalapp.models import FoodTour

IMAGE_DIR = Path(settings.MEDIA_ROOT) / "food_tour_images"

tours = FoodTour.objects.all().order_by("id")

print("\nFOOD TOUR IMAGE ASSIGNMENT")
print("=" * 55)

assigned = 0
skipped = 0
missing = []

for tour in tours:
    image_number = tour.id

    if image_number > 35:
        continue

    filename = f"foodtours{image_number:03d}.jpg"
    image_path = IMAGE_DIR / filename

    if not image_path.is_file():
        missing.append(filename)
        print(f"MISSING: Tour {tour.id} - {filename}")
        continue

    if tour.image:
        skipped += 1
        print(f"SKIPPED: Tour {tour.id} already has {tour.image.name}")
        continue

    # Store the relative media path in the ImageField.
    tour.image.name = f"food_tour_images/{filename}"
    tour.save(update_fields=["image"])

    assigned += 1
    print(f"ASSIGNED: Tour {tour.id} - {tour.title} -> {filename}")

print("\n" + "=" * 55)
print("ASSIGNMENT SUMMARY")
print("New images assigned:", assigned)
print("Existing images preserved:", skipped)
print("Missing image files:", len(missing))

if missing:
    print("Please check these files:")
    for filename in missing:
        print("-", filename)

print("\nImage assignment completed.")

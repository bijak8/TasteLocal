"""Create 30 TasteLocal demo food tours from approved operators/vendors.

Run from the backend directory:
    python manage.py shell < create_food_tours.py

Safe to rerun: existing demo titles are skipped. No existing vendors or
non-demo food tours are changed or deleted.
"""

from datetime import datetime, timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from tastelocalapp.models import Vendor, TourOperator, FoodTour, FoodTourCategory, TourStop

# Category IDs confirmed from the current database inspection:
# 1 Guided Food Tour, 2 Street Food Tour, 3 Heritage Food Tour,
# 4 Cultural Food Tour, 5 Food Trail, 6 Night Food Tour.
TOUR_SPECS = [
    ("Kampong Glam Heritage Food Walk", 3, ["kampong glam", "kampung glam", "bugis", "lavender", "rochor", "jalan besar"]),
    ("Little India Vegetarian Food Trail", 2, ["little india", "jalan besar", "rochor", "lavender"]),
    ("Chinatown Chinese Food Discovery", 1, ["chinatown", "duxton", "telok ayer", "tanjong pagar"]),
    ("Katong and Joo Chiat Heritage Bites", 4, ["katong", "joo chiat", "old airport road", "kallang"]),
    ("Bugis Street Food Adventure", 2, ["bugis", "kampong glam", "rochor", "city hall", "lavender"]),
    ("Singapore Malay Cuisine Journey", 4, ["kampong glam", "changi village", "jurong west", "old airport road", "bedok"]),
    ("Little India Curry and Spice Trail", 3, ["little india", "jalan besar", "rochor", "lavender"]),
    ("Singapore Chinese Dining Trail", 1, ["chinatown", "clarke quay", "singapore river", "boat quay", "tanjong pagar"]),
    ("Eastern Singapore Food Explorer", 2, ["bedok", "bedok reservoir", "tampines", "simei", "upper changi", "changi village"]),
    ("Singapore Dessert Discovery Trail", 6, ["chinatown", "bugis", "katong", "kampong glam", "upper thomson"]),
    ("Kampong Glam Middle Eastern Food Trail", 3, ["kampong glam", "bugis", "lavender", "jalan besar"]),
    ("The Little India Breakfast Trail", 1, ["little india", "jalan besar", "rochor", "lavender"]),
    ("Central Singapore Heritage Food Tour", 4, ["city hall", "civic district", "chinatown", "bugis", "bras basah"]),
    ("Peranakan Flavours of Katong", 4, ["katong", "joo chiat"]),
    ("Singapore Thai Food Experience", 1, ["bugis", "kallang", "chinatown", "little india", "upper thomson"]),
    ("Singapore Evening Food Trail", 6, ["kampong glam", "bugis", "kallang", "chinatown", "clarke quay"]),
    ("Traditional Malay and Nasi Padang Trail", 4, ["kampong glam", "geylang", "macpherson", "serangoon north", "kembangan"]),
    ("Singapore Turkish and Arabic Food Walk", 3, ["kampong glam", "little india", "lavender", "orchard"]),
    ("Singapore Vegetarian Food Journey", 1, ["little india", "chinatown", "city hall", "telok ayer"]),
    ("Singapore Local Favourites Food Trail", 2, ["old airport road", "bedok", "kampong glam", "chinatown", "bugis"]),
    ("Chinatown Heritage and Dessert Walk", 3, ["chinatown", "duxton", "tanjong pagar", "telok ayer"]),
    ("Katong Coastal Food Discovery", 2, ["katong", "joo chiat", "bedok", "old airport road"]),
    ("Singapore Indian Cuisine Experience", 1, ["little india", "jalan besar", "lavender", "rochor"]),
    ("Singapore Family Food Adventure", 2, ["bugis", "kampong glam", "city hall", "chinatown"]),
    ("Singapore Sweet Treats Evening Tour", 6, ["bugis", "chinatown", "katong", "upper thomson", "kampong glam"]),
    ("Singapore Food and Culture Trail", 4, ["kampong glam", "little india", "chinatown", "bugis"]),
    ("Singapore Restaurant Discovery Tour", 1, ["orchard", "city hall", "chinatown", "clarke quay", "kampong glam"]),
    ("Singapore Neighbourhood Food Safari", 5, ["tampines", "bedok", "simei", "kembangan", "serangoon north"]),
    ("Singapore Night Bites and Local Flavours", 6, ["kallang", "bugis", "kampong glam", "chinatown", "clarke quay"]),
    ("The Best of Singapore Food Heritage", 4, ["little india", "kampong glam", "chinatown", "katong", "joo chiat"]),
]


def norm(value):
    return " ".join((value or "").strip().casefold().split())


def distance_sq(vendor, reference):
    if any(value is None for value in (
        vendor.latitude, vendor.longitude,
        reference.latitude, reference.longitude,
    )):
        return float("inf")
    return (
        (float(vendor.latitude) - float(reference.latitude)) ** 2
        + (float(vendor.longitude) - float(reference.longitude)) ** 2
    )


def choose_stops(vendors, preferred_areas, stop_count, tour_index):
    preferred = [v for v in vendors if norm(v.area) in preferred_areas]
    if preferred:
        offset = (tour_index * 2) % len(preferred)
        preferred = preferred[offset:] + preferred[:offset]

    selected = preferred[:stop_count]
    if len(selected) < stop_count:
        remaining = [v for v in vendors if v.id not in {x.id for x in selected}]
        if selected:
            remaining.sort(key=lambda v: distance_sq(v, selected[0]))
        selected.extend(remaining[:stop_count - len(selected)])

    if len(selected) < 3:
        raise RuntimeError(f"Not enough eligible vendors for tour #{tour_index + 1}.")
    return selected[:stop_count]


def seed_food_tours():
    if len(TOUR_SPECS) != 30:
        raise RuntimeError(f"Expected 30 tour definitions, found {len(TOUR_SPECS)}.")

    operators = list(TourOperator.objects.filter(status="approved").order_by("id"))
    vendors = list(
        Vendor.objects.filter(status="approved", city__iexact="Singapore")
        .exclude(address__isnull=True).exclude(address__exact="")
        .exclude(area__isnull=True).exclude(area__exact="")
        .order_by("id")
    )
    if not operators:
        raise RuntimeError("No approved tour operators were found.")
    if len(vendors) < 3:
        raise RuntimeError("Need at least 3 approved Singapore vendors with addresses and areas.")

    category_ids = {spec[1] for spec in TOUR_SPECS}
    categories = {c.id: c for c in FoodTourCategory.objects.filter(id__in=category_ids)}
    missing = category_ids - set(categories)
    if missing:
        raise RuntimeError(f"Food tour categories missing from database: {sorted(missing)}")

    titles = [spec[0] for spec in TOUR_SPECS]
    existing = set(FoodTour.objects.filter(title__in=titles).values_list("title", flat=True))
    created_tours = 0
    created_stops = 0
    skipped = 0
    today = timezone.localdate()

    print(f"Approved tour operators: {len(operators)}")
    print(f"Approved Singapore vendors available: {len(vendors)}")
    print(f"Existing sample tours to skip: {len(existing)}")

    with transaction.atomic():
        for index, (title, category_id, area_names) in enumerate(TOUR_SPECS):
            if title in existing:
                print(f"SKIPPED: {title} (already exists)")
                skipped += 1
                continue

            stop_count = 3 + (index % 3)  # Each tour has 3, 4, or 5 stops.
            selected = choose_stops(
                vendors,
                {norm(area) for area in area_names},
                stop_count,
                index,
            )
            operator = operators[index % len(operators)]
            tour_date = today + timedelta(days=7 + index)
            start_hour = 9 + (index % 3) * 3
            start_time = datetime.strptime(f"{start_hour:02d}:00", "%H:%M").time()
            end_time = (datetime.combine(tour_date, start_time) + timedelta(hours=3)).time()

            areas = {v.area.strip() for v in selected if v.area and v.area.strip()}
            tour_area = next(iter(areas)) if len(areas) == 1 else "Multiple areas"

            tour = FoodTour.objects.create(
                tour_operator=operator,
                title=title,
                description=(
                    f"Explore Singapore's food culture on this {title.lower()}. "
                    "Visit a curated selection of approved local food vendors."
                ),
                tour_category=categories[category_id],
                city="Singapore",
                area=tour_area,
                price=Decimal(str(48 + (index % 8) * 7)),
                date=tour_date,
                start_time=start_time,
                end_time=end_time,
                capacity=12 + (index % 9),
                status="approved",
            )

            for order, vendor in enumerate(selected, start=1):
                TourStop.objects.create(
                    food_tour=tour,
                    name=vendor.business_name,
                    description=(
                        f"Visit {vendor.business_name}, an approved local food vendor, "
                        "as part of this food tour."
                    ),
                    address=vendor.address,
                    city=vendor.city,
                    area=vendor.area,
                    latitude=vendor.latitude,
                    longitude=vendor.longitude,
                    stop_order=order,
                )
                created_stops += 1

            created_tours += 1
            print(
                f"CREATED: {title} | Operator: {operator.business_name} | "
                f"Stops: {stop_count} | Date: {tour_date}"
            )

    print("\n========== SEEDING SUMMARY ==========")
    print(f"New food tours created: {created_tours}")
    print(f"New tour stops created: {created_stops}")
    print(f"Existing sample tours skipped: {skipped}")

    print("\n========== STOP COUNT VERIFICATION ==========")
    for tour in FoodTour.objects.filter(title__in=titles).order_by("id"):
        count = tour.tour_stops.count()
        print(f"{tour.title}: {count} stops")
        if not 3 <= count <= 5:
            raise RuntimeError(f"{tour.title} has {count} stops; expected 3 to 5.")

    print("\nFinished. No vendor records or non-demo food tours were modified.")


seed_food_tours()

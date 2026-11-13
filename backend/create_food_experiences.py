
import random
from datetime import date, time, timedelta
from decimal import Decimal

from django.db import transaction
from django.contrib.auth.models import User

from tastelocalapp.models import (
    Vendor,
    FoodExperience,
    ExperienceCategory,
    AvailabilitySession,
)


# ============================================================
# CONFIGURATION
# ============================================================

TOTAL_EXPERIENCES = 100
AISYAH_EXPERIENCES = 26

AISYAH_USERNAME = "vendor_aisyah"
AISYAH_VENDOR_ID = 2

START_DATE = date(2026, 11, 18)
END_DATE = date(2027, 12, 31)

MIN_PRICE = 50
MAX_PRICE = 350

MIN_SESSIONS = 3
MAX_SESSIONS = 6

RANDOM_SEED = 20261118
rng = random.Random(RANDOM_SEED)

# True = new experiences are automatically approved.
# False = new experiences remain pending.
AUTO_APPROVE_EXPERIENCES = True


# ============================================================
# EXPERIENCE DATA
# First 26 experiences belong to Aisyah.
# Remaining 74 are distributed among other approved vendors.
# ============================================================

experience_names = [

    # --------------------------------------------------------
    # AISYAH - 26 EXPERIENCES
    # --------------------------------------------------------

    ("Traditional Nasi Lemak Cooking Class", "Cooking Class"),
    ("Authentic Rendang Making Workshop", "Cooking Class"),
    ("Malay Kuih Making Experience", "Cooking Class"),
    ("Hands-on Sambal Belacan Workshop", "Food Workshop"),
    ("Traditional Laksa Cooking Class", "Cooking Class"),
    ("Malay Heritage Food Tasting", "Food Tasting"),
    ("Homemade Chicken Satay Experience", "Cooking Class"),
    ("Traditional Mee Siam Cooking Class", "Cooking Class"),
    ("Kampung Style Curry Making", "Cooking Class"),
    ("Authentic Ayam Masak Merah Workshop", "Food Workshop"),
    ("Traditional Onde-Onde Making Class", "Cooking Class"),
    ("Malay Breakfast Food Discovery", "Food Discovery"),
    ("Traditional Ketupat Preparation Class", "Cooking Class"),
    ("Homemade Roti Jala Workshop", "Food Workshop"),
    ("Malay Spiced Fried Chicken Experience", "Food Tasting"),
    ("Traditional Bubur Cha Cha Making", "Cooking Class"),
    ("Heritage Mee Rebus Cooking Class", "Cooking Class"),
    ("Traditional Kuih Lapis Workshop", "Food Workshop"),
    ("Malay Spice and Herb Discovery", "Food Discovery"),
    ("Traditional Asam Pedas Cooking Class", "Cooking Class"),
    ("Kampung Style Ulam and Sambal Tasting", "Food Tasting"),
    ("Homemade Curry Puff Workshop", "Cooking Class"),
    ("Traditional Pulut Inti Making Class", "Cooking Class"),
    ("Malay Festive Food Preparation Experience", "Food Workshop"),
    ("Traditional Serunding Making Workshop", "Food Workshop"),
    ("Malay Heritage Dessert Tasting", "Food Tasting"),

    # --------------------------------------------------------
    # OTHER VENDORS - 74 EXPERIENCES
    # --------------------------------------------------------

    ("Singapore Hawker Food Discovery", "Food Discovery"),
    ("Traditional Roti Prata Making Class", "Cooking Class"),
    ("Indian Biryani Spice Masterclass", "Cooking Class"),
    ("Authentic Masala Dosa Workshop", "Food Workshop"),
    ("South Indian Vegetarian Food Tasting", "Food Tasting"),
    ("Traditional Tandoori Cooking Experience", "Cooking Class"),
    ("Indian Street Food Discovery", "Food Discovery"),
    ("Chinese Dumpling Making Workshop", "Food Workshop"),
    ("Traditional Dim Sum Tasting", "Food Tasting"),
    ("Handmade Chinese Noodle Workshop", "Cooking Class"),
    ("Singapore Chicken Rice Discovery", "Food Discovery"),
    ("Traditional Hainanese Chicken Rice Class", "Cooking Class"),
    ("Chinese Claypot Cooking Experience", "Cooking Class"),
    ("Authentic Mala Spice Tasting", "Food Tasting"),
    ("Chinese Tea and Dim Sum Experience", "Food Tasting"),
    ("Peranakan Heritage Food Discovery", "Food Discovery"),
    ("Traditional Nyonya Laksa Cooking Class", "Cooking Class"),
    ("Nyonya Kueh Making Workshop", "Food Workshop"),
    ("Peranakan Spice Blending Experience", "Food Workshop"),
    ("Traditional Nyonya Dessert Tasting", "Food Tasting"),
    ("Thai Street Food Discovery", "Food Discovery"),
    ("Authentic Thai Curry Cooking Class", "Cooking Class"),
    ("Thai Dessert Making Workshop", "Food Workshop"),
    ("Traditional Thai Mookata Experience", "Food Tasting"),
    ("Thai Herbs and Spices Discovery", "Food Discovery"),
    ("Turkish Kebab Cooking Experience", "Cooking Class"),
    ("Traditional Turkish Baklava Workshop", "Food Workshop"),
    ("Turkish Coffee and Dessert Tasting", "Food Tasting"),
    ("Middle Eastern Mezze Discovery", "Food Discovery"),
    ("Arabic Mandi Rice Cooking Class", "Cooking Class"),
    ("Traditional Hummus Making Workshop", "Food Workshop"),
    ("Middle Eastern Spice Discovery", "Food Discovery"),
    ("Authentic Falafel Cooking Class", "Cooking Class"),
    ("Traditional Kunafa Dessert Workshop", "Food Workshop"),
    ("Arabic Coffee and Dates Tasting", "Food Tasting"),
    ("Singapore Heritage Breakfast Discovery", "Food Discovery"),
    ("Traditional Kaya Toast Experience", "Food Tasting"),
    ("Local Kopi Appreciation Workshop", "Food Workshop"),
    ("Singapore Hawker Dessert Discovery", "Food Discovery"),
    ("Traditional Ice Kachang Making", "Cooking Class"),
    ("Chendol Preparation Workshop", "Food Workshop"),
    ("Traditional Peanut Soup Tasting", "Food Tasting"),
    ("Asian Street Noodle Discovery", "Food Discovery"),
    ("Handmade Udon Noodle Experience", "Cooking Class"),
    ("Traditional Lanzhou Noodle Workshop", "Food Workshop"),
    ("Chinese Hotpot Ingredient Discovery", "Food Discovery"),
    ("Singapore Seafood Tasting Experience", "Food Tasting"),
    ("Traditional Fish Head Curry Cooking", "Cooking Class"),
    ("South Indian Banana Leaf Food Tasting", "Food Tasting"),
    ("Indian Vegetarian Thali Discovery", "Food Discovery"),
    ("Traditional Chapati Making Class", "Cooking Class"),
    ("Indian Samosa Making Workshop", "Food Workshop"),
    ("Traditional Gulab Jamun Workshop", "Cooking Class"),
    ("Indian Masala Chai Appreciation", "Food Tasting"),
    ("Singapore Peranakan Heritage Tasting", "Food Tasting"),
    ("Traditional Popiah Making Class", "Cooking Class"),
    ("Handmade Spring Roll Workshop", "Food Workshop"),
    ("Traditional Chinese Dessert Discovery", "Food Discovery"),
    ("Asian Rice Cake Making Experience", "Cooking Class"),
    ("Traditional Thai Mango Sticky Rice Class", "Cooking Class"),
    ("Thai Tom Yum Cooking Workshop", "Food Workshop"),
    ("Thai Papaya Salad Making Class", "Cooking Class"),
    ("Traditional Turkish Pide Workshop", "Food Workshop"),
    ("Middle Eastern Grilled Meat Experience", "Food Tasting"),
    ("Traditional Arabic Bread Making", "Cooking Class"),
    ("Turkish Mezze and Bread Discovery", "Food Discovery"),
    ("Singapore Muslim Food Heritage Tour", "Food Discovery"),
    ("Traditional Curry Puff Tasting", "Food Tasting"),
    ("Local Hawker Snack Discovery", "Food Discovery"),
    ("Traditional Asian Dessert Workshop", "Food Workshop"),
    ("Singapore Food Culture Experience", "Food Discovery"),
    ("Heritage Restaurant Food Tasting", "Food Tasting"),
    ("Traditional Singapore Laksa Discovery", "Food Discovery"),
    ("Artisan Asian Pastry Making Workshop", "Food Workshop"),
]


# ============================================================
# UNIQUE DESCRIPTION GENERATOR
# Every description must have 16-23 words.
# ============================================================


def create_description(title, vendor_name, category):

    category_details = {
        "Cooking Class": "traditional recipes and practical cooking skills",
        "Food Workshop": "hands-on preparation and creative culinary techniques",
        "Food Tasting": "distinctive flavours and authentic local dishes",
        "Food Discovery": "local food culture and fascinating culinary heritage",
    }

    details = category_details.get(
        category,
        "local food culture and culinary heritage"
    )

    description = (
        f"Discover {title}, exploring {details} "
        "through an engaging Singapore food experience."
    )

    word_count = len(description.split())

    if not 16 <= word_count <= 23:
        raise ValueError(
            f"Description for '{title}' contains {word_count} words. "
            "Expected 16-23 words."
        )

    return description



# ============================================================
# VALIDATE ALL EXPERIENCE DATA BEFORE DATABASE INSERTION
# ============================================================

def validate_experience_data():

    if len(experience_names) != TOTAL_EXPERIENCES:
        raise ValueError(
            f"Expected {TOTAL_EXPERIENCES} experiences, "
            f"but found {len(experience_names)}."
        )

    titles = [title for title, category in experience_names]

    if len(titles) != len(set(titles)):
        raise ValueError("Duplicate experience titles detected.")

    descriptions = [
        create_description(title, "", category)
        for title, category in experience_names
    ]

    if len(descriptions) != len(set(descriptions)):
        raise ValueError("Duplicate experience descriptions detected.")

    required_categories = {
        category for title, category in experience_names
    }

    return required_categories


# ============================================================
# SESSION GENERATOR
# ============================================================

def generate_sessions():

    session_count = rng.randint(
        MIN_SESSIONS,
        MAX_SESSIONS
    )

    date_range = (END_DATE - START_DATE).days

    selected_dates = sorted(
        rng.sample(
            range(date_range + 1),
            session_count
        )
    )

    time_slots = [
        (time(9, 0), time(11, 0)),
        (time(10, 0), time(12, 0)),
        (time(13, 0), time(15, 0)),
        (time(14, 0), time(16, 0)),
        (time(16, 0), time(18, 0)),
        (time(18, 0), time(20, 0)),
    ]

    sessions = []

    for day_offset in selected_dates:

        session_date = START_DATE + timedelta(
            days=day_offset
        )

        start_time, end_time = rng.choice(time_slots)

        capacity = rng.randint(6, 20)

        sessions.append({
            "date": session_date,
            "start_time": start_time,
            "end_time": end_time,
            "capacity": capacity,
        })

    return sessions


# ============================================================
# MAIN CREATION FUNCTION
# ============================================================

def create_food_experiences():

    print("\nValidating experience data...")

    required_categories = validate_experience_data()

    print("100 experience titles verified.")
    print("100 unique descriptions verified.")
    print("All descriptions contain 16-23 words.")

    # --------------------------------------------------------
    # Find Aisyah
    # --------------------------------------------------------

    aisyah_user = User.objects.filter(
        username=AISYAH_USERNAME
    ).first()

    if not aisyah_user:
        raise ValueError(
            f"User '{AISYAH_USERNAME}' was not found."
        )

    aisyah_vendor = Vendor.objects.filter(
        user=aisyah_user,
        id=AISYAH_VENDOR_ID,
        status="approved"
    ).first()

    if not aisyah_vendor:
        raise ValueError(
            "Aisyah's approved vendor record was not found."
        )

    # --------------------------------------------------------
    # Retrieve other approved vendors
    # --------------------------------------------------------

    other_vendors = list(
        Vendor.objects.filter(
            status="approved"
        ).exclude(
            id=aisyah_vendor.id
        ).order_by("id")
    )

    if not other_vendors:
        raise ValueError(
            "No other approved vendors were found."
        )

    # --------------------------------------------------------
    # Retrieve active categories
    # --------------------------------------------------------

    categories = {
        category.name: category
        for category in ExperienceCategory.objects.filter(
            is_active=True
        )
    }

    missing_categories = (
        required_categories - set(categories.keys())
    )

    if missing_categories:
        raise ValueError(
            f"Missing active categories: {missing_categories}"
        )

    # --------------------------------------------------------
    # Check for existing duplicate titles
    # --------------------------------------------------------

    existing_titles = set(
        FoodExperience.objects.filter(
            title__in=[
                title for title, category in experience_names
            ]
        ).values_list("title", flat=True)
    )

    if existing_titles:
        raise ValueError(
            "Some experience titles already exist. "
            "No records were created. Conflicts: "
            + ", ".join(sorted(existing_titles))
        )

    # --------------------------------------------------------
    # Create records
    # --------------------------------------------------------

    created_experiences = 0
    created_sessions = 0

    aisyah_created = 0
    other_created = 0

    print("\nStarting Food Experience creation...\n")

    with transaction.atomic():

        for index, (title, category_name) in enumerate(
            experience_names,
            start=1
        ):

            # Assign first 26 experiences to Aisyah.
            if index <= AISYAH_EXPERIENCES:

                vendor = aisyah_vendor
                aisyah_created += 1

            else:

                vendor_index = (
                    index - AISYAH_EXPERIENCES - 1
                ) % len(other_vendors)

                vendor = other_vendors[vendor_index]
                other_created += 1

            category = categories[category_name]

            price = Decimal(
                str(rng.randint(MIN_PRICE, MAX_PRICE))
            )

            description = create_description(
                title,
                vendor.business_name,
                category_name
            )

            sessions = generate_sessions()

            first_session = sessions[0]

            image_filename = (
                f"experience_images/experience{index:03d}.jpg"
            )

            experience = FoodExperience.objects.create(

                vendor=vendor,

                title=title,

                description=description,

                category=category_name,

                experience_category=category,

                price=price,

                # Legacy required fields.
                # Use the first availability session.

                date=first_session["date"],

                start_time=first_session["start_time"],

                end_time=first_session["end_time"],

                capacity=first_session["capacity"],

                # Copy vendor location details.

                address=vendor.address,

                city=vendor.city,

                area=vendor.area,

                latitude=vendor.latitude,

                longitude=vendor.longitude,

                # Image path.
                # Actual JPG files must be supplied separately.

                image=image_filename,

                status=(
                    "approved"
                    if AUTO_APPROVE_EXPERIENCES
                    else "pending"
                ),
            )

            # Create 3-6 availability sessions.

            for session_data in sessions:

                AvailabilitySession.objects.create(

                    food_experience=experience,

                    date=session_data["date"],

                    start_time=session_data["start_time"],

                    end_time=session_data["end_time"],

                    capacity=session_data["capacity"],

                    is_active=True,
                )

            created_experiences += 1

            created_sessions += len(sessions)

            print(
                f"[{index:03d}/100] "
                f"{title} | "
                f"{vendor.business_name} | "
                f"SGD {price} | "
                f"{len(sessions)} sessions"
            )

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print("\n==========================================")
    print("FOOD EXPERIENCE SEEDING COMPLETED")
    print("==========================================")

    print("New experiences:", created_experiences)

    print("Aisyah's new experiences:", aisyah_created)

    print("Other vendors' new experiences:", other_created)

    print("New availability sessions:", created_sessions)

    print("------------------------------------------")

    print(
        "Aisyah's total experiences:",
        FoodExperience.objects.filter(
            vendor=aisyah_vendor
        ).count()
    )

    print(
        "Database total experiences:",
        FoodExperience.objects.count()
    )

    print(
        "Database total availability sessions:",
        AvailabilitySession.objects.count()
    )

    print("==========================================")

    print(
        "\nImage filenames assigned: "
        "experience001.jpg through experience100.jpg"
    )

    print(
        "Image directory: media/experience_images/"
    )


# ============================================================
# RUN SCRIPT
# ============================================================

if __name__ == "__main__":
    create_food_experiences()

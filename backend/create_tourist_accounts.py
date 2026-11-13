
import csv
import random
import secrets
from collections import Counter
from pathlib import Path

from django.conf import settings
from django.contrib.auth.models import Group, User
from django.db import transaction

from tastelocalapp.models import TouristProfile


# Keep False until we have checked the preview.
CONFIRM_CREATE = True

rng = random.Random(42)

country_counts = {
    "Singapore": 20,
    "Malaysia": 15,
    "Indonesia": 15,
    "China": 15,
    "India": 10,
    "Japan": 8,
    "South Korea": 7,
    "Thailand": 5,
    "Philippines": 5,
}

name_pools = {
    "Singapore": [
        ("Wei Ming", "Tan"), ("Jia Hui", "Lim"),
        ("Hui Ling", "Ng"), ("Daniel", "Goh"),
        ("Xin Yi", "Wong"), ("Arjun", "Nair"),
        ("Priya", "Menon"), ("Nur Aisyah", "Rahman"),
        ("Farhan", "Ismail"), ("Mei Lin", "Chua"),
    ],
    "Malaysia": [
        ("Nurul", "Aziz"), ("Amir", "Hassan"),
        ("Siti", "Rahman"), ("Hakim", "Zulkifli"),
        ("Aina", "Yusof"), ("Wei Jie", "Tan"),
        ("Mei Ling", "Lim"), ("Jason", "Wong"),
        ("Kavitha", "Raman"), ("Rajesh", "Kumar"),
        ("Divya", "Nair"), ("Farah", "Omar"),
        ("Hafiz", "Salleh"), ("Pei Shan", "Lee"),
        ("Arvind", "Subramaniam"),
    ],
    "Indonesia": [
        ("Putri", "Santoso"), ("Andi", "Pratama"),
        ("Dewi", "Lestari"), ("Rizky", "Saputra"),
        ("Ayu", "Wulandari"), ("Budi", "Hartono"),
        ("Sari", "Nugroho"), ("Fajar", "Hidayat"),
        ("Nadia", "Permata"), ("Dimas", "Wijaya"),
    ],
    "China": [
        ("Wei", "Zhang"), ("Li", "Wang"),
        ("Jing", "Liu"), ("Hao", "Chen"),
        ("Mei", "Yang"), ("Jun", "Huang"),
        ("Xiao", "Zhao"), ("Yue", "Wu"),
        ("Tao", "Zhou"), ("Lin", "Xu"),
    ],
    "India": [
        ("Aarav", "Sharma"), ("Ananya", "Patel"),
        ("Rohan", "Mehta"), ("Priya", "Iyer"),
        ("Vikram", "Singh"), ("Neha", "Gupta"),
        ("Aditya", "Rao"), ("Kavya", "Nair"),
        ("Rahul", "Kapoor"), ("Meera", "Joshi"),
    ],
    "Japan": [
        ("Haruto", "Sato"), ("Yui", "Suzuki"),
        ("Ren", "Takahashi"), ("Sakura", "Tanaka"),
        ("Yuto", "Watanabe"), ("Aoi", "Ito"),
        ("Hina", "Yamamoto"), ("Kaito", "Nakamura"),
    ],
    "South Korea": [
        ("Min Jun", "Kim"), ("Seo Yeon", "Lee"),
        ("Ji Woo", "Park"), ("Hyun Woo", "Choi"),
        ("Ha Eun", "Jung"), ("Do Yun", "Kang"),
        ("Su Bin", "Yoon"),
    ],
    "Thailand": [
        ("Nattaya", "Srisuk"), ("Somchai", "Wongchai"),
        ("Pimchanok", "Saetang"), ("Krit", "Chaiyasit"),
        ("Siriporn", "Boonmee"),
    ],
    "Philippines": [
        ("Maria", "Santos"), ("Jose", "Reyes"),
        ("Angela", "Cruz"), ("Paolo", "Garcia"),
        ("Isabella", "Mendoza"),
    ],
}

phone_prefixes = {
    "Singapore": "+65",
    "Malaysia": "+60",
    "Indonesia": "+62",
    "China": "+86",
    "India": "+91",
    "Japan": "+81",
    "South Korea": "+82",
    "Thailand": "+66",
    "Philippines": "+63",
}

bios = [
    "I love exploring local food markets and traditional dishes.",
    "Always searching for authentic street food and hidden gems.",
    "Food, culture, and travel are my favourite adventures.",
    "I enjoy discovering family recipes and regional cuisines.",
    "Travelling across Asia one delicious meal at a time.",
    "I love cooking classes and meeting local food makers.",
    "Excited to discover new flavours and cultural experiences.",
    "Weekend explorer with a passion for food photography.",
]

media_folder = Path(settings.MEDIA_ROOT) / "tourist_profiles"
csv_path = Path(settings.BASE_DIR) / "tourist_test_credentials.csv"

countries = [
    country
    for country, count in country_counts.items()
    for _ in range(count)
]

assert len(countries) == 100
rng.shuffle(countries)

records = []

for number, country in enumerate(countries, start=1):
    username = f"tourist{number:03d}"
    email = f"{username}@quicksender.net"
    image_filename = f"{username}.png"

    first_name, last_name = rng.choice(name_pools[country])

    phone = (
        phone_prefixes[country]
        + str(rng.randint(100000000, 999999999))
    )

    records.append({
        "username": username,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "location": country,
        "phone": phone,
        "bio": rng.choice(bios),
        "profile_image": f"tourist_profiles/{image_filename}",
        "image_filename": image_filename,
    })


# Validate images and existing database accounts.
missing_images = [
    record["image_filename"]
    for record in records
    if not (media_folder / record["image_filename"]).is_file()
]

existing = [
    record["username"]
    for record in records
    if (
        User.objects.filter(username=record["username"]).exists()
        or User.objects.filter(email__iexact=record["email"]).exists()
    )
]

print("\nTASTELOCAL TOURIST ACCOUNT PREVIEW")
print("--------------------------------")
print("Planned accounts:", len(records))
print("Country distribution:", dict(Counter(countries)))
print("Missing images:", len(missing_images))
print("Existing accounts to skip:", len(existing))

if missing_images:
    print("Missing image filenames:", missing_images)

if existing:
    print("Existing usernames/emails:", existing)

if not CONFIRM_CREATE:
    print("\nDRY RUN ONLY. No accounts created.")
    print("Change CONFIRM_CREATE to True when ready.")

elif missing_images:
    print("\nIMPORT CANCELLED: Some profile images are missing.")

else:
    credentials = []
    skipped = []

    with transaction.atomic():
        tourist_group, _ = Group.objects.get_or_create(
            name="Tourist"
        )

        for record in records:
            username = record["username"]
            email = record["email"]

            if (
                User.objects.filter(username=username).exists()
                or User.objects.filter(email__iexact=email).exists()
            ):
                skipped.append(username)
                continue

            password = secrets.token_urlsafe(15)

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=record["first_name"],
                last_name=record["last_name"],
            )

            user.groups.add(tourist_group)

            TouristProfile.objects.create(
                user=user,
                phone=record["phone"],
                location=record["location"],
                bio=record["bio"],
                profile_image=record["profile_image"],
            )

            credentials.append({
                "username": username,
                "email": email,
                "password": password,
                "first_name": record["first_name"],
                "last_name": record["last_name"],
                "location": record["location"],
                "phone": record["phone"],
                "profile_image": record["profile_image"],
            })

    if credentials:
        with csv_path.open(
            "w", newline="", encoding="utf-8"
        ) as csv_file:
            writer = csv.DictWriter(
                csv_file,
                fieldnames=list(credentials[0].keys()),
            )
            writer.writeheader()
            writer.writerows(credentials)

    print("\nIMPORT COMPLETED")
    print("Created:", len(credentials))
    print("Skipped:", len(skipped))
    if credentials:
        print("Credentials CSV:", csv_path)


#!/usr/bin/env python3

"""
TasteLocal - Food Experience Image Downloader

Downloads food photographs from Wikimedia Commons.

Run from the backend folder:

    python download_experience_images.py

To replace existing images:

    python download_experience_images.py --overwrite

Images are saved as:

    media/experience_images/experience001.jpg
    media/experience_images/experience002.jpg
    ...
    media/experience_images/experience100.jpg

An attribution CSV is also generated.
"""

import argparse
import ast
import csv
import io
import json
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request

from pathlib import Path

import certifi


# ============================================================
# CONFIGURATION
# ============================================================

API_URL = "https://commons.wikimedia.org/w/api.php"

# Replace with your own email address.
USER_AGENT = (
    "TasteLocalImageDownloader/1.0 "
    "(contact: missbijak@gmail.com)"
)

SSL_CONTEXT = ssl.create_default_context(
    cafile=certifi.where()
)

OUTPUT_DIR = Path("media") / "experience_images"

SEED_FILE = Path("create_food_experiences.py")

ATTRIBUTION_FILE = Path(
    "experience_image_attributions.csv"
)

# Avoid unnecessary words when creating search queries.
STOP_WORDS = {
    "traditional",
    "authentic",
    "homemade",
    "hands",
    "on",
    "experience",
    "class",
    "workshop",
    "discovery",
    "tasting",
    "appreciation",
    "heritage",
    "food",
    "making",
    "preparation",
    "local",
    "singapore",
    "asian",
    "style",
    "and",
    "the",
    "of",
    "with",
}


# ============================================================
# HTTP REQUEST
# ============================================================

def request_json(url):

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
        }
    )

    with urllib.request.urlopen(
        request,
        timeout=35,
        context=SSL_CONTEXT
    ) as response:

        return json.loads(
            response.read().decode("utf-8")
        )


# ============================================================
# EXTRACT EXPERIENCE TITLES
# ============================================================

def extract_experiences(path):

    if not path.exists():

        raise FileNotFoundError(
            f"Cannot find {path}. "
            "Run this script from the backend folder."
        )

    tree = ast.parse(
        path.read_text(encoding="utf-8"),
        filename=str(path)
    )

    for node in tree.body:

        if isinstance(node, ast.Assign):

            if any(
                isinstance(target, ast.Name)
                and target.id == "experience_names"
                for target in node.targets
            ):

                experiences = ast.literal_eval(
                    node.value
                )

                if (
                    not isinstance(experiences, list)
                    or len(experiences) != 100
                ):

                    raise ValueError(
                        "Expected exactly 100 experience titles."
                    )

                return experiences

    raise ValueError(
        "Could not find experience_names "
        "in create_food_experiences.py."
    )


# ============================================================
# GENERATE SEARCH TERMS
# ============================================================

def search_terms(title):

    words = re.findall(
        r"[A-Za-z0-9]+",
        title
    )

    meaningful_words = [

        word

        for word in words

        if word.lower() not in STOP_WORDS

    ]

    return " ".join(
        meaningful_words[:7]
    ) or title


# ============================================================
# LICENCE INFORMATION
# ============================================================

def allowed_license(metadata):

    """
    Accept all image licences for this school-project demo.

    Licence information is retained in the attribution CSV.
    This does not grant permission for public or commercial reuse.
    """

    short = metadata.get(
        "LicenseShortName", {}
    ).get("value", "")

    terms = metadata.get(
        "UsageTerms", {}
    ).get("value", "")

    return True, (
        short
        or terms
        or "Licence information not supplied"
    )


# ============================================================
# CLEAN HTML METADATA
# ============================================================

def strip_html(value):

    value = re.sub(
        r"<[^>]+>",
        " ",
        value or ""
    )

    return re.sub(
        r"\s+",
        " ",
        value
    ).strip()


# ============================================================
# SCORE SEARCH RESULTS
# ============================================================

def score_candidate(
    experience_title,
    file_title
):

    target = set(
        re.findall(
            r"[a-z0-9]+",
            experience_title.lower()
        )
    ) - STOP_WORDS

    candidate = set(
        re.findall(
            r"[a-z0-9]+",
            file_title.lower()
        )
    )

    candidate -= {
        "file",
        "jpg",
        "jpeg",
        "png",
        "webp",
        "photo",
        "image",
    }

    return (
        len(target & candidate)
        / max(1, len(target))
    )


# ============================================================
# SEARCH WIKIMEDIA COMMONS
# ============================================================

def commons_candidates(query):

    params = {

        "action": "query",

        "format": "json",

        "generator": "search",

        "gsrnamespace": "6",

        "gsrlimit": "20",

        "gsrsearch": query,

        "prop": "imageinfo",

        "iiprop": "url|extmetadata|size|mime",

        "iiurlwidth": "1400",

    }

    request_url = (
        API_URL
        + "?"
        + urllib.parse.urlencode(params)
    )

    data = request_json(request_url)

    pages = data.get(
        "query", {}
    ).get(
        "pages", {}
    )

    return list(pages.values())


# ============================================================
# FIND A MATCHING IMAGE
# ============================================================

def find_image(
    title,
    used_pageids
):

    queries = list(
        dict.fromkeys([
            title,
            search_terms(title),
        ])
    )

    for query in queries:

        try:

            print(
                f"             Searching: {query}"
            )

            pages = commons_candidates(
                query
            )

        except Exception as exc:

            print(
                f"             Search error: {exc}"
            )

            continue

        pages.sort(
            key=lambda page: score_candidate(
                title,
                page.get("title", "")
            ),
            reverse=True
        )

        for page in pages:

            pageid = page.get("pageid")

            info_list = page.get(
                "imageinfo", []
            )

            if (
                not pageid
                or pageid in used_pageids
                or not info_list
            ):

                continue

            info = info_list[0]

            mime = info.get(
                "mime", ""
            )

            if not mime.startswith("image/"):

                continue

            metadata = info.get(
                "extmetadata", {}
            )

            is_allowed, license_name = allowed_license(
                metadata
            )

            if not is_allowed:

                continue

            width = (
                info.get("thumbwidth")
                or info.get("width")
                or 0
            )

            height = (
                info.get("thumbheight")
                or info.get("height")
                or 0
            )

            if (
                width
                and height
                and min(width, height) < 350
            ):

                continue

            image_url = (
                info.get("thumburl")
                or info.get("url")
            )

            if not image_url:

                continue

            return {

                "pageid": pageid,

                "page_title": page.get(
                    "title", ""
                ),

                "image_url": image_url,

                "page_url": info.get(
                    "descriptionurl", ""
                ),

                "license": license_name,

                "artist": strip_html(
                    metadata.get(
                        "Artist", {}
                    ).get("value", "")
                ),

                "credit": strip_html(
                    metadata.get(
                        "Credit", {}
                    ).get("value", "")
                ),

                "description": strip_html(
                    metadata.get(
                        "ImageDescription", {}
                    ).get("value", "")
                ),

            }

    return None


# ============================================================
# DOWNLOAD AND CONVERT TO JPEG
# ============================================================

def download_jpeg(
    url,
    destination
):

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
        }
    )

    with urllib.request.urlopen(
        request,
        timeout=60,
        context=SSL_CONTEXT
    ) as response:

        data = response.read()

    # Check whether the downloaded file is already JPEG.

    if data.startswith(b"\xff\xd8\xff"):

        destination.write_bytes(data)

        return

    # Convert PNG, WebP and other supported formats to JPEG.

    try:

        from PIL import Image

        image = Image.open(
            io.BytesIO(data)
        ).convert("RGB")

        output = io.BytesIO()

        image.save(
            output,
            format="JPEG",
            quality=90,
            optimize=True
        )

        destination.write_bytes(
            output.getvalue()
        )

    except ImportError:

        raise RuntimeError(
            "Pillow is required to convert this image. "
            "Install it using: python -m pip install Pillow"
        )


# ============================================================
# MAIN DOWNLOADER
# ============================================================

def main():

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace existing experience images."
    )

    args = parser.parse_args()

    # Read all 100 experience titles.

    experiences = extract_experiences(
        SEED_FILE
    )

    # Create image directory.

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    used_pageids = set()

    rows = []

    downloaded = 0

    skipped = 0

    failed = 0

    print("\n======================================")

    print(
        "TASTELOCAL IMAGE DOWNLOADER"
    )

    print("======================================")

    print(
        f"Total experiences: {len(experiences)}"
    )

    print(
        f"Destination: {OUTPUT_DIR.resolve()}"
    )

    print("======================================\n")

    # --------------------------------------------------------
    # PROCESS ALL 100 EXPERIENCES
    # --------------------------------------------------------

    for index, (
        title,
        category
    ) in enumerate(
        experiences,
        start=1
    ):

        filename = (
            f"experience{index:03d}.jpg"
        )

        destination = (
            OUTPUT_DIR / filename
        )

        print(
            f"\n[{index:03d}/100] {title}"
        )

        # Keep existing files unless overwrite is requested.

        if (
            destination.exists()
            and not args.overwrite
        ):

            print(
                f"             Existing file kept: {filename}"
            )

            skipped += 1

            rows.append({

                "filename": filename,

                "experience_title": title,

                "category": category,

                "status": "existing file kept",

            })

            continue

        # Find an image.

        match = find_image(
            title,
            used_pageids
        )

        if not match:

            print(
                "             NO MATCH FOUND"
            )

            failed += 1

            rows.append({

                "filename": filename,

                "experience_title": title,

                "category": category,

                "status": "not found - manual selection needed",

            })

            time.sleep(0.5)

            continue

        # Download image.

        try:

            download_jpeg(
                match["image_url"],
                destination
            )

            used_pageids.add(
                match["pageid"]
            )

            downloaded += 1

            print(
                f"             DOWNLOADED: {filename}"
            )

            print(
                f"             SOURCE: {match['page_title']}"
            )

            rows.append({

                "filename": filename,

                "experience_title": title,

                "category": category,

                "status": "downloaded",

                "commons_file": match["page_title"],

                "source_page": match["page_url"],

                "license": match["license"],

                "artist": match["artist"],

                "credit": match["credit"],

                "image_description": match["description"],

            })

        except Exception as exc:

            failed += 1

            print(
                f"             DOWNLOAD FAILED: {exc}"
            )

            rows.append({

                "filename": filename,

                "experience_title": title,

                "category": category,

                "status": f"download failed: {exc}",

                "commons_file": match["page_title"],

                "source_page": match["page_url"],

                "license": match["license"],

            })

        # Avoid sending requests too quickly.

        time.sleep(0.5)

    # ========================================================
    # SAVE ATTRIBUTION CSV
    # ========================================================

    columns = [

        "filename",

        "experience_title",

        "category",

        "status",

        "commons_file",

        "source_page",

        "license",

        "artist",

        "credit",

        "image_description",

    ]

    with ATTRIBUTION_FILE.open(
        "w",
        newline="",
        encoding="utf-8-sig"
    ) as handle:

        writer = csv.DictWriter(
            handle,
            fieldnames=columns
        )

        writer.writeheader()

        writer.writerows(rows)

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print("\n")

    print("======================================")

    print("DOWNLOAD SUMMARY")

    print("======================================")

    print(
        "Downloaded this run:",
        downloaded
    )

    print(
        "Existing files kept:",
        skipped
    )

    print(
        "Not downloaded:",
        failed
    )

    print("--------------------------------------")

    print(
        "Attribution CSV:",
        ATTRIBUTION_FILE.resolve()
    )

    print(
        "Image folder:",
        OUTPUT_DIR.resolve()
    )

    print("======================================")

    print(
        "\nSchool-project use only: "
        "check source details and do not assume "
        "public or commercial reuse is permitted."
    )


# ============================================================
# RUN SCRIPT
# ============================================================

if __name__ == "__main__":

    try:

        main()

    except KeyboardInterrupt:

        print("\nDownload stopped by user.")

        sys.exit(130)

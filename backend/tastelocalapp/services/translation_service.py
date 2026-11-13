
import json
from groq import Groq
from django.conf import settings


def translate_to_bahasa_melayu(title, description):

    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not configured.")

    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional English to Bahasa Melayu "
                    "translator for TasteLocal, a Malaysian food tourism "
                    "platform. Translate naturally into standard Malaysian "
                    "Bahasa Melayu. Preserve Malaysian food names such as "
                    "nasi lemak, rendang, karipap and kuih kochi where "
                    "appropriate. Do not translate business names, brand "
                    "names or place names unnecessarily. Preserve the "
                    "original meaning and do not add information. "
                    "Return valid JSON only, without Markdown or code fences, "
                    'using exactly this structure: '
                    '{"title":"translated title",'
                    '"description":"translated description"}.'
                )
            },
            {
                "role": "user",
                "content": json.dumps({
                    "title": title,
                    "description": description
                }, ensure_ascii=False)
            }
        ],
        temperature=0.2,
        max_tokens=1000
    )

    raw_result = response.choices[0].message.content.strip()

    # Remove accidental Markdown code fences
    if raw_result.startswith("```"):
        raw_result = raw_result.replace("```json", "", 1)
        raw_result = raw_result.replace("```", "").strip()

    result = json.loads(raw_result)

    translated_title = result.get("title")
    translated_description = result.get("description")

    if not isinstance(translated_title, str) or not translated_title.strip():
        raise ValueError("Groq returned an invalid translated title.")

    if not isinstance(translated_description, str):
        raise ValueError("Groq returned an invalid translated description.")

    return {
        "title": translated_title.strip(),
        "description": translated_description.strip()
    }

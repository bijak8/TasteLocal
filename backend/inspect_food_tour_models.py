
from django.apps import apps

model_names = ["Vendor", "TourOperator", "FoodTour", "TourStop"]

for model in apps.get_models():
    if model.__name__ in model_names:
        print("\n" + "=" * 60)
        print("MODEL:", model.__name__)
        print("=" * 60)

        print("\nFIELDS:")
        for field in model._meta.get_fields():
            if hasattr(field, "get_internal_type"):
                print(
                    f"{field.name} | "
                    f"Type: {field.get_internal_type()} | "
                    f"Related: {getattr(field, 'related_model', None)}"
                )

        print("\nRELATIONSHIPS:")
        for field in model._meta.get_fields():
            if field.is_relation:
                print(
                    f"{field.name} -> "
                    f"{getattr(field, 'related_model', None)}"
                )

import csv
import json
from database import SessionLocal
from models.models import CarCompany


def extract_unique_companies():
    unique = set()

    # From CSV
    with open("./data_sources/source_b.csv", newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("company"):
                unique.add(row["company"])

    # From JSON
    with open("./data_sources/source_a.json") as f:
        data = json.load(f)
        for row in data:
            if row.get("company"):
                unique.add(row["company"])

    return sorted(list(unique))

def populate_car_companies():
    session = SessionLocal()
    companies = extract_unique_companies()

    for name in companies:
        session.add(CarCompany(name=name))

    session.commit()
    session.close()
    print(f"✅ Inserted {len(companies)} companies into car_companies table")

if __name__ == "__main__":
    populate_car_companies()

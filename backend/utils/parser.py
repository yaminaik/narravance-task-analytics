# utils/parser.py

import csv
import json
from datetime import datetime
from typing import Dict, List, Any

def parse_date_safe(value: str, fmt: str = "%Y-%m-%d") -> datetime | None:
    try:
        return datetime.strptime(value, fmt)
    except Exception:
        return None

def is_within_filters(row: Dict[str, Any], filters: Dict[str, Any]) -> bool:
    try:
        date = parse_date_safe(row.get("date", ""))
        price = float(row.get("price", 0))
        company = row.get("company", "")

        if not date:
            return False

        # Date range filters
        if filters.get("startDate") and date < parse_date_safe(filters["startDate"]):
            return False
        if filters.get("endDate") and date > parse_date_safe(filters["endDate"]):
            return False

        # Price range filters
        if filters.get("minPrice") and price < float(filters["minPrice"]):
            return False
        if filters.get("maxPrice") and price > float(filters["maxPrice"]):
            return False

        # Company filter
        if filters.get("companies") and company not in filters["companies"]:
            return False

        return True

    except Exception as e:
        print(f"❌ Filtering error on row {row}: {e}")
        return False

def load_csv_data(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    results = []
    file_path = "data_sources/source_b.csv"

    try:
        with open(file_path, newline='', encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if is_within_filters(row, filters):
                    row["source"] = "csv"
                    results.append(row)
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")

    return results

def load_json_data(filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    results = []
    file_path = "data_sources/source_a.json"

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for row in data:
                if is_within_filters(row, filters):
                    row["source"] = "json"
                    results.append(row)
    except Exception as e:
        print(f"❌ Error loading JSON: {e}")

    return results

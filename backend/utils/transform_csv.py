import json
import csv
import random
import pandas as pd
from datetime import datetime

colors = ["Red", "Blue", "Black", "White", "Silver", "Gray"]

import json
import random
from datetime import datetime

# Utility for generating prices
def generate_price(year):
    try:
        year = int(year)
    except:
        year = 2010
    age = max(0, 2025 - year)
    # Ensure prices are positive
    return round(abs(30000 - age * random.uniform(800, 2500) + random.uniform(-1500, 1500)), 2)

# Preprocess JSON Data
def preprocess_json(raw_path="./data_sources/car_sales_data.json", output_path="./data_sources/source_a.json"):
    with open(raw_path) as f:
        raw_data = json.load(f)

    processed_data = []
    for item in raw_data:
        try:
            date_obj = datetime.strptime(item["date"], "%Y-%m-%d")
            if not (datetime(2022, 1, 1) <= date_obj <= datetime(2025, 12, 31)):
                continue

            processed_data.append({
                "company": item.get("Car Make", "Unknown"),
                "model": item.get("Car Model", "Unknown"),
                "price": generate_price(item.get("Car Year")),
                "date": date_obj.strftime("%Y-%m-%d"),
                "color": random.choice(["Red", "Blue", "Black", "White", "Silver", "Gray"]),
                "source": "json"
            })
        except Exception as e:
            print(f"❌ Skipping JSON row: {item} — {e}")

    processed_data.sort(key=lambda x: x["date"])

    with open(output_path, "w") as f:
        json.dump(processed_data, f, indent=2)
    print(f"✅ JSON processed: {len(processed_data)} records saved to {output_path}")


def preprocess_csv(input_path="./data_sources/car_sales_data.csv", output_path="./data_sources/source_b.csv"):
    df = pd.read_csv(input_path)

    df = df.rename(columns={
        'Car Make': 'company',
        'Car Model': 'model',
        'Sale Price': 'price',
        'Date': 'date'
    })

    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    df = df[(df['date'] >= '2022-01-01') & (df['date'] <= '2025-12-31')]

    df['color'] = [random.choice(colors) for _ in range(len(df))]
    df['source'] = 'csv'

    df = df[['company', 'model', 'price', 'date', 'color', 'source']]
    df = df.sort_values(by='date')

    df.to_csv(output_path, index=False)

    print(f"✅ CSV processed: {len(df)} records saved to {output_path}")



if __name__ == "__main__":
    preprocess_json()
    preprocess_csv()

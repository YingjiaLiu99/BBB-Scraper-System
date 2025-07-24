import csv
from typing import List

def export_to_csv(data: List[dict], output_path: str):
    """
    Write a list of BBB dicts to CSV file
    """
    if not data:
        print("No data to export.")
        return

    fieldnames = ["name", "phone", "principal_contact", "url", "address", "accreditation"]

    try:
        with open(output_path, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        print(f"✅ Exported {len(data)} records to {output_path}")
    except Exception as e:
        print(f"❌ Failed to export to CSV: {e}")

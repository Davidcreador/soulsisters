#!/usr/bin/env python3
"""
Excel Data Processor for Soulsisters Inventory
Reads Inventario Soulsisters.xlsx and converts to clean JSON for Convex import
"""

import pandas as pd
import json
import re
from datetime import datetime


def extract_quantity_and_notes(quantity_str):
    """Extract numeric quantity and notes from text field"""
    if pd.isna(quantity_str):
        return 0, ""

    quantity_str = str(quantity_str).strip()

    # Pattern: "0 - se vendio" or "0- se vendio" or "0(se vendio)"
    sold_patterns = [
        r"0\s*-\s*se\s+vendio",
        r"0\s*\(\s*se\s+vendio\s*\)",
        r"0\s*-\s*\(\s*se\s+vendio\s*\)",
    ]

    for pattern in sold_patterns:
        if re.search(pattern, quantity_str, re.IGNORECASE):
            return 0, "se vendio"

    # Pattern: "5 - quedan 1 (arcoiris)"
    quedan_match = re.search(
        r"(\d+)\s*-\s*quedan\s+(\d+)\s*\(([^)]+)\)", quantity_str, re.IGNORECASE
    )
    if quedan_match:
        qty = int(quedan_match.group(1))
        remaining = quedan_match.group(2)
        detail = quedan_match.group(3)
        return qty, f"quedan {remaining} ({detail})"

    # Pattern: "2-(se vendieron)0"
    vendieron_match = re.search(
        r"(\d+)\s*-\s*\(\s*se\s+vendieron\s*\)", quantity_str, re.IGNORECASE
    )
    if vendieron_match:
        return int(vendieron_match.group(1)), "se vendieron"

    # Pattern: Just a number
    try:
        qty = int(float(quantity_str))
        return qty, ""
    except:
        pass

    # Default: try to extract any number
    numbers = re.findall(r"\d+", quantity_str)
    if numbers:
        return int(numbers[0]), quantity_str

    return 0, quantity_str


def clean_price(price_val):
    """Clean and convert price to number"""
    if pd.isna(price_val):
        return 0

    try:
        # Try direct conversion
        return int(float(price_val))
    except:
        # Try to extract number from string
        price_str = str(price_val).strip()
        # Remove any non-numeric characters except decimal point
        cleaned = re.sub(r"[^\d.]", "", price_str)
        if cleaned:
            return int(float(cleaned))
        return 0


def calculate_profit_percentage(store_price, suggested_price):
    """Calculate profit percentage"""
    if store_price == 0:
        return 0
    return round(((suggested_price - store_price) / store_price) * 100)


def get_status(quantity):
    """Determine product status based on quantity"""
    if quantity == 0:
        return "sold"
    elif quantity <= 2:
        return "low-stock"
    else:
        return "available"


def process_excel():
    """Main processing function"""
    print("📊 Processing Excel file...")

    # Read Excel file without headers (data starts immediately)
    excel_path = (
        "/Users/davecodes/dev/soulsisters-inventory/Inventario Soulsisters.xlsx"
    )

    # Skip first 2 rows (merged headers), no column names
    df = pd.read_excel(excel_path, header=None, skiprows=2)

    # Assign column names manually
    df.columns = ["Nombre", "Cantidad", "Precio_Tienda", "Precio_Sugerido", "Ganancia"]

    print(f"📋 Found {len(df)} rows")

    products = []
    errors = []

    for idx, row in df.iterrows():
        try:
            # Skip rows without name or with invalid data
            if (
                pd.isna(row["Nombre"])
                or str(row["Nombre"]).strip() == ""
                or str(row["Nombre"]).strip().lower() == "nan"
            ):
                continue

            name = str(row["Nombre"]).strip()

            # Skip header-like rows or empty rows
            if name in [
                "Nombre",
                "DIA DEL PADRE",
                "Nuevo ",
                "DIA DE LA MADRE",
                "NUEVO",
            ] or name.startswith("NUEVO"):
                continue

            # Extract quantity and notes
            quantity, notes = extract_quantity_and_notes(row["Cantidad"])

            # Clean prices
            store_price = clean_price(row["Precio_Tienda"])
            suggested_price = clean_price(row["Precio_Sugerido"])

            # Get or calculate profit percentage
            if pd.isna(row["Ganancia"]):
                profit_pct = calculate_profit_percentage(store_price, suggested_price)
            else:
                try:
                    profit_pct = int(float(row["Ganancia"]))
                except:
                    profit_pct = calculate_profit_percentage(
                        store_price, suggested_price
                    )

            # Determine status
            status = get_status(quantity)

            # Create product object
            product = {
                "name": name,
                "quantity": quantity,
                "storePrice": store_price,
                "suggestedPrice": suggested_price,
                "profitPercentage": profit_pct,
                "category": "other",  # User will manually assign
                "status": status,
                "notes": notes,
                "dateAdded": "2026-01-29",
            }

            products.append(product)

        except Exception as e:
            errors.append(
                {
                    "row": idx + 3,  # Excel row number (accounting for skipped rows)
                    "name": row.get("Nombre", "Unknown"),
                    "error": str(e),
                }
            )

    print(f"✅ Successfully processed {len(products)} products")

    if errors:
        print(f"⚠️  {len(errors)} products had errors:")
        for err in errors[:5]:  # Show first 5 errors
            print(f"   - Row {err['row']}: {err['name']} - {err['error']}")

    # Save to JSON
    output_path = "/Users/davecodes/DEV/soulsisters-inventory/data/products_clean.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    print(f"💾 Saved to {output_path}")

    # Print summary
    print("\n📈 Summary:")
    print(f"   Total products: {len(products)}")
    print(f"   Available: {sum(1 for p in products if p['status'] == 'available')}")
    print(f"   Sold: {sum(1 for p in products if p['status'] == 'sold')}")
    print(f"   Low stock: {sum(1 for p in products if p['status'] == 'low-stock')}")
    print(f"   With notes: {sum(1 for p in products if p['notes'])}")

    # Show sample products
    print("\n📋 Sample products:")
    for i, p in enumerate(products[:3]):
        print(
            f"   {i + 1}. {p['name'][:40]}... - Qty: {p['quantity']} - Status: {p['status']}"
        )

    return products


if __name__ == "__main__":
    process_excel()

import phonenumbers

def format_phone_number(raw_phone: str) -> str:
    """
    Normalize phone number to E.164 format like +14155552671
    If not parsable, return original or 'N/A'
    """
    if not raw_phone:
        return "N/A"

    try:
        parsed = phonenumbers.parse(raw_phone, "US")
        if phonenumbers.is_valid_number(parsed):
            return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
    except Exception:
        pass

    return raw_phone.strip()

def clean_listing_data(data: dict) -> dict:
    """
    Clean up each field in the scraped company data
    - Trim whitespace
    - Format phone number
    """
    return {
        "name": data.get("name", "").strip(),
        "url": data.get("url", "").strip(),
        "phone": format_phone_number(data.get("phone", "")),
        "principal_contact": data.get("principal_contact", "").strip() if data.get("principal_contact") else "N/A",
        "address": data.get("address", "").strip() if data.get("address") else "N/A",
        "accreditation": data.get("accreditation", "").strip() if data.get("accreditation") else "N/A"
    }

import re

def format_phone_number(phone_str: str) -> str:
    """
    Cleans and formats a phone number.
    Retains leading '+' and digits, strips other characters,
    and formats with standardized spacing if possible.
    """
    if not phone_str:
        return ""
    
    # Strip any text that might be scraping residue
    # e.g., "Phone: 080 1234 5678" -> "080 1234 5678"
    phone_str = re.sub(r'^[Pp]hone:\s*', '', phone_str).strip()
    
    # Check if number is present
    cleaned = ""
    if phone_str.startswith("+"):
        cleaned = "+" + re.sub(r'\D', '', phone_str[1:])
    else:
        cleaned = re.sub(r'\D', '', phone_str)
        
    # Standard Indian mobile format checking (10 digits starting with 6-9)
    # If 10 digits and starts with 6,7,8,9, and we assume it's Indian, we can format it.
    if len(cleaned) == 10 and cleaned[0] in '6789':
        return f"+91 {cleaned[:5]} {cleaned[5:]}"
    elif len(cleaned) == 12 and cleaned.startswith("91") and cleaned[2] in '6789':
        return f"+91 {cleaned[2:7]} {cleaned[7:]}"
    elif len(cleaned) == 13 and cleaned.startswith("+91") and cleaned[3] in '6789':
        return f"+91 {cleaned[3:8]} {cleaned[8:]}"
        
    # Generic format if we can't identify: return cleaned with some spacing
    if len(cleaned) > 4:
        if cleaned.startswith("+"):
            return f"{cleaned[:3]} {cleaned[3:7]} {cleaned[7:]}"
        else:
            return f"{cleaned[:4]} {cleaned[4:8]} {cleaned[8:]}"
            
    return cleaned if cleaned else phone_str

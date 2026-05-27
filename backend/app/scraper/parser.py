from bs4 import BeautifulSoup
import re
from typing import Dict, Any, Optional
from app.utils.phone_formatter import format_phone_number
from app.utils.logger import logger

def parse_business_html(html_content: str) -> Optional[Dict[str, Any]]:
    """
    Fallback parser using BeautifulSoup to parse business detail panel HTML
    in case standard Playwright selectors miss information.
    """
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Extract Business Name
        name_tag = soup.find('h1')
        business_name = name_tag.get_text().strip() if name_tag else ""
        if not business_name:
            return None
            
        # Check if website exists
        # Look for buttons/links with authority or domain-like hrefs
        has_website = False
        authority_link = soup.find('a', attrs={"data-item-id": "authority"})
        if authority_link and authority_link.get('href'):
            has_website = True
            
        if has_website:
            return None
            
        # Extract Rating
        rating = None
        rating_div = soup.find('div', class_='F7nice')
        if rating_div:
            rating_text = rating_div.get_text()
            match = re.search(r'(\d\.\d)', rating_text)
            if match:
                rating = float(match.group(1))
                
        # Extract Category
        category = ""
        category_btn = soup.find('button', class_='DkEaCc')
        if category_btn:
            category = category_btn.get_text().strip()
            
        # Extract Address
        address = ""
        address_btn = soup.find('button', attrs={"data-item-id": "address"})
        if address_btn:
            address = address_btn.get_text().strip()
            
        # Extract Phone
        phone_number = ""
        phone_btn = soup.find('button', attrs={"data-item-id": lambda x: x and x.startswith("phone:")})
        if phone_btn:
            data_id = phone_btn.get("data-item-id", "")
            phone_number = data_id.replace("phone:tel:", "").strip()
        else:
            # Try searching text inside buttons
            phone_buttons = soup.find_all('button', attrs={"data-tooltip": "Copy phone number"})
            if phone_buttons:
                phone_number = phone_buttons[0].get_text().strip()
                
        if phone_number:
            phone_number = format_phone_number(phone_number)
            
        return {
            "business_name": business_name,
            "rating": rating,
            "phone_number": phone_number,
            "address": address,
            "website": None,
            "category": category
        }
    except Exception as e:
        logger.error(f"BeautifulSoup parsing error: {e}")
        return None

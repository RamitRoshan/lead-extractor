import asyncio
import urllib.parse
from typing import List, Dict, Any, Optional
from playwright.async_api import async_playwright, Page, BrowserContext
from app.config import settings
from app.utils.logger import logger
from app.utils.phone_formatter import format_phone_number

# Google Maps Selectors
FEED_SELECTOR = 'div[role="feed"]'
CARD_SELECTOR = 'a[href*="/maps/place/"]'
NAME_SELECTOR = 'h1'  # Inside details panel, the main header
RATING_SELECTOR = 'div.F7nice'  # Contains rating text
CATEGORY_SELECTOR = 'button.DkEaCc'  # Category button/text
ADDRESS_SELECTOR = 'button[data-item-id="address"]'
PHONE_SELECTOR = 'button[data-item-id^="phone:tel:"]'
WEBSITE_SELECTOR = 'a[data-item-id="authority"]'

async def scroll_feed(page: Page, max_results: int = 50) -> None:
    """Scrolls the Google Maps results sidebar to load more listings."""
    logger.info("Scrolling search results panel...")
    
    # Try to find the feed container
    # Sometimes it takes a moment to load
    try:
        await page.wait_for_selector(CARD_SELECTOR, timeout=10000)
    except Exception:
        logger.warning("No search results cards found on the page.")
        return

    # Find the scrollable feed container (parent of the cards)
    # The container usually has role="feed"
    feed_exists = await page.query_selector(FEED_SELECTOR)
    if not feed_exists:
        logger.warning("Feed container role='feed' not found. Scrolling page body instead.")
        
    scroll_attempts = 0
    prev_cards_count = 0
    no_change_count = 0
    
    while scroll_attempts < 15:
        # Check current cards count
        cards = await page.query_selector_all(CARD_SELECTOR)
        current_count = len(cards)
        logger.info(f"Loaded {current_count} business listings so far...")
        
        if current_count >= max_results:
            logger.info(f"Reached targeted max results limit ({max_results}).")
            break
            
        if current_count == prev_cards_count:
            no_change_count += 1
            if no_change_count >= 3:
                # If the count didn't change for 3 scrolls, we might have reached the end
                # Check for "You've reached the end of the list"
                content = await page.content()
                if "reached the end" in content or "No more results" in content:
                    logger.info("Reached the end of Google Maps results.")
                    break
                logger.info("Listing count stable, ending scroll.")
                break
        else:
            no_change_count = 0
            
        prev_cards_count = current_count
        
        # Scroll the feed
        if feed_exists:
            await page.evaluate(f"""
                const feed = document.querySelector('{FEED_SELECTOR}');
                if (feed) {{
                    feed.scrollBy(0, 1500);
                }}
            """)
        else:
            await page.evaluate("window.scrollBy(0, 1000)")
            
        await asyncio.sleep(2.0)
        scroll_attempts += 1

async def get_active_detail_panel(page: Page, expected_name: str = "") -> Any:
    """Finds the active detail panel which is currently on screen."""
    panels = await page.locator('div[role="main"]').all()
    
    if expected_name:
        for panel in reversed(panels):
            h1_loc = panel.locator('h1').first
            if await h1_loc.count() > 0:
                h1_text = await h1_loc.text_content()
                if h1_text and h1_text.strip() == expected_name:
                    return panel

    # Fallback
    for panel in reversed(panels):
        if await panel.locator('h1').count() > 0:
            box = await panel.bounding_box()
            if box and box['x'] >= -100 and box['width'] > 0:
                return panel
    return page

async def extract_lead_details(page: Page, card: Any = None) -> Optional[Dict[str, Any]]:
    """Extracts business details from the active detail panel."""
    try:
        # 0. Get business name from card first to find the correct panel
        business_name = ""
        if card:
            aria_label = await card.get_attribute("aria-label")
            if aria_label:
                business_name = aria_label.strip()
                
        panel = await get_active_detail_panel(page, business_name)
        
        # 1. Check if there is a website link in the active detail panel.
        website_loc = panel.locator(WEBSITE_SELECTOR).first
        if await website_loc.count() > 0:
            website_url = await website_loc.get_attribute("href")
            if website_url:
                logger.info(f"Business has website: {website_url}. Skipping.")
                return None
                
        # 2. Extract Business Name if not already found
        if not business_name:
            name_loc = panel.locator(NAME_SELECTOR).first
            if await name_loc.count() > 0:
                business_name = await name_loc.text_content()
                business_name = business_name.strip() if business_name else ""
                
        if not business_name:
            logger.warning("Could not find business name element.")
            return None
            
        # 3. Extract Rating
        rating = None
        rating_loc = panel.locator(RATING_SELECTOR).first
        if await rating_loc.count() > 0:
            rating_text = await rating_loc.text_content()
            if rating_text:
                rating_match = re_search_rating(rating_text)
                if rating_match:
                    rating = float(rating_match)
                    
        # 4. Extract Category
        category = ""
        category_loc = panel.locator(CATEGORY_SELECTOR).first
        if await category_loc.count() > 0:
            category = await category_loc.text_content()
            category = category.strip() if category else ""
            
        # 5. Extract Address
        address = ""
        address_loc = panel.locator(ADDRESS_SELECTOR).first
        if await address_loc.count() > 0:
            address = await address_loc.text_content()
            address = address.strip() if address else ""
            
        # 6. Extract Phone Number
        phone_number = None
        phone_loc = panel.locator(PHONE_SELECTOR).first
        if await phone_loc.count() > 0:
            data_item_id = await phone_loc.get_attribute("data-item-id")
            if data_item_id and data_item_id.startswith("phone:tel:"):
                phone_number = data_item_id.replace("phone:tel:", "").strip()
            else:
                phone_number = await phone_loc.text_content()
                
        if phone_number:
            phone_number = format_phone_number(phone_number)
            
        return {
            "business_name": business_name,
            "rating": rating,
            "phone_number": phone_number,
            "address": address,
            "website": None,
            "category": category,
        }
    except Exception as e:
        logger.error(f"Error extracting details from card: {e}")
        return None

def re_search_rating(text: str) -> Optional[str]:
    """Helper to extract decimal rating from text like '4.2(34)'"""
    import re
    match = re.search(r'(\d\.\d)', text)
    return match.group(1) if match else None

async def scrape_google_maps(industry: str, location: str, max_results: int = 50) -> List[Dict[str, Any]]:
    """
    Launches Playwright browser, searches Google Maps, scrolls,
    clicks on businesses without website, extracts info, and returns leads list.
    """
    query = f"{industry} in {location}"
    encoded_query = urllib.parse.quote_plus(query)
    url = f"https://www.google.com/maps/search/{encoded_query}"
    
    leads = []
    seen_names = set()
    
    logger.info(f"Launching Playwright (Headless={settings.PLAYWRIGHT_HEADLESS}) for query: '{query}'")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=settings.PLAYWRIGHT_HEADLESS,
            args=[
                "--disable-gpu", 
                "--disable-dev-shm-usage", 
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        )
        
        # Emulate a modern desktop browser user agent
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        
        page = await context.new_page()
        
        try:
            logger.info(f"Navigating to Maps search URL: {url}")
            # Increase timeout to 60s for slow connections
            await page.goto(url, timeout=60000)
            
            # Wait for search results feed or consent screens
            # Sometimes Google prompts with a cookie consent screen
            if "consent.google.com" in page.url or await page.query_selector('form[action*="consent"]'):
                logger.info("Handling Google cookie consent...")
                buttons = await page.query_selector_all('button')
                for btn in buttons:
                    text = await btn.text_content()
                    if text and ("Accept all" in text or "Agree" in text or "Accept" in text):
                        await btn.click()
                        await page.wait_for_load_state("networkidle")
                        logger.info("Consent accepted.")
                        break
            
            # Scroll to load listings
            await scroll_feed(page, max_results)
            
            # Re-fetch cards
            cards = await page.query_selector_all(CARD_SELECTOR)
            logger.info(f"Found {len(cards)} business cards to process.")
            
            # Process each card
            for index, card in enumerate(cards):
                if len(leads) >= max_results:
                    break
                    
                try:
                    # Scroll card into view
                    await card.scroll_into_view_if_needed()
                    
                    # Optimization removed: We now rely purely on checking the detail panel.
                    # This ensures we don't accidentally skip a business just because the text "Website" 
                    # appeared in a review or description snippet inside the card HTML.
                    
                    # Click the card to load the details panel
                    await card.click()
                    # Wait for detail panel transition
                    await asyncio.sleep(1.5)
                    
                    # Extract details
                    details = await extract_lead_details(page, card)
                    if details:
                        business_name = details["business_name"]
                        
                        # Remove duplicates
                        if business_name in seen_names:
                            logger.info(f"Duplicate business name: {business_name}. Skipping.")
                            continue
                            
                        seen_names.add(business_name)
                        details["city"] = location.title()
                        
                        leads.append(details)
                        logger.info(f"Extracted Lead [{len(leads)}]: {business_name} | Phone: {details['phone_number']}")
                        
                except Exception as e:
                    logger.error(f"Error processing card index {index}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error during Google Maps scraping execution: {e}")
        finally:
            await page.close()
            await context.close()
            await browser.close()
            
    # Prioritize leads with phone numbers
    # We sort by phone_number exists descending, then by rating descending
    leads.sort(key=lambda x: (x["phone_number"] is not None and x["phone_number"] != "", x["rating"] or 0.0), reverse=True)
    
    logger.info(f"Scraping completed. Found {len(leads)} leads without website.")
    return leads

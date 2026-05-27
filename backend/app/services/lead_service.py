import re
from datetime import datetime
from sqlalchemy.orm import Session
from app.scraper.browser import scrape_google_maps
from app.database import repository
from app.utils.logger import logger
from typing import Dict, Any, List

def sanitize_name(text: str) -> str:
    """Sanitizes text to be a valid PostgreSQL table name (lowercase, alphabetic/numbers/underscores)"""
    # Replace spaces and special characters with underscore
    sanitized = re.sub(r'[^a-zA-Z0-9]', '_', text.strip().lower())
    # Remove consecutive underscores
    sanitized = re.sub(r'_+', '_', sanitized)
    return sanitized.strip('_')

async def perform_search_and_extract(industry: str, location: str, db: Session) -> Dict[str, Any]:
    """
    Orchestrates the entire scraping flow:
    1. Scrapes Google Maps
    2. Generates dynamic table name (industry + location + timestamp)
    3. Creates dynamic table in Supabase
    4. Saves results to dynamic table
    5. Saves entry to search_history
    """
    # 1. Scrape leads
    logger.info(f"Starting scraping task for industry: '{industry}' in '{location}'")
    scraped_leads = await scrape_google_maps(industry, location)
    
    # 2. Generate unique table name
    timestamp = datetime.now().strftime("%Y_%m_%d_%H%M%S")
    sanitized_industry = sanitize_name(industry)
    sanitized_location = sanitize_name(location)
    table_name = f"{sanitized_industry}_{sanitized_location}_{timestamp}"
    
    # 3. Create the table in database
    repository.create_dynamic_table(table_name)
    
    # 4. Save results to the newly created table
    saved_count = 0
    if scraped_leads:
        saved_count = repository.save_leads(table_name, scraped_leads, db)
        
    # 5. Log into static search_history table
    repository.add_search_history(
        industry=industry,
        location=location,
        table_name=table_name,
        leads_count=saved_count,
        db=db
    )
    
    return {
        "table_name": table_name,
        "leads_count": saved_count,
        "leads": scraped_leads
    }

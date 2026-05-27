from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.schemas import SearchRequest, SearchResultResponse
from app.services import lead_service
from app.utils.logger import logger

router = APIRouter()

@router.post("", response_model=SearchResultResponse)
async def trigger_search(request: SearchRequest, db: Session = Depends(get_db)):
    """
    Triggers the lead extraction scraper.
    Crawls Google Maps, filters out businesses with websites,
    creates a dynamic table, saves leads, and returns the result.
    """
    if not request.industry.strip() or not request.location.strip():
        raise HTTPException(status_code=400, detail="Industry and Location cannot be empty.")
        
    try:
        logger.info(f"Received search request for '{request.industry}' in '{request.location}'")
        result = await lead_service.perform_search_and_extract(
            industry=request.industry.strip(),
            location=request.location.strip(),
            db=db
        )
        return result
    except Exception as e:
        logger.error(f"Search endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during lead extraction: {str(e)}"
        )

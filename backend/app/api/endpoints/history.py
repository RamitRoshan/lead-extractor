from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import repository
from app.models.schemas import SearchHistoryResponse
from typing import List
from app.utils.logger import logger

router = APIRouter()

@router.get("", response_model=List[SearchHistoryResponse])
def get_scraping_history(db: Session = Depends(get_db)):
    """
    Fetches the list of all historical scrape runs from search_history.
    """
    try:
        history = repository.get_search_history(db)
        return history
    except Exception as e:
        logger.error(f"Error fetching search history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve search history."
        )

@router.delete("/{table_name}")
def delete_scraping_history(table_name: str, db: Session = Depends(get_db)):
    """
    Deletes a specific historical scrape run and drops its table.
    """
    try:
        success = repository.delete_search_history(table_name, db)
        if not success:
            raise HTTPException(status_code=404, detail="History not found.")
        return {"status": "success", "message": f"Deleted {table_name}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting search history: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete search history."
        )

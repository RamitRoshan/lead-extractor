from fastapi import APIRouter
from app.api.endpoints import search, history, leads

api_router = APIRouter()

# Include endpoint routes
api_router.include_router(search.router, prefix="/search", tags=["Search & Scraping"])
api_router.include_router(history.router, prefix="/history", tags=["Search History"])
api_router.include_router(leads.router, prefix="/leads", tags=["Leads"])

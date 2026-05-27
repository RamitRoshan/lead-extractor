import sys
from pathlib import Path
import asyncio

# Set ProactorEventLoop on Windows to support subprocesses in asyncio (required by Playwright)
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# Dynamically add the parent directory of 'app' to the Python path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.router import api_router
from app.middleware.cors import setup_cors
from app.database.repository import init_db
from app.utils.logger import logger
import uvicorn
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown database tasks"""
    try:
        loop = asyncio.get_running_loop()
        logger.info(f"Active asyncio event loop: {loop.__class__.__name__}")
    except Exception as e:
        logger.warning(f"Could not log active event loop: {e}")
        
    logger.info("Starting up FastAPI application...")
    try:
        init_db()
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    yield
    logger.info("Shutting down FastAPI application...")

app = FastAPI(
    title="Lead Extractor Web API",
    description="Backend service for scraping and storing business leads without websites.",
    version="1.0.0",
    lifespan=lifespan
)

# Set up CORS
setup_cors(app)

# Include main API router
app.include_router(api_router, prefix="/api")

@app.get("/health", tags=["System"])
def health_check():
    """Simple API health check endpoint"""
    return {
        "status": "healthy",
        "service": "lead-extractor-api",
        "database": "connected"
    }

if __name__ == "__main__":
    # On Windows, reload must be False to allow ProactorEventLoop.
    # Uvicorn's reload mode on Windows forces SelectorEventLoop, which does not support subprocesses (needed by Playwright).
    reload_enabled = sys.platform != 'win32'
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=reload_enabled
    )

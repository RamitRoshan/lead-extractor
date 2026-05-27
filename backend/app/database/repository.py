from sqlalchemy import Table, Column, Integer, String, Float, DateTime, func, select, desc
from sqlalchemy.orm import Session
from app.database.connection import engine, Base, metadata
from app.models.database import SearchHistory
from app.utils.logger import logger
from typing import List, Dict, Any

def init_db():
    """Initialize static tables like search_history"""
    logger.info("Initializing database and creating static tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialization complete.")

def get_dynamic_table(table_name: str) -> Table:
    """Dynamically define a table with the lead columns"""
    return Table(
        table_name,
        metadata,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('business_name', String, nullable=False),
        Column('rating', Float, nullable=True),
        Column('phone_number', String, nullable=True),
        Column('address', String, nullable=True),
        Column('website', String, nullable=True),
        Column('category', String, nullable=True),
        Column('city', String, nullable=True),
        Column('created_at', DateTime, server_default=func.now()),
        extend_existing=True
    )

def create_dynamic_table(table_name: str) -> Table:
    """Create a new dynamic table in the database"""
    table = get_dynamic_table(table_name)
    logger.info(f"Creating dynamic table '{table_name}' in the database...")
    metadata.create_all(bind=engine, tables=[table])
    logger.info(f"Dynamic table '{table_name}' created successfully.")
    return table

def save_leads(table_name: str, leads: List[Dict[str, Any]], db: Session) -> int:
    """Insert a list of leads into the specified dynamic table"""
    if not leads:
        logger.info(f"No leads to save for table {table_name}")
        return 0
        
    table = get_dynamic_table(table_name)
    
    # We use connection level insert for bulk operations
    try:
        # Construct dynamic insert statement
        stmt = table.insert()
        db.execute(stmt, leads)
        db.commit()
        logger.info(f"Successfully inserted {len(leads)} leads into '{table_name}'.")
        return len(leads)
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving leads to '{table_name}': {e}")
        raise e

def add_search_history(industry: str, location: str, table_name: str, leads_count: int, db: Session) -> SearchHistory:
    """Log a search execution in the search_history table"""
    try:
        history_entry = SearchHistory(
            industry=industry,
            location=location,
            table_name=table_name,
            leads_count=leads_count
        )
        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
        logger.info(f"Logged search history entry for table '{table_name}'.")
        return history_entry
    except Exception as e:
        db.rollback()
        logger.error(f"Error logging search history: {e}")
        raise e

def get_search_history(db: Session) -> List[SearchHistory]:
    """Retrieve all search history entries sorted by creation time descending"""
    return db.query(SearchHistory).order_by(desc(SearchHistory.created_at)).all()

def get_leads_from_table(table_name: str, db: Session) -> List[Dict[str, Any]]:
    """Retrieve all leads from a dynamic table as dictionaries"""
    table = get_dynamic_table(table_name)
    
    # If the table doesn't exist, SQLAlchemy query might fail, so let's verify if table exists in DB first
    # Or catch the exception
    try:
        stmt = select(table).order_by(desc(table.c.phone_number.isnot(None)), desc(table.c.rating))
        result = db.execute(stmt)
        # Convert rows to dicts
        # In SQLAlchemy 1.4+, row mapping is accessed via result.mappings()
        leads = [dict(row) for row in result.mappings()]
        return leads
    except Exception as e:
        logger.error(f"Failed to fetch leads from table '{table_name}': {e}")
        return []

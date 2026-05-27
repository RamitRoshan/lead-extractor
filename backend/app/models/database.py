from sqlalchemy import Column, Integer, String, DateTime, Float, func
from app.database.connection import Base

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    industry = Column(String, nullable=False)
    location = Column(String, nullable=False)
    table_name = Column(String, unique=True, nullable=False, index=True)
    leads_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SearchRequest(BaseModel):
    industry: str
    location: str

class LeadSchema(BaseModel):
    business_name: str
    rating: Optional[float] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None

class SearchHistoryResponse(BaseModel):
    id: int
    industry: str
    location: str
    table_name: str
    leads_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class SearchResultResponse(BaseModel):
    table_name: str
    leads_count: int
    leads: List[LeadSchema]

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.database import repository
from app.models.schemas import LeadSchema
from typing import List
import io
import csv
from app.utils.logger import logger

router = APIRouter()

@router.get("/{table_name}", response_model=List[LeadSchema])
def get_leads(table_name: str, db: Session = Depends(get_db)):
    """
    Fetches lead records from a dynamically generated table.
    """
    try:
        leads = repository.get_leads_from_table(table_name, db)
        if not leads and not any(h.table_name == table_name for h in repository.get_search_history(db)):
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")
        return leads
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error fetching leads from '{table_name}': {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve leads from table {table_name}"
        )

@router.get("/{table_name}/csv")
def download_leads_csv(table_name: str, db: Session = Depends(get_db)):
    """
    Generates and returns a CSV file streaming for download.
    Contains all leads in the dynamic table (which are already filtered to have no website).
    """
    try:
        leads = repository.get_leads_from_table(table_name, db)
        if not leads:
            # Check if search history records this table
            history_exists = any(h.table_name == table_name for h in repository.get_search_history(db))
            if not history_exists:
                raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found or empty.")
            
        # Create CSV in-memory stream
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        headers = ["Business Name", "Rating", "Phone Number", "Address", "Website", "Category", "City"]
        writer.writerow(headers)
        
        # Write data rows
        for lead in leads:
            writer.writerow([
                lead.get("business_name", ""),
                lead.get("rating", ""),
                lead.get("phone_number", ""),
                lead.get("address", ""),
                lead.get("website", ""),
                lead.get("category", ""),
                lead.get("city", "")
            ])
            
        output.seek(0)
        
        # Response details
        filename = f"leads_{table_name}.csv"
        headers = {
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers=headers
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error exporting CSV for table '{table_name}': {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate CSV export."
        )

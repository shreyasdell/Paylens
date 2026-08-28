from fastapi import APIRouter, HTTPException
from app.models.state import InvestigationState
from app.agents.workflow import investigation_workflow
from typing import Dict, Any

router = APIRouter()


@router.post("/investigate/incident")
async def investigate_incident(incident_id: str) -> Dict[str, Any]:
    """Investigate a payment incident"""
    try:
        result = await investigation_workflow.investigate_incident(incident_id)
        return {
            "status": "success",
            "data": result.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/investigate/incident/{incident_id}")
async def get_incident_investigation(incident_id: str) -> Dict[str, Any]:
    """Get investigation results for an incident"""
    # This would typically query the database
    return {
        "incident_id": incident_id,
        "message": "Incident investigation results endpoint - to be implemented with database"
    }
from fastapi import APIRouter, HTTPException
from app.models.state import InvestigationState
from app.agents.workflow import investigation_workflow
from typing import Dict, Any

router = APIRouter()


@router.post("/investigate/payment")
async def investigate_payment(payment_id: str) -> Dict[str, Any]:
    """Investigate a single payment failure"""
    try:
        result = await investigation_workflow.investigate_payment(payment_id)
        return {
            "status": "success",
            "data": result.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/investigate/payment/{payment_id}")
async def get_payment_investigation(payment_id: str) -> Dict[str, Any]:
    """Get investigation results for a payment"""
    # This would typically query the database
    return {
        "payment_id": payment_id,
        "message": "Investigation results endpoint - to be implemented with database"
    }
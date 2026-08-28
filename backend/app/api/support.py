from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.state import InvestigationState
from app.agents.workflow import investigation_workflow
from typing import Dict, Any

router = APIRouter()


class SupportQuery(BaseModel):
    query: str


@router.post("/support/query")
async def support_query(query: SupportQuery) -> Dict[str, Any]:
    """Process customer support query"""
    try:
        result = await investigation_workflow.support_query(query.query)
        return {
            "status": "success",
            "data": {
                "customer_explanation": result.customer_explanation,
                "internal_explanation": result.internal_explanation,
                "root_cause": result.root_cause.dict() if result.root_cause else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
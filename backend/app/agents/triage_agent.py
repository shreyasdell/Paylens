from typing import Dict, Any
from app.agents.base import BaseAgent
from app.models.state import InvestigationState, InvestigationType
import logging
import re

logger = logging.getLogger(__name__)


class TriageAgent(BaseAgent):
    """Triage Agent - validates request and identifies investigation type"""
    
    def __init__(self):
        super().__init__("TriageAgent")
    
    async def process(self, state: InvestigationState) -> InvestigationState:
        """Process the triage logic"""
        try:
            # Determine investigation type based on input
            if state.payment_id:
                state.investigation_type = InvestigationType.PAYMENT
                logger.info(f"Payment investigation initiated for: {state.payment_id}")
            elif state.incident_id:
                state.investigation_type = InvestigationType.INCIDENT
                logger.info(f"Incident investigation initiated for: {state.incident_id}")
            elif state.customer_query:
                state.investigation_type = InvestigationType.SUPPORT
                logger.info(f"Support investigation initiated for query: {state.customer_query[:50]}...")
            else:
                raise ValueError("No valid input provided (payment_id, incident_id, or customer_query required)")
            
            # Validate input format
            if state.payment_id and not self._validate_payment_id(state.payment_id):
                raise ValueError(f"Invalid payment_id format: {state.payment_id}")
            
            if state.incident_id and not self._validate_incident_id(state.incident_id):
                raise ValueError(f"Invalid incident_id format: {state.incident_id}")
            
            # Update state
            state.status = "triaged"
            state = self.update_state(state, {
                "investigation_type": state.investigation_type
            })
            
            return state
            
        except Exception as e:
            logger.error(f"Triage failed: {e}")
            state.error_message = f"Triage failed: {str(e)}"
            state.status = "failed"
            return state
    
    def _validate_payment_id(self, payment_id: str) -> bool:
        """Validate payment ID format"""
        # Expected format: PAY_XXXXX where X is digits
        pattern = r'^PAY_\d+$'
        return bool(re.match(pattern, payment_id))
    
    def _validate_incident_id(self, incident_id: str) -> bool:
        """Validate incident ID format"""
        # Expected format: INCXXX where X is digits
        pattern = r'^INC\d+$'
        return bool(re.match(pattern, incident_id))
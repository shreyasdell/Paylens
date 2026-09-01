from typing import Dict, Any
from app.agents.base import BaseAgent
from app.models.state import InvestigationState, InvestigationType
from app.services.llm_service import llm_service
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
            # Try LLM-based triage for smarter categorization
            try:
                llm_type = await self._llm_triage(state)
                if llm_type:
                    state.investigation_type = llm_type
                    logger.info(f"LLM triage identified as: {llm_type.value}")
                else:
                    # Fallback to rule-based
                    state.investigation_type = self._rule_based_triage(state)
                    logger.info(f"Rule-based triage identified as: {state.investigation_type.value}")
            except Exception as e:
                logger.warning(f"LLM triage failed, falling back to rule-based: {e}")
                state.investigation_type = self._rule_based_triage(state)
                logger.info(f"Rule-based triage identified as: {state.investigation_type.value}")
            
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
    
    def _rule_based_triage(self, state: InvestigationState) -> InvestigationType:
        """Rule-based triage logic (fallback)"""
        if state.payment_id:
            return InvestigationType.PAYMENT
        elif state.incident_id:
            return InvestigationType.INCIDENT
        elif state.customer_query:
            return InvestigationType.SUPPORT
        else:
            raise ValueError("No valid input provided (payment_id, incident_id, or customer_query required)")
    
    async def _llm_triage(self, state: InvestigationState) -> InvestigationType:
        """Use LLM for smarter triage"""
        input_data = {
            "payment_id": state.payment_id,
            "incident_id": state.incident_id,
            "customer_query": state.customer_query
        }
        
        llm_response = await llm_service.triage_investigation(input_data)
        
        # Parse LLM response
        response_lower = llm_response.lower().strip()
        
        if "payment" in response_lower:
            return InvestigationType.PAYMENT
        elif "incident" in response_lower:
            return InvestigationType.INCIDENT
        elif "support" in response_lower:
            return InvestigationType.SUPPORT
        else:
            # If LLM response is unclear, fall back to rule-based
            return None
    
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
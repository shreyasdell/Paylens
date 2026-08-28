from typing import Dict, Any, Optional
from app.models.state import InvestigationState
import logging

logger = logging.getLogger(__name__)


class BaseAgent:
    """Base class for all investigation agents"""
    
    def __init__(self, name: str):
        self.name = name
    
    async def execute(self, state: InvestigationState) -> InvestigationState:
        """Execute the agent's logic"""
        try:
            logger.info(f"Executing {self.name} agent")
            result = await self.process(state)
            logger.info(f"Completed {self.name} agent")
            return result
        except Exception as e:
            logger.error(f"Error in {self.name} agent: {e}")
            state.error_message = f"{self.name} agent failed: {str(e)}"
            state.status = "failed"
            return state
    
    async def process(self, state: InvestigationState) -> InvestigationState:
        """Process method to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement process method")
    
    def update_state(self, state: InvestigationState, updates: Dict[str, Any]) -> InvestigationState:
        """Update state with new information"""
        for key, value in updates.items():
            if hasattr(state, key):
                setattr(state, key, value)
        state.updated_at = state.updated_at  # Trigger update
        return state
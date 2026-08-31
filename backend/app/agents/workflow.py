from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, END
from app.models.state import InvestigationState
from app.agents.triage_agent import TriageAgent
from app.agents.evidence_agent import EvidenceAgent
from app.agents.root_cause_agent import RootCauseAgent
from app.agents.resolution_agent import ResolutionAgent
from app.agents.explanation_agent import ExplanationAgent
import logging

logger = logging.getLogger(__name__)


class InvestigationWorkflow:
    """LangGraph workflow for payment investigation"""
    
    def __init__(self):
        self.graph = None
        self.triage_agent = TriageAgent()
        self.evidence_agent = EvidenceAgent()
        self.root_cause_agent = RootCauseAgent()
        self.resolution_agent = ResolutionAgent()
        self.explanation_agent = ExplanationAgent()
        self._build_graph()
    
    def _build_graph(self):
        """Build the LangGraph workflow"""
        try:
            # Create a new graph with Pydantic state
            workflow = StateGraph(InvestigationState)
            
            # Add nodes (agents)
            workflow.add_node("triage", self._triage_node)
            workflow.add_node("gather_evidence", self._evidence_node)
            workflow.add_node("root_cause_analysis", self._root_cause_node)
            workflow.add_node("resolution", self._resolution_node)
            workflow.add_node("explanation", self._explanation_node)
            workflow.add_node("human_review", self._human_review_node)
            
            # Define edges
            workflow.set_entry_point("triage")
            
            # Triage -> Evidence
            workflow.add_edge("triage", "gather_evidence")
            
            # Evidence -> Root Cause
            workflow.add_edge("gather_evidence", "root_cause_analysis")
            
            # Root Cause -> Resolution (with confidence-based routing)
            workflow.add_conditional_edges(
                "root_cause_analysis",
                self._route_after_root_cause,
                {
                    "resolution": "resolution",
                    "human_review": "human_review"
                }
            )
            
            # Resolution -> Explanation
            workflow.add_edge("resolution", "explanation")
            
            # Human Review -> Explanation (after human review)
            workflow.add_edge("human_review", "explanation")
            
            # Explanation -> END
            workflow.add_edge("explanation", END)
            
            # Compile the graph
            self.graph = workflow.compile()
            
            logger.info("LangGraph workflow built successfully")
            
        except Exception as e:
            logger.error(f"Failed to build workflow: {e}")
            raise
    
    async def _triage_node(self, state: InvestigationState) -> InvestigationState:
        """Triage node"""
        return await self.triage_agent.execute(state)
    
    async def _evidence_node(self, state: InvestigationState) -> InvestigationState:
        """Evidence gathering node"""
        return await self.evidence_agent.execute(state)
    
    async def _root_cause_node(self, state: InvestigationState) -> InvestigationState:
        """Root cause analysis node"""
        return await self.root_cause_agent.execute(state)
    
    async def _resolution_node(self, state: InvestigationState) -> InvestigationState:
        """Resolution node"""
        return await self.resolution_agent.execute(state)
    
    async def _explanation_node(self, state: InvestigationState) -> InvestigationState:
        """Explanation node"""
        return await self.explanation_agent.execute(state)
    
    async def _human_review_node(self, state: InvestigationState) -> InvestigationState:
        """Human review node"""
        logger.info("Human review required - pausing for manual intervention")
        state.status = "awaiting_human_review"
        # In a real implementation, this would pause and wait for human input
        # For now, we'll mark it and continue to explanation
        state.status = "human_review_completed"
        return state
    
    def _route_after_root_cause(self, state: InvestigationState) -> Literal["resolution", "human_review"]:
        """Route after root cause analysis based on confidence"""
        if state.requires_human_review:
            return "human_review"
        else:
            return "resolution"
    
    async def investigate(self, initial_state: InvestigationState) -> InvestigationState:
        """Run the investigation workflow"""
        try:
            logger.info(f"Starting investigation: {initial_state.investigation_type}")
            
            # Run the graph - it returns the state object directly
            final_state = await self.graph.ainvoke(initial_state)
            
            logger.info(f"Investigation completed with status: {final_state.status}")
            return final_state
            
        except Exception as e:
            logger.error(f"Investigation failed: {e}")
            initial_state.error_message = f"Investigation failed: {str(e)}"
            initial_state.status = "failed"
            return initial_state
    
    async def investigate_payment(self, payment_id: str) -> InvestigationState:
        """Convenience method for payment investigation"""
        initial_state = InvestigationState(
            payment_id=payment_id,
            investigation_type="payment"
        )
        return await self.investigate(initial_state)
    
    async def investigate_incident(self, incident_id: str) -> InvestigationState:
        """Convenience method for incident investigation"""
        initial_state = InvestigationState(
            incident_id=incident_id,
            investigation_type="incident"
        )
        return await self.investigate(initial_state)
    
    async def support_query(self, customer_query: str) -> InvestigationState:
        """Convenience method for support query"""
        initial_state = InvestigationState(
            customer_query=customer_query,
            investigation_type="support"
        )
        return await self.investigate(initial_state)


# Singleton instance
investigation_workflow = InvestigationWorkflow()
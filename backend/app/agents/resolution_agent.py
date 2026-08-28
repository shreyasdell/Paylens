from typing import Dict, Any
from app.agents.base import BaseAgent
from app.models.state import InvestigationState, Recommendation, ConfidenceLevel
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class ResolutionAgent(BaseAgent):
    """Resolution Agent - suggests next steps and recommendations"""
    
    def __init__(self):
        super().__init__("ResolutionAgent")
    
    async def process(self, state: InvestigationState) -> InvestigationState:
        """Process resolution recommendation"""
        try:
            logger.info("Generating resolution recommendations")
            
            if not state.root_cause:
                logger.warning("No root cause identified, cannot generate recommendation")
                state.recommendation = Recommendation(
                    action="Manual investigation required",
                    priority="HIGH",
                    estimated_impact="Unable to determine without root cause",
                    steps=["Review available evidence", "Perform manual investigation", "Escalate if needed"],
                    requires_automation=False
                )
                state.requires_human_review = True
                return state
            
            # Generate recommendation based on root cause and confidence
            recommendation = await self._generate_recommendation(state)
            state.recommendation = recommendation
            
            # Determine if human review is required based on confidence
            state.requires_human_review = self._requires_human_review(state)
            
            logger.info(f"Recommendation generated: {recommendation.action}")
            logger.info(f"Human review required: {state.requires_human_review}")
            
            state.status = "recommendation_generated"
            return state
            
        except Exception as e:
            logger.error(f"Resolution generation failed: {e}")
            state.error_message = f"Resolution generation failed: {str(e)}"
            state.status = "failed"
            return state
    
    async def _generate_recommendation(self, state: InvestigationState) -> Recommendation:
        """Generate recommendation based on root cause"""
        root_cause = state.root_cause
        confidence = state.confidence
        
        # Define recommendations for each root cause category
        recommendations_map = {
            "E1001": self._fraud_decline_recommendation,
            "E2012": self._issuer_timeout_recommendation,
            "E3011": self._network_failure_recommendation,
            "E4015": self._duplicate_payment_recommendation,
            "E5003": self._bank_unavailable_recommendation,
            "UNKNOWN": self._unknown_recommendation
        }
        
        category_value = root_cause.category.value
        recommendation_func = recommendations_map.get(category_value, self._unknown_recommendation)
        
        return recommendation_func(state, confidence)
    
    def _fraud_decline_recommendation(self, state: InvestigationState, confidence: float) -> Recommendation:
        """Generate recommendation for fraud decline"""
        if confidence >= settings.HIGH_CONFIDENCE_THRESHOLD / 100:
            return Recommendation(
                action="Request additional customer verification",
                priority="HIGH",
                estimated_impact="Prevents potential fraud while allowing legitimate customers",
                steps=[
                    "Request additional ID verification from customer",
                    "Offer alternative payment methods",
                    "Review customer's transaction history",
                    "Update fraud risk profile if legitimate"
                ],
                requires_automation=False
            )
        else:
            return Recommendation(
                action="Manual fraud review required",
                priority="HIGH",
                estimated_impact="Requires human judgment for fraud assessment",
                steps=[
                    "Review transaction details manually",
                    "Analyze customer behavior patterns",
                    "Contact customer for verification",
                    "Make final decision on transaction validity"
                ],
                requires_automation=False
            )
    
    def _issuer_timeout_recommendation(self, state: InvestigationState, confidence: float) -> Recommendation:
        """Generate recommendation for issuer timeout"""
        if confidence >= settings.HIGH_CONFIDENCE_THRESHOLD / 100:
            return Recommendation(
                action="Implement retry with exponential backoff",
                priority="MEDIUM",
                estimated_impact="Automatically recover from transient timeouts",
                steps=[
                    "Implement retry logic with exponential backoff",
                    "Set maximum retry attempts (3-5)",
                    "Monitor retry success rate",
                    "Escalate if retries continue failing"
                ],
                requires_automation=True
            )
        else:
            return Recommendation(
                action="Monitor and investigate issuer status",
                priority="MEDIUM",
                estimated_impact="Requires monitoring before taking action",
                steps=[
                    "Check issuer status page",
                    "Monitor timeout rates for next 15 minutes",
                    "Review network connectivity",
                    "Decide on retry strategy based on monitoring"
                ],
                requires_automation=False
            )
    
    def _network_failure_recommendation(self, state: InvestigationState, confidence: float) -> Recommendation:
        """Generate recommendation for network failure"""
        if confidence >= settings.HIGH_CONFIDENCE_THRESHOLD / 100:
            return Recommendation(
                action="Switch to backup network path",
                priority="HIGH",
                estimated_impact="Maintain service availability during network issues",
                steps=[
                    "Activate backup network route",
                    "Monitor connection stability",
                    "Continue normal operations",
                    "Revert to primary path when stable"
                ],
                requires_automation=True
            )
        else:
            return Recommendation(
                action="Investigate network infrastructure",
                priority="HIGH",
                estimated_impact="Network issues require immediate attention",
                steps=[
                    "Check network connectivity between services",
                    "Review DNS resolution",
                    "Verify firewall rules",
                    "Contact network team if needed"
                ],
                requires_automation=False
            )
    
    def _duplicate_payment_recommendation(self, state: InvestigationState, confidence: float) -> Recommendation:
        """Generate recommendation for duplicate payment"""
        return Recommendation(
            action="Process refund for duplicate charge",
            priority="HIGH",
            estimated_impact="Customer satisfaction and compliance",
            steps=[
                "Identify all duplicate transactions",
                "Initiate refund for duplicate charges",
                "Notify affected customer",
                "Implement idempotency checks to prevent recurrence"
            ],
            requires_automation=True
        )
    
    def _bank_unavailable_recommendation(self, state: InvestigationState, confidence: float) -> Recommendation:
        """Generate recommendation for bank unavailable"""
        if confidence >= settings.HIGH_CONFIDENCE_THRESHOLD / 100:
            return Recommendation(
                action="Route transactions to alternative banks",
                priority="CRITICAL",
                estimated_impact="Maintain payment processing during bank outages",
                steps=[
                    "Activate alternative payment rails",
                    "Reroute traffic to backup banks",
                    "Display maintenance message to customers",
                    "Monitor alternative bank performance"
                ],
                requires_automation=True
            )
        else:
            return Recommendation(
                action="Contact bank support and monitor",
                priority="HIGH",
                estimated_impact="Bank outage requires immediate attention",
                steps=[
                    "Check bank status page",
                    "Contact bank technical support",
                    "Monitor bank API availability",
                    "Prepare alternative routing if needed"
                ],
                requires_automation=False
            )
    
    def _unknown_recommendation(self, state: InvestigationState, confidence: float) -> Recommendation:
        """Generate recommendation for unknown root cause"""
        return Recommendation(
            action="Escalate for manual investigation",
            priority="HIGH",
            estimated_impact="Unknown issues require human expertise",
            steps=[
                "Review all available evidence",
                "Escalate to senior engineer",
                "Perform detailed system analysis",
                "Document findings for future reference"
            ],
            requires_automation=False
        )
    
    def _requires_human_review(self, state: InvestigationState) -> bool:
        """Determine if human review is required based on confidence"""
        confidence = state.confidence
        
        if confidence >= settings.HIGH_CONFIDENCE_THRESHOLD / 100:
            # High confidence - can proceed automatically
            return False
        elif confidence >= settings.MEDIUM_CONFIDENCE_THRESHOLD / 100:
            # Medium confidence - support review
            return True
        else:
            # Low confidence - human escalation required
            return True
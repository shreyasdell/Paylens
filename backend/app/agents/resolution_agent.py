from typing import Dict, Any
from app.agents.base import BaseAgent
from app.models.state import InvestigationState, Recommendation, ConfidenceLevel
from app.core.config import settings
from app.services.llm_service import llm_service
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
            
            # Try LLM-based recommendation first
            try:
                llm_recommendation = await self._llm_recommendation(state)
                if llm_recommendation:
                    state.recommendation = llm_recommendation
                    logger.info(f"LLM recommendation generated: {llm_recommendation.action}")
                else:
                    # Fallback to rule-based
                    recommendation = await self._generate_recommendation(state)
                    state.recommendation = recommendation
                    logger.info(f"Rule-based recommendation generated: {recommendation.action}")
            except Exception as e:
                logger.warning(f"LLM recommendation failed, falling back to rule-based: {e}")
                recommendation = await self._generate_recommendation(state)
                state.recommendation = recommendation
                logger.info(f"Rule-based recommendation generated: {recommendation.action}")
            
            # Determine if human review is required based on confidence
            state.requires_human_review = self._requires_human_review(state)
            
            logger.info(f"Human review required: {state.requires_human_review}")
            
            state.status = "recommendation_generated"
            return state
            
        except Exception as e:
            logger.error(f"Resolution generation failed: {e}")
            state.error_message = f"Resolution generation failed: {str(e)}"
            state.status = "failed"
            return state
    
    async def _llm_recommendation(self, state: InvestigationState) -> Recommendation:
        """Use LLM to generate recommendation"""
        root_cause_str = f"{state.root_cause.category.value} - {state.root_cause.description}"
        context = {
            "root_cause": root_cause_str,
            "confidence": state.confidence,
            "transaction": state.transaction.__dict__ if state.transaction else None,
            "incidents": len(state.incidents) if state.incidents else 0
        }
        
        llm_response = await llm_service.generate_recommendation(root_cause_str, context)
        
        # Parse LLM response to extract recommendation components
        # This is a simplified parser - in production you'd want more robust parsing
        response_lower = llm_response.lower()
        
        # Extract action (first line or first sentence)
        action = llm_response.split('\n')[0].strip()
        if len(action) > 200:
            action = action[:200] + "..."
        
        # Extract priority
        priority = "MEDIUM"  # Default
        if "critical" in response_lower:
            priority = "CRITICAL"
        elif "high" in response_lower:
            priority = "HIGH"
        elif "low" in response_lower:
            priority = "LOW"
        
        # Extract estimated impact
        estimated_impact = "Based on LLM analysis"
        if "impact" in response_lower:
            # Try to extract impact statement
            import re
            impact_match = re.search(r'impact[:\s]*(.*?)(?:\n|$)', response_lower)
            if impact_match:
                estimated_impact = impact_match.group(1).strip().capitalize()
        
        # Extract steps
        steps = []
        import re
        step_matches = re.findall(r'\d+\.\s*(.*?)(?:\n|$)', llm_response)
        if step_matches:
            steps = [step.strip() for step in step_matches[:5]]  # Limit to 5 steps
        else:
            # If no numbered steps, create from response
            sentences = llm_response.split('. ')
            steps = [s.strip() for s in sentences[1:4] if s.strip()]  # Take 2-3 sentences after action
        
        if not steps:
            steps = ["Review LLM analysis", "Implement recommended action", "Monitor results"]
        
        # Determine if automation is needed
        requires_automation = any(keyword in response_lower for keyword in 
                                   ['automate', 'automatic', 'retry', 'route', 'switch'])
        
        return Recommendation(
            action=action,
            priority=priority,
            estimated_impact=estimated_impact,
            steps=steps,
            requires_automation=requires_automation
        )
    
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
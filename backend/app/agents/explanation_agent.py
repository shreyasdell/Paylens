from typing import Dict, Any
from app.agents.base import BaseAgent
from app.models.state import InvestigationState
from app.services.llm_service import llm_service
import logging

logger = logging.getLogger(__name__)


class ExplanationAgent(BaseAgent):
    """Explanation Agent - generates internal and customer-friendly explanations"""
    
    def __init__(self):
        super().__init__("ExplanationAgent")
    
    async def process(self, state: InvestigationState) -> InvestigationState:
        """Process explanation generation"""
        try:
            logger.info("Generating explanations")
            
            # Try to use LLM for explanations first
            try:
                state_dict = {
                    "root_cause": state.root_cause.__dict__ if state.root_cause else None,
                    "confidence": state.confidence,
                    "transaction": state.transaction.__dict__ if state.transaction else None,
                    "recommendation": state.recommendation.__dict__ if state.recommendation else None
                }
                
                state.internal_explanation = await llm_service.generate_internal_explanation(state_dict)
                state.customer_explanation = await llm_service.generate_customer_explanation(state_dict)
                
                logger.info("LLM explanations generated successfully")
            except Exception as e:
                logger.warning(f"LLM explanation generation failed, falling back to rule-based: {e}")
                
                # Fallback to rule-based
                state.internal_explanation = await self._generate_internal_explanation(state)
                state.customer_explanation = await self._generate_customer_explanation(state)
            
            state.status = "completed"
            return state
            
        except Exception as e:
            logger.error(f"Explanation generation failed: {e}")
            state.error_message = f"Explanation generation failed: {str(e)}"
            state.status = "failed"
            return state
    
    async def _generate_internal_explanation(self, state: InvestigationState) -> str:
        """Generate internal technical explanation"""
        if not state.root_cause:
            return "Unable to generate explanation - no root cause identified."
        
        explanation_parts = []
        
        # Root cause summary
        explanation_parts.append(f"Root Cause: {state.root_cause.category.value} - {state.root_cause.description}")
        explanation_parts.append(f"Confidence: {state.root_cause.confidence:.1%}")
        
        # Evidence summary
        if state.root_cause.evidence_summary:
            explanation_parts.append("\nEvidence:")
            for evidence in state.root_cause.evidence_summary[:5]:  # Limit to top 5
                explanation_parts.append(f"- {evidence}")
        
        # Transaction details
        if state.transaction:
            explanation_parts.append(f"\nTransaction Details:")
            explanation_parts.append(f"- Payment ID: {state.transaction.payment_id}")
            explanation_parts.append(f"- Issuer: {state.transaction.issuer}")
            explanation_parts.append(f"- Amount: ${state.transaction.amount:.2f}")
            explanation_parts.append(f"- Status: {state.transaction.status}")
            if state.transaction.error_code:
                explanation_parts.append(f"- Error Code: {state.transaction.error_code}")
        
        # Related incidents
        if state.incidents:
            explanation_parts.append(f"\nRelated Incidents:")
            for incident in state.incidents[:3]:  # Limit to top 3
                explanation_parts.append(f"- {incident.incident_id}: {incident.issue} ({incident.severity})")
        
        # Recommendation
        if state.recommendation:
            explanation_parts.append(f"\nRecommendation: {state.recommendation.action}")
            explanation_parts.append(f"Priority: {state.recommendation.priority}")
            if state.recommendation.steps:
                explanation_parts.append("Steps:")
                for step in state.recommendation.steps:
                    explanation_parts.append(f"- {step}")
        
        # Human review flag
        if state.requires_human_review:
            explanation_parts.append("\n⚠️ Requires human review before action")
        
        return "\n".join(explanation_parts)
    
    async def _generate_customer_explanation(self, state: InvestigationState) -> str:
        """Generate customer-friendly explanation"""
        if not state.root_cause:
            return "We're currently investigating your payment. Our team will provide more information shortly."
        
        # Map root causes to customer-friendly messages
        customer_messages = {
            "E1001": "For your security, this transaction was flagged for additional verification. This is a routine security measure to protect your account.",
            "E2012": "The payment processing is taking longer than usual. This may be due to high demand or temporary issues with the bank's systems.",
            "E3011": "We're experiencing temporary network connectivity issues that are affecting payment processing. Our team is working to resolve this.",
            "E4015": "We noticed that your payment was processed multiple times due to a technical issue. We have initiated a refund for the duplicate charge.",
            "E5003": "The bank is currently experiencing technical difficulties and is unable to process payments at this time. Please try using a different payment method.",
            "UNKNOWN": "We're currently investigating a technical issue with your payment. Our team is working to resolve this as quickly as possible."
        }
        
        base_message = customer_messages.get(state.root_cause.category.value, customer_messages["UNKNOWN"])
        
        # Add contextual information
        additional_info = []
        
        if state.transaction and state.transaction.issuer:
            additional_info.append(f"Affected payment method: {state.transaction.issuer}")
        
        if state.recommendation and not state.requires_human_review:
            if "retry" in state.recommendation.action.lower():
                additional_info.append("Please try again in a few minutes.")
            elif "alternative" in state.recommendation.action.lower():
                additional_info.append("Please try using a different payment method.")
            elif "refund" in state.recommendation.action.lower():
                additional_info.append("You should see the refund in your account within 3-5 business days.")
        
        # Combine messages
        if additional_info:
            full_message = f"{base_message}\n\n{' '.join(additional_info)}"
        else:
            full_message = base_message
        
        # Add support contact if human review is required
        if state.requires_human_review:
            full_message += "\n\nIf you need immediate assistance, please contact our support team."
        
        return full_message
    
    def _sanitize_for_customer(self, text: str) -> str:
        """Sanitize technical explanation for customer consumption"""
        # Remove technical jargon
        technical_terms = [
            "API", "endpoint", "timeout threshold", "latency", 
            "metrics", "anomaly detection", "confidence score",
            "root cause analysis", "evidence correlation"
        ]
        
        sanitized = text
        for term in technical_terms:
            sanitized = sanitized.replace(term, "technical issue")
        
        # Simplify error codes
        import re
        sanitized = re.sub(r'E\d+', "error", sanitized)
        
        return sanitized
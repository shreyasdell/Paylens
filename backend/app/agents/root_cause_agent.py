from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.models.state import InvestigationState, RootCause, CandidateCause, RootCauseCategory, ConfidenceLevel
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class RootCauseAgent(BaseAgent):
    """Root Cause Agent - determines probable causes and correlates evidence"""
    
    def __init__(self):
        super().__init__("RootCauseAgent")
    
    async def process(self, state: InvestigationState) -> InvestigationState:
        """Process root cause analysis"""
        try:
            logger.info("Performing root cause analysis")
            
            # Generate candidate causes based on evidence
            candidate_causes = await self._generate_candidate_causes(state)
            state.candidate_causes = candidate_causes
            
            # Select the most likely root cause
            if candidate_causes:
                best_cause = max(candidate_causes, key=lambda x: x.confidence)
                
                state.root_cause = RootCause(
                    category=best_cause.category,
                    description=best_cause.description,
                    confidence=best_cause.confidence,
                    evidence_summary=best_cause.supporting_evidence
                )
                
                state.confidence = best_cause.confidence
                state.confidence_level = self._determine_confidence_level(best_cause.confidence)
                
                logger.info(f"Root cause identified: {best_cause.category.value} with confidence {best_cause.confidence}")
            else:
                # Fallback to unknown if no causes identified
                state.root_cause = RootCause(
                    category=RootCauseCategory.UNKNOWN,
                    description="Unable to determine root cause with available evidence",
                    confidence=0.0,
                    evidence_summary=["Insufficient evidence to determine root cause"]
                )
                state.confidence = 0.0
                state.confidence_level = ConfidenceLevel.LOW
            
            state.status = "root_cause_identified"
            return state
            
        except Exception as e:
            logger.error(f"Root cause analysis failed: {e}")
            state.error_message = f"Root cause analysis failed: {str(e)}"
            state.status = "failed"
            return state
    
    async def _generate_candidate_causes(self, state: InvestigationState) -> List[CandidateCause]:
        """Generate candidate causes based on collected evidence"""
        candidate_causes = []
        
        # Analyze transaction data
        if state.transaction:
            transaction_causes = self._analyze_transaction(state.transaction)
            candidate_causes.extend(transaction_causes)
        
        # Analyze logs
        if state.logs:
            log_causes = self._analyze_logs(state.logs)
            candidate_causes.extend(log_causes)
        
        # Analyze metrics
        if state.metrics:
            metric_causes = self._analyze_metrics(state.metrics)
            candidate_causes.extend(metric_causes)
        
        # Analyze incidents
        if state.incidents:
            incident_causes = self._analyze_incidents(state.incidents)
            candidate_causes.extend(incident_causes)
        
        # Analyze runbook matches
        if state.runbook_matches:
            runbook_causes = self._analyze_runbooks(state.runbook_matches)
            candidate_causes.extend(runbook_causes)
        
        # Combine and score causes
        scored_causes = self._score_and_deduplicate_causes(candidate_causes)
        
        return scored_causes
    
    def _analyze_transaction(self, transaction) -> List[CandidateCause]:
        """Analyze transaction for potential causes"""
        causes = []
        
        if transaction.error_code:
            # Map error codes to root cause categories
            error_code_mapping = {
                "E1001": (RootCauseCategory.FRAUD_DECLINE, "Transaction declined by fraud detection system"),
                "E2012": (RootCauseCategory.ISSUER_TIMEOUT, "Issuer did not respond within timeout threshold"),
                "E3011": (RootCauseCategory.NETWORK_FAILURE, "Network connectivity issue detected"),
                "E4015": (RootCauseCategory.DUPLICATE_PAYMENT, "Duplicate transaction detected"),
                "E5003": (RootCauseCategory.BANK_UNAVAILABLE, "Bank services unavailable")
            }
            
            if transaction.error_code in error_code_mapping:
                category, description = error_code_mapping[transaction.error_code]
                causes.append(CandidateCause(
                    category=category,
                    description=description,
                    confidence=0.85,
                    supporting_evidence=[f"Error code: {transaction.error_code}", f"Payment status: {transaction.status}"]
                ))
        
        if transaction.status == "timeout":
            causes.append(CandidateCause(
                category=RootCauseCategory.ISSUER_TIMEOUT,
                description="Payment timed out waiting for issuer response",
                confidence=0.75,
                supporting_evidence=[f"Payment status: {transaction.status}"]
            ))
        
        return causes
    
    def _analyze_logs(self, logs: List) -> List[CandidateCause]:
        """Analyze logs for potential causes"""
        causes = []
        
        error_messages = [log.message.lower() for log in logs if log.level == "ERROR"]
        
        if "timeout" in " ".join(error_messages):
            causes.append(CandidateCause(
                category=RootCauseCategory.ISSUER_TIMEOUT,
                description="Timeout errors detected in logs",
                confidence=0.70,
                supporting_evidence=[log.message for log in logs if "timeout" in log.message.lower()]
            ))
        
        if "network" in " ".join(error_messages) or "connection" in " ".join(error_messages):
            causes.append(CandidateCause(
                category=RootCauseCategory.NETWORK_FAILURE,
                description="Network connectivity issues detected in logs",
                confidence=0.65,
                supporting_evidence=[log.message for log in logs if "network" in log.message.lower() or "connection" in log.message.lower()]
            ))
        
        if "fraud" in " ".join(error_messages):
            causes.append(CandidateCause(
                category=RootCauseCategory.FRAUD_DECLINE,
                description="Fraud detection triggered",
                confidence=0.80,
                supporting_evidence=[log.message for log in logs if "fraud" in log.message.lower()]
            ))
        
        return causes
    
    def _analyze_metrics(self, metrics: List) -> List[CandidateCause]:
        """Analyze metrics for potential causes"""
        causes = []
        
        if not metrics:
            return causes
        
        # Calculate averages
        avg_latency = sum(m.latency_ms for m in metrics) / len(metrics)
        avg_success_rate = sum(m.success_rate for m in metrics) / len(metrics)
        avg_timeout_rate = sum(m.timeout_rate for m in metrics) / len(metrics)
        avg_failure_rate = sum(m.failure_rate for m in metrics) / len(metrics)
        
        # High latency indicates potential timeout issues
        if avg_latency > 1000:  # > 1 second average latency
            causes.append(CandidateCause(
                category=RootCauseCategory.ISSUER_TIMEOUT,
                description=f"High average latency detected: {avg_latency:.2f}ms",
                confidence=0.60,
                supporting_evidence=[f"Average latency: {avg_latency:.2f}ms"]
            ))
        
        # Low success rate indicates systemic issues
        if avg_success_rate < 0.90:  # < 90% success rate
            causes.append(CandidateCause(
                category=RootCauseCategory.BANK_UNAVAILABLE,
                description=f"Low success rate detected: {avg_success_rate:.2%}",
                confidence=0.70,
                supporting_evidence=[f"Success rate: {avg_success_rate:.2%}"]
            ))
        
        # High timeout rate
        if avg_timeout_rate > 0.10:  # > 10% timeout rate
            causes.append(CandidateCause(
                category=RootCauseCategory.ISSUER_TIMEOUT,
                description=f"High timeout rate detected: {avg_timeout_rate:.2%}",
                confidence=0.75,
                supporting_evidence=[f"Timeout rate: {avg_timeout_rate:.2%}"]
            ))
        
        return causes
    
    def _analyze_incidents(self, incidents: List) -> List[CandidateCause]:
        """Analyze incidents for potential causes"""
        causes = []
        
        for incident in incidents:
            if "timeout" in incident.issue.lower():
                causes.append(CandidateCause(
                    category=RootCauseCategory.ISSUER_TIMEOUT,
                    description=f"Related incident: {incident.issue}",
                    confidence=0.85,
                    supporting_evidence=[f"Incident {incident.incident_id}: {incident.issue}"]
                ))
            
            if "network" in incident.issue.lower():
                causes.append(CandidateCause(
                    category=RootCauseCategory.NETWORK_FAILURE,
                    description=f"Related incident: {incident.issue}",
                    confidence=0.80,
                    supporting_evidence=[f"Incident {incident.incident_id}: {incident.issue}"]
                ))
            
            if "bank" in incident.issue.lower() or "unavailable" in incident.issue.lower():
                causes.append(CandidateCause(
                    category=RootCauseCategory.BANK_UNAVAILABLE,
                    description=f"Related incident: {incident.issue}",
                    confidence=0.90,
                    supporting_evidence=[f"Incident {incident.incident_id}: {incident.issue}"]
                ))
        
        return causes
    
    def _analyze_runbooks(self, runbook_matches: List) -> List[CandidateCause]:
        """Analyze runbook matches for potential causes"""
        causes = []
        
        for runbook in runbook_matches:
            category = self._map_runbook_to_category(runbook.category)
            if category:
                causes.append(CandidateCause(
                    category=category,
                    description=f"Runbook match: {runbook.title}",
                    confidence=runbook.relevance_score * 0.8,  # Discount runbook confidence slightly
                    supporting_evidence=[f"Runbook: {runbook.title} (relevance: {runbook.relevance_score:.2f})"]
                ))
        
        return causes
    
    def _map_runbook_to_category(self, runbook_category: str) -> RootCauseCategory:
        """Map runbook category to root cause category"""
        category_mapping = {
            "Issuer Timeout": RootCauseCategory.ISSUER_TIMEOUT,
            "Fraud Decline": RootCauseCategory.FRAUD_DECLINE,
            "Network Failure": RootCauseCategory.NETWORK_FAILURE,
            "Bank Unavailable": RootCauseCategory.BANK_UNAVAILABLE,
            "Duplicate Payment": RootCauseCategory.DUPLICATE_PAYMENT
        }
        
        return category_mapping.get(runbook_category)
    
    def _score_and_deduplicate_causes(self, causes: List[CandidateCause]) -> List[CandidateCause]:
        """Score and deduplicate candidate causes"""
        # Group by category
        category_scores = {}
        category_evidence = {}
        
        for cause in causes:
            category = cause.category
            if category not in category_scores:
                category_scores[category] = []
                category_evidence[category] = []
            
            category_scores[category].append(cause.confidence)
            category_evidence[category].extend(cause.supporting_evidence)
        
        # Calculate combined scores
        final_causes = []
        for category, scores in category_scores.items():
            # Use maximum confidence for the category
            max_confidence = max(scores)
            # Combine all evidence
            all_evidence = list(set(category_evidence[category]))  # Remove duplicates
            
            # Get description from the cause with highest confidence
            best_cause = max([c for c in causes if c.category == category], key=lambda x: x.confidence)
            
            final_causes.append(CandidateCause(
                category=category,
                description=best_cause.description,
                confidence=max_confidence,
                supporting_evidence=all_evidence
            ))
        
        # Sort by confidence
        final_causes.sort(key=lambda x: x.confidence, reverse=True)
        
        return final_causes
    
    def _determine_confidence_level(self, confidence: float) -> ConfidenceLevel:
        """Determine confidence level based on confidence score"""
        if confidence >= 0.90:
            return ConfidenceLevel.HIGH
        elif confidence >= 0.70:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.LOW
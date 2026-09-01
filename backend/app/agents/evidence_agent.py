from typing import Dict, Any, List
from app.agents.base import BaseAgent
from app.models.state import InvestigationState, Transaction, LogEntry, Metric, Incident, RunbookMatch
from app.services.chromadb_service import chromadb_service
from app.services.llm_service import llm_service
import logging
import random
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class EvidenceAgent(BaseAgent):
    """Evidence Agent - collects transaction data, logs, metrics, incidents, and searches runbooks"""
    
    def __init__(self):
        super().__init__("EvidenceAgent")
    
    async def process(self, state: InvestigationState) -> InvestigationState:
        """Process evidence collection"""
        try:
            logger.info(f"Collecting evidence for {state.investigation_type}")
            
            # Collect evidence based on investigation type
            if state.investigation_type.value == "payment":
                await self._collect_payment_evidence(state)
            elif state.investigation_type.value == "incident":
                await self._collect_incident_evidence(state)
            elif state.investigation_type.value == "support":
                await self._collect_support_evidence(state)
            
            # Always search runbooks for relevant information
            await self._search_runbooks(state)
            
            state.status = "evidence_collected"
            return state
            
        except Exception as e:
            logger.error(f"Evidence collection failed: {e}")
            state.error_message = f"Evidence collection failed: {str(e)}"
            state.status = "failed"
            return state
    
    async def _collect_payment_evidence(self, state: InvestigationState):
        """Collect evidence for payment investigation"""
        # In a real implementation, this would query the database
        # For now, we'll simulate with synthetic data
        
        # Simulate transaction retrieval
        state.transaction = self._simulate_transaction(state.payment_id)
        
        # Simulate log retrieval
        state.logs = self._simulate_logs(state.payment_id)
        
        # Simulate metrics retrieval
        if state.transaction:
            state.metrics = self._simulate_metrics(state.transaction.issuer)
        
        # Simulate incident retrieval
        state.incidents = self._simulate_incidents(state.transaction.issuer if state.transaction else None)
        
        logger.info(f"Collected payment evidence: {len(state.logs)} logs, {len(state.metrics)} metrics, {len(state.incidents)} incidents")
    
    async def _collect_incident_evidence(self, state: InvestigationState):
        """Collect evidence for incident investigation"""
        # Simulate incident retrieval
        state.incidents = self._simulate_incidents()
        
        # If we have incidents, collect related metrics
        if state.incidents:
            issuers = [incident.issuer for incident in state.incidents]
            for issuer in issuers:
                state.metrics.extend(self._simulate_metrics(issuer))
        
        logger.info(f"Collected incident evidence: {len(state.incidents)} incidents, {len(state.metrics)} metrics")
    
    async def _collect_support_evidence(self, state: InvestigationState):
        """Collect evidence for support investigation"""
        # Extract payment ID from customer query if present
        payment_id = self._extract_payment_id(state.customer_query)
        
        if payment_id:
            state.payment_id = payment_id
            await self._collect_payment_evidence(state)
        else:
            # General support query - collect recent incidents
            state.incidents = self._simulate_incidents()
            logger.info("Collected general support evidence")
    
    async def _search_runbooks(self, state: InvestigationState):
        """Search runbooks for relevant information"""
        try:
            # Try LLM-enhanced query generation first
            try:
                llm_query = await self._llm_generate_search_query(state)
                if llm_query:
                    query = llm_query
                    logger.info(f"Using LLM-generated search query: {query}")
                else:
                    query = self._build_search_query(state)
            except Exception as e:
                logger.warning(f"LLM query generation failed, using rule-based: {e}")
                query = self._build_search_query(state)
            
            # Search runbooks
            results = chromadb_service.search_runbooks(query, n_results=3)
            
            # Convert to RunbookMatch objects
            state.runbook_matches = [
                RunbookMatch(
                    title=result.get("metadata", {}).get("title", "Unknown"),
                    content=result.get("content", ""),
                    relevance_score=result.get("relevance_score", 0.0),
                    category=result.get("metadata", {}).get("category", "General")
                )
                for result in results
            ]
            
            logger.info(f"Found {len(state.runbook_matches)} relevant runbooks")
            
        except Exception as e:
            logger.error(f"Runbook search failed: {e}")
            state.runbook_matches = []
    
    def _build_search_query(self, state: InvestigationState) -> str:
        """Build search query based on available information (rule-based fallback)"""
        query_parts = []
        
        if state.transaction and state.transaction.error_code:
            query_parts.append(f"error code {state.transaction.error_code}")
        
        if state.transaction:
            query_parts.append(f"payment status {state.transaction.status}")
        
        if state.incidents:
            for incident in state.incidents:
                query_parts.append(incident.issue.lower())
        
        if state.customer_query:
            query_parts.append(state.customer_query.lower())
        
        return " ".join(query_parts) if query_parts else "payment failure"
    
    async def _llm_generate_search_query(self, state: InvestigationState) -> str:
        """Use LLM to generate optimized search query for runbooks"""
        context = {
            "error_code": state.transaction.error_code if state.transaction else None,
            "status": state.transaction.status if state.transaction else None,
            "issuer": state.transaction.issuer if state.transaction else None,
            "incidents": [incident.issue for incident in state.incidents] if state.incidents else [],
            "customer_query": state.customer_query
        }
        
        prompt = f"""Generate an optimized search query for finding relevant runbooks based on this payment investigation context:

Context:
- Error Code: {context['error_code']}
- Payment Status: {context['status']}
- Issuer: {context['issuer']}
- Related Incidents: {context['incidents']}
- Customer Query: {context['customer_query']}

Generate a concise search query (2-5 keywords) that would find the most relevant operational runbooks."""
        
        llm_response = await llm_service.generate_response(prompt)
        
        # Clean up the response
        query = llm_response.strip()
        # Remove common LLM artifacts
        query = query.replace("Search query:", "").replace("Query:", "").strip()
        # Take first line if multiple
        query = query.split('\n')[0].strip()
        
        return query if query else None
    
    def _simulate_transaction(self, payment_id: str) -> Transaction:
        """Simulate transaction retrieval (replace with actual DB query)"""
        from app.services.synthetic_data import SyntheticDataGenerator
        import random
        
        # In real implementation, query database
        # For simulation, create a realistic transaction
        return Transaction(
            payment_id=payment_id,
            customer_id=f"CUST_{random.randint(1000, 9999)}",
            merchant_id=f"MERC_{random.randint(100, 999)}",
            issuer=random.choice(["HDFC", "ICICI", "SBI", "Axis", "Kotak"]),
            amount=round(random.uniform(100, 5000), 2),
            payment_method=random.choice(["UPI", "Credit Card", "Debit Card"]),
            status=random.choice(["success", "failed", "timeout"]),
            error_code=random.choice(["E1001", "E2012", "E3011", "E4015", "E5003", None]),
            timestamp=datetime.utcnow() - timedelta(minutes=random.randint(1, 60))
        )
    
    def _simulate_logs(self, payment_id: str) -> List[LogEntry]:
        """Simulate log retrieval (replace with actual DB query)"""
        import random
        
        logs = []
        log_messages = [
            "Payment initiated",
            "Request sent to issuer",
            "Issuer timeout",
            "Payment failed",
            "Retry attempted"
        ]
        
        for i in range(random.randint(3, 8)):
            logs.append(LogEntry(
                timestamp=datetime.utcnow() - timedelta(minutes=random.randint(1, 60), seconds=random.randint(0, 59)),
                level=random.choice(["INFO", "WARNING", "ERROR"]),
                message=random.choice(log_messages),
                payment_id=payment_id,
                service=random.choice(["payment-gateway", "issuer-service", "fraud-service"]),
                metadata={"request_id": f"req_{random.randint(10000, 99999)}"}
            ))
        
        return logs
    
    def _simulate_metrics(self, issuer: str) -> List[Metric]:
        """Simulate metrics retrieval (replace with actual DB query)"""
        metrics = []
        
        for i in range(24):  # Last 24 hours
            metrics.append(Metric(
                timestamp=datetime.utcnow() - timedelta(hours=i),
                issuer=issuer,
                latency_ms=random.uniform(100, 500),
                success_rate=random.uniform(0.90, 0.99),
                timeout_rate=random.uniform(0.01, 0.05),
                failure_rate=random.uniform(0.01, 0.08)
            ))
        
        return metrics
    
    def _simulate_incidents(self, issuer: str = None) -> List[Incident]:
        """Simulate incident retrieval (replace with actual DB query)"""
        import random
        
        incidents = []
        num_incidents = random.randint(0, 3)
        
        for i in range(num_incidents):
            incident_issuer = issuer or random.choice(["HDFC", "ICICI", "SBI", "Axis"])
            incidents.append(Incident(
                incident_id=f"INC{100 + i}",
                issuer=incident_issuer,
                issue=random.choice(["Elevated timeout rate", "Payment processing degradation", "Bank service unavailable"]),
                severity=random.choice(["LOW", "MEDIUM", "HIGH"]),
                status=random.choice(["investigating", "resolved", "monitoring"]),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 7)),
                updated_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
                description=f"Issue detected for {incident_issuer}"
            ))
        
        return incidents
    
    def _extract_payment_id(self, query: str) -> str:
        """Extract payment ID from customer query"""
        import re
        match = re.search(r'PAY_\d+', query)
        return match.group(0) if match else None
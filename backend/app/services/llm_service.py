from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from operator import itemgetter
from typing import Dict, Any, Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMService:
    """Service for LLM interactions using Ollama"""
    
    def __init__(self):
        self.llm = None
        self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize Ollama LLM connection"""
        try:
            self.llm = ChatOllama(
                model=settings.OLLAMA_MODEL,
                base_url=settings.OLLAMA_BASE_URL,
                temperature=0.7,
                num_ctx=4096,  # Context window
            )
            logger.info(f"Initialized Ollama LLM: {settings.OLLAMA_MODEL} at {settings.OLLAMA_BASE_URL}")
        except Exception as e:
            logger.error(f"Failed to initialize Ollama LLM: {e}")
            logger.warning("LLM features will be disabled")
            self.llm = None
    
    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generate a response from the LLM"""
        if not self.llm:
            logger.warning("LLM not available, returning fallback response")
            return self._get_fallback_response(prompt)
        
        try:
            if system_prompt:
                messages = [
                    ("system", system_prompt),
                    ("human", prompt)
                ]
            else:
                messages = [("human", prompt)]
            
            response = await self.llm.ainvoke(messages)
            return response.content
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return self._get_fallback_response(prompt)
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Fallback response when LLM is unavailable"""
        return f"LLM service unavailable. Input: {prompt}"
    
    async def analyze_root_cause(self, evidence: Dict[str, Any]) -> str:
        """Use LLM to analyze root cause from evidence"""
        system_prompt = """You are a payment operations expert specializing in root cause analysis for payment failures. 
Analyze the provided evidence and determine the most likely root cause with confidence score."""
        
        prompt = f"""Analyze the following payment failure evidence and determine the root cause:

Evidence:
- Error Code: {evidence.get('error_code', 'Unknown')}
- Payment Status: {evidence.get('status', 'Unknown')}
- Issuer: {evidence.get('issuer', 'Unknown')}
- Logs: {len(evidence.get('logs', []))} log entries
- Metrics: {len(evidence.get('metrics', []))} metric data points
- Incidents: {len(evidence.get('incidents', []))} related incidents

Provide:
1. Root cause category (e.g., E1001, E2012, E3011, E4015, E5003)
2. Description of the issue
3. Confidence score (0.0 to 1.0)
4. Brief explanation"""
        
        return await self.generate_response(prompt, system_prompt)
    
    async def generate_recommendation(self, root_cause: str, context: Dict[str, Any]) -> str:
        """Generate remediation recommendation"""
        system_prompt = """You are a payment operations expert. Generate actionable remediation recommendations for payment failures."""
        
        prompt = f"""Based on the following root cause analysis, provide a remediation recommendation:

Root Cause: {root_cause}
Context: {context}

Provide:
1. Recommended action
2. Priority level (CRITICAL, HIGH, MEDIUM, LOW)
3. Estimated impact
4. Step-by-step resolution steps"""
        
        return await self.generate_response(prompt, system_prompt)
    
    async def generate_customer_explanation(self, investigation: Dict[str, Any]) -> str:
        """Generate customer-friendly explanation"""
        system_prompt = """You are a customer support specialist. Explain payment issues in simple, non-technical language."""
        
        prompt = f"""Generate a customer-friendly explanation for this payment issue:

Investigation Results:
- Root Cause: {investigation.get('root_cause', {}).get('description', 'Unknown')}
- Recommendation: {investigation.get('recommendation', {}).get('action', 'Unknown')}
- Payment Details: {investigation.get('transaction', {})}

Provide a clear, empathetic explanation that:
1. Acknowledges the issue
2. Explains what happened in simple terms
3. Offers reassurance
4. Suggests next steps for the customer"""
        
        return await self.generate_response(prompt, system_prompt)
    
    async def generate_internal_explanation(self, investigation: Dict[str, Any]) -> str:
        """Generate technical explanation for internal use"""
        system_prompt = """You are a technical operations specialist. Provide detailed technical explanations for payment failures."""
        
        prompt = f"""Generate a detailed technical explanation for this payment investigation:

Investigation Results:
- Root Cause: {investigation.get('root_cause', {})}
- Confidence: {investigation.get('confidence', 0)}
- Evidence: {investigation.get('evidence', {})}
- Recommendation: {investigation.get('recommendation', {})}
- Transaction: {investigation.get('transaction', {})}

Provide:
1. Detailed technical analysis
2. Evidence summary
3. Recommended actions with technical details
4. Any additional context for operations team"""
        
        return await self.generate_response(prompt, system_prompt)
    
    async def triage_investigation(self, input_data: Dict[str, Any]) -> str:
        """Triage the investigation type"""
        system_prompt = """You are a payment operations triage specialist. Categorize incoming requests."""
        
        prompt = f"""Categorize this investigation request:

Input: {input_data}

Determine if this is:
1. Payment investigation (if payment_id is present)
2. Incident investigation (if incident_id is present)
3. Support query (if customer_query is present)

Return the investigation type as a single word: payment, incident, or support"""
        
        return await self.generate_response(prompt, system_prompt)


# Singleton instance
llm_service = LLMService()
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class InvestigationType(str, Enum):
    PAYMENT = "payment"
    INCIDENT = "incident"
    SUPPORT = "support"


class RootCauseCategory(str, Enum):
    FRAUD_DECLINE = "E1001"
    ISSUER_TIMEOUT = "E2012"
    NETWORK_FAILURE = "E3011"
    DUPLICATE_PAYMENT = "E4015"
    BANK_UNAVAILABLE = "E5003"
    UNKNOWN = "UNKNOWN"


class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Transaction(BaseModel):
    payment_id: str
    customer_id: str
    merchant_id: str
    issuer: str
    amount: float
    payment_method: str
    status: str
    error_code: Optional[str] = None
    timestamp: datetime


class LogEntry(BaseModel):
    timestamp: datetime
    level: str
    message: str
    payment_id: Optional[str] = None
    service: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Metric(BaseModel):
    timestamp: datetime
    issuer: str
    latency_ms: float
    success_rate: float
    timeout_rate: float
    failure_rate: float


class Incident(BaseModel):
    incident_id: str
    issuer: str
    issue: str
    severity: str
    status: str
    created_at: datetime
    updated_at: datetime
    description: str


class RunbookMatch(BaseModel):
    title: str
    content: str
    relevance_score: float
    category: str


class CandidateCause(BaseModel):
    category: RootCauseCategory
    description: str
    confidence: float
    supporting_evidence: List[str] = Field(default_factory=list)


class Evidence(BaseModel):
    transaction: Optional[Transaction] = None
    logs: List[LogEntry] = Field(default_factory=list)
    metrics: List[Metric] = Field(default_factory=list)
    incidents: List[Incident] = Field(default_factory=list)
    runbook_matches: List[RunbookMatch] = Field(default_factory=list)


class RootCause(BaseModel):
    category: RootCauseCategory
    description: str
    confidence: float
    evidence_summary: List[str]


class Recommendation(BaseModel):
    action: str
    priority: str
    estimated_impact: str
    steps: List[str]
    requires_automation: bool = False


class InvestigationState(BaseModel):
    # Input
    payment_id: Optional[str] = None
    incident_id: Optional[str] = None
    customer_query: Optional[str] = None
    investigation_type: Optional[InvestigationType] = None
    
    # Evidence
    transaction: Optional[Transaction] = None
    logs: List[LogEntry] = Field(default_factory=list)
    metrics: List[Metric] = Field(default_factory=list)
    incidents: List[Incident] = Field(default_factory=list)
    runbook_matches: List[RunbookMatch] = Field(default_factory=list)
    
    # Analysis
    candidate_causes: List[CandidateCause] = Field(default_factory=list)
    evidence: Evidence = Field(default_factory=Evidence)
    
    # Results
    root_cause: Optional[RootCause] = None
    confidence: float = 0.0
    confidence_level: Optional[ConfidenceLevel] = None
    
    # Resolution
    recommendation: Optional[Recommendation] = None
    requires_human_review: bool = False
    
    # Communication
    customer_explanation: Optional[str] = None
    internal_explanation: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "initialized"
    error_message: Optional[str] = None
    
    class Config:
        arbitrary_types_allowed = True
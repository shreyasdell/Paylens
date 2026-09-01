// API Response Types matching backend Pydantic schemas

export enum InvestigationType {
  PAYMENT = "payment",
  INCIDENT = "incident",
  SUPPORT = "support",
}

export enum RootCauseCategory {
  FRAUD_DECLINE = "E1001",
  ISSUER_TIMEOUT = "E2012",
  NETWORK_FAILURE = "E3011",
  DUPLICATE_PAYMENT = "E4015",
  BANK_UNAVAILABLE = "E5003",
  UNKNOWN = "UNKNOWN",
}

export enum ConfidenceLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum Severity {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum IncidentStatus {
  INVESTIGATING = "investigating",
  MONITORING = "monitoring",
  RESOLVED = "resolved",
}

export interface Transaction {
  payment_id: string;
  customer_id: string;
  merchant_id: string;
  issuer: string;
  amount: number;
  payment_method: string;
  status: string;
  error_code?: string;
  timestamp: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  payment_id?: string;
  service: string;
  metadata: Record<string, any>;
}

export interface Metric {
  timestamp: string;
  issuer: string;
  latency_ms: number;
  success_rate: number;
  timeout_rate: number;
  failure_rate: number;
}

export interface Incident {
  incident_id: string;
  issuer: string;
  issue: string;
  severity: Severity;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  description: string;
}

export interface RunbookMatch {
  title: string;
  content: string;
  relevance_score: number;
  category: string;
}

export interface CandidateCause {
  category: RootCauseCategory;
  description: string;
  confidence: number;
  supporting_evidence: string[];
}

export interface Evidence {
  transaction?: Transaction;
  logs: LogEntry[];
  metrics: Metric[];
  incidents: Incident[];
  runbook_matches: RunbookMatch[];
}

export interface RootCause {
  category: RootCauseCategory;
  description: string;
  confidence: number;
  evidence_summary: string[];
}

export interface Recommendation {
  action: string;
  priority: string;
  estimated_impact: string;
  steps: string[];
  requires_automation: boolean;
}

export interface InvestigationState {
  // Input
  payment_id?: string;
  incident_id?: string;
  customer_query?: string;
  investigation_type?: InvestigationType;

  // Evidence
  transaction?: Transaction;
  logs: LogEntry[];
  metrics: Metric[];
  incidents: Incident[];
  runbook_matches: RunbookMatch[];

  // Analysis
  candidate_causes: CandidateCause[];
  evidence: Evidence;

  // Results
  root_cause?: RootCause;
  confidence: number;
  confidence_level?: ConfidenceLevel;

  // Resolution
  recommendation?: Recommendation;
  requires_human_review: boolean;

  // Communication
  customer_explanation?: string;
  internal_explanation?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  status: string;
  error_message?: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

// Dashboard Types
export interface KPIMetrics {
  success_rate: number;
  failure_rate: number;
  avg_latency: number;
  open_incidents: number;
}

export interface TimeSeriesData {
  timestamp: string;
  success_rate: number;
  failure_rate: number;
  timeout_rate: number;
}

export interface SupportMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  technical_details?: string;
}

export interface Runbook {
  title: string;
  content: string;
  relevance_score: number;
  category: string;
}

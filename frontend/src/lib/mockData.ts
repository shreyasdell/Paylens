import {
  InvestigationState,
  Incident,
  KPIMetrics,
  TimeSeriesData,
  SupportMessage,
  Runbook,
} from "@/types/api";

// Mock payment investigation response
export const mockPaymentInvestigation: InvestigationState = {
  payment_id: "PAY_12345",
  incident_id: null,
  customer_query: null,
  investigation_type: "payment" as any,
  transaction: {
    payment_id: "PAY_12345",
    customer_id: "CUST_2026",
    merchant_id: "MERC_840",
    issuer: "ICICI",
    amount: 1917.69,
    payment_method: "Credit Card",
    status: "timeout",
    error_code: "E4015",
    timestamp: "2026-08-31T10:05:35.229486",
  },
  logs: [
    {
      timestamp: "2026-08-31T09:28:10.229560",
      level: "INFO",
      message: "Request sent to issuer",
      payment_id: "PAY_12345",
      service: "fraud-service",
      metadata: { request_id: "req_14484" },
    },
    {
      timestamp: "2026-08-31T09:28:16.229581",
      level: "WARNING",
      message: "Issuer timeout",
      payment_id: "PAY_12345",
      service: "fraud-service",
      metadata: { request_id: "req_45389" },
    },
  ],
  metrics: [
    {
      timestamp: "2026-08-31T10:28:35.229616",
      issuer: "ICICI",
      latency_ms: 374.57,
      success_rate: 0.955,
      timeout_rate: 0.035,
      failure_rate: 0.070,
    },
  ],
  incidents: [
    {
      incident_id: "INC100",
      issuer: "ICICI",
      issue: "Bank service unavailable",
      severity: "MEDIUM" as any,
      status: "investigating" as any,
      created_at: "2026-08-24T10:28:35.229807",
      updated_at: "2026-08-30T18:28:35.229810",
      description: "Issue detected for ICICI",
    },
  ],
  runbook_matches: [],
  candidate_causes: [
    {
      category: "E5003" as any,
      description: "Related incident: Bank service unavailable",
      confidence: 0.9,
      supporting_evidence: ["Incident INC100: Bank service unavailable"],
    },
  ],
  evidence: {
    transaction: {
      payment_id: "PAY_12345",
      customer_id: "CUST_2026",
      merchant_id: "MERC_840",
      issuer: "ICICI",
      amount: 1917.69,
      payment_method: "Credit Card",
      status: "timeout",
      error_code: "E4015",
      timestamp: "2026-08-31T10:05:35.229486",
    },
    logs: [],
    metrics: [],
    incidents: [],
    runbook_matches: [],
  },
  root_cause: {
    category: "E5003" as any,
    description: "Related incident: Bank service unavailable",
    confidence: 0.9,
    evidence_summary: ["Incident INC100: Bank service unavailable"],
  },
  confidence: 0.9,
  confidence_level: "high" as any,
  recommendation: {
    action: "Route transactions to alternative banks",
    priority: "CRITICAL",
    estimated_impact: "Maintain payment processing during bank outages",
    steps: [
      "Activate alternative payment rails",
      "Reroute traffic to backup banks",
      "Display maintenance message to customers",
      "Monitor alternative bank performance",
    ],
    requires_automation: true,
  },
  requires_human_review: false,
  customer_explanation:
    "The bank is currently experiencing technical difficulties and is unable to process payments at this time. Please try using a different payment method.",
  internal_explanation:
    "Root Cause: E5003 - Related incident: Bank service unavailable\nConfidence: 90.0%\n\nEvidence:\n- Incident INC100: Bank service unavailable\n\nTransaction Details:\n- Payment ID: PAY_12345\n- Issuer: ICICI\n- Amount: $1917.69\n- Status: timeout\n- Error Code: E4015",
  created_at: "2026-08-31T10:28:25.278695",
  updated_at: "2026-08-31T10:28:25.278699",
  status: "completed",
  error_message: null,
};

// Mock incident investigation response
export const mockIncidentInvestigation: InvestigationState = {
  incident_id: "INC100",
  payment_id: null,
  customer_query: null,
  investigation_type: "incident" as any,
  transaction: null,
  logs: [],
  metrics: [
    {
      timestamp: "2026-08-31T10:28:03.597269",
      issuer: "ICICI",
      latency_ms: 423.21,
      success_rate: 0.904,
      timeout_rate: 0.045,
      failure_rate: 0.052,
    },
  ],
  incidents: [
    {
      incident_id: "INC100",
      issuer: "ICICI",
      issue: "Bank service unavailable",
      severity: "MEDIUM" as any,
      status: "resolved" as any,
      created_at: "2026-08-27T10:28:03.597242",
      updated_at: "2026-08-31T02:28:03.597248",
      description: "Issue detected for ICICI",
    },
  ],
  runbook_matches: [],
  candidate_causes: [
    {
      category: "E5003" as any,
      description: "Related incident: Bank service unavailable",
      confidence: 0.9,
      supporting_evidence: ["Incident INC100: Bank service unavailable"],
    },
  ],
  evidence: {
    transaction: null,
    logs: [],
    metrics: [],
    incidents: [],
    runbook_matches: [],
  },
  root_cause: {
    category: "E5003" as any,
    description: "Related incident: Bank service unavailable",
    confidence: 0.9,
    evidence_summary: ["Incident INC100: Bank service unavailable"],
  },
  confidence: 0.9,
  confidence_level: "high" as any,
  recommendation: {
    action: "Route transactions to alternative banks",
    priority: "CRITICAL",
    estimated_impact: "Maintain payment processing during bank outages",
    steps: [
      "Activate alternative payment rails",
      "Reroute traffic to backup banks",
      "Display maintenance message to customers",
      "Monitor alternative bank performance",
    ],
    requires_automation: true,
  },
  requires_human_review: false,
  customer_explanation:
    "The bank is currently experiencing technical difficulties and is unable to process payments at this time. Please try using a different payment method.",
  internal_explanation:
    "Root Cause: E5003 - Related incident: Bank service unavailable\nConfidence: 90.0%\n\nEvidence:\n- Incident INC100: Bank service unavailable",
  created_at: "2026-08-31T10:28:03.568490",
  updated_at: "2026-08-31T10:28:03.568495",
  status: "completed",
  error_message: null,
};

// Mock incidents list
export const mockIncidents: Incident[] = [
  {
    incident_id: "INC100",
    issuer: "ICICI",
    issue: "Bank service unavailable",
    severity: "MEDIUM" as any,
    status: "resolved" as any,
    created_at: "2026-08-27T10:28:03.597242",
    updated_at: "2026-08-31T02:28:03.597248",
    description: "Issue detected for ICICI",
  },
  {
    incident_id: "INC101",
    issuer: "HDFC",
    issue: "Elevated timeout rate",
    severity: "HIGH" as any,
    status: "investigating" as any,
    created_at: "2026-08-30T10:28:03.597823",
    updated_at: "2026-08-30T23:28:03.597826",
    description: "Issue detected for HDFC",
  },
  {
    incident_id: "INC102",
    issuer: "Axis",
    issue: "Payment processing degradation",
    severity: "LOW" as any,
    status: "monitoring" as any,
    created_at: "2026-08-27T10:28:03.597653",
    updated_at: "2026-08-30T10:28:03.597654",
    description: "Issue detected for Axis",
  },
];

// Mock KPI metrics
export const mockKPIMetrics: KPIMetrics = {
  success_rate: 94.5,
  failure_rate: 5.5,
  avg_latency: 287.3,
  open_incidents: 3,
};

// Mock time series data (24 hours)
export const mockTimeSeriesData: TimeSeriesData[] = Array.from(
  { length: 24 },
  (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    success_rate: 92 + Math.random() * 6,
    failure_rate: 2 + Math.random() * 4,
    timeout_rate: 1 + Math.random() * 3,
  })
);

// Mock support conversation
export const mockSupportConversation: SupportMessage[] = [
  {
    role: "user",
    content: "Why did my payment fail?",
    timestamp: "2026-08-31T10:30:00.000Z",
  },
  {
    role: "assistant",
    content:
      "Based on our investigation, your payment failed because the bank (ICICI) is currently experiencing technical difficulties and is unable to process payments at this time. This is a known issue that our team is actively monitoring.",
    timestamp: "2026-08-31T10:30:05.000Z",
    technical_details:
      "Root Cause: E5003 - Bank service unavailable\nConfidence: 90%\nRelated Incident: INC100",
  },
];

// Mock runbooks
export const mockRunbooks: Runbook[] = [
  {
    title: "Bank Service Unavailable",
    content: `# Bank Service Unavailable

## Overview
When a bank service becomes unavailable, follow these steps to minimize impact.

## Immediate Actions
1. Activate alternative payment rails
2. Reroute traffic to backup banks
3. Display maintenance message to customers

## Monitoring
- Monitor alternative bank performance
- Track success rates
- Alert on degradation

## Resolution
- Contact bank support
- Monitor bank status page
- Resume normal operations when bank is back online`,
    relevance_score: 0.95,
    category: "Incident Response",
  },
  {
    title: "Payment Timeout Investigation",
    content: `# Payment Timeout Investigation

## Common Causes
- Bank service unavailable
- Network issues
- High latency

## Investigation Steps
1. Check bank status
2. Review network metrics
3. Analyze timeout patterns

## Resolution
- Route to alternative banks
- Implement retry logic
- Monitor success rates`,
    relevance_score: 0.88,
    category: "Troubleshooting",
  },
];

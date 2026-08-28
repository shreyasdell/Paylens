# PayLens Project Specifications

## Overview
PayLens is an AI-powered Payment AIOps platform that investigates payment failures, detects systemic incidents, performs evidence-based root cause analysis, recommends remediation actions, and generates support/customer-friendly explanations.

## Tech Stack
- **Frontend**: React/Next.js
- **Backend**: FastAPI
- **Agent Orchestration**: LangGraph
- **Tool Layer**: LangChain
- **Models**: Ollama (Llama 3 / Qwen / Mistral)
- **Structured State**: Pydantic
- **Database**: PostgreSQL
- **Vector DB**: ChromaDB
- **Testing**: Playwright
- **Deployment**: Docker/Podman

## Core Features

### 1. Payment Investigation
- Input: Payment ID (e.g., PAY_10092)
- Output: Root cause, confidence score, evidence, recommended action
- Workflow: Payment → Evidence → Root Cause → Recommendation → Explanation

### 2. Incident Investigation
- Input: Metric anomaly (e.g., "UPI failures increased 8x")
- Output: Incident type, affected issuer, severity, confidence
- Workflow: Metrics → Anomaly Detection → Incident Creation → Agent Investigation → Root Cause → Recommendation

### 3. Support Assistant
- Input: Customer query
- Output: Customer-friendly explanation
- Workflow: Customer Query → Investigate Payment → Translate Technical Result → Customer Safe Response

### 4. Root Cause Analysis
- Correlate: Transactions, Logs, Metrics, Incidents, Runbooks, Historical Cases
- Identify root causes with confidence scores

## System Modes

### Mode 1: Single Payment Investigation
Linear workflow for individual payment failure analysis

### Mode 2: Incident Investigation
Systemic issue detection and analysis across multiple payments

### Mode 3: Support Assistant
Customer-facing investigation and response generation

## Architecture Components

### LangGraph Agents
1. **Triage Agent**: Validate request, identify investigation type, gather IDs, initialize state
2. **Evidence Agent**: Collect transaction data, retrieve logs, incidents, metrics, search runbooks
3. **Root Cause Agent**: Determine probable causes, correlate evidence
4. **Resolution Agent**: Suggest next steps (retry, escalate, monitor, reroute, close)
5. **Explanation Agent**: Generate internal and customer-friendly explanations

### State Management
Central InvestigationState with:
- payment_id, transaction, logs, metrics, incidents, runbook_matches
- candidate_causes, evidence
- root_cause, confidence
- recommendation
- requires_human_review
- customer_explanation

### Confidence Framework
- > 90: Automatic Recommendation
- 70-90: Support Review
- < 70: Human Escalation

## Root Cause Categories
- E1001: Fraud Decline
- E2012: Issuer Timeout
- E3011: Network Failure
- E4015: Duplicate Payment
- E5003: Bank Unavailable

## AIOps Capabilities
- Payment Monitoring: Success Rate, Failure Rate, Latency, Timeout Rate
- Incident Detection: Failure spikes, issuer degradation, rail outages, traffic anomalies
- Incident Correlation: Pattern matching across metrics and historical data

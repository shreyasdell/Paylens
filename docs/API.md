# PayLens API Documentation

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication. This will be added in future versions.

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "details": { ... }
}
```

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "PayLens API",
  "version": "0.1.0"
}
```

### Payment Investigation

#### POST /api/v1/investigate/payment
Investigate a single payment failure.

**Request Parameters:**
- `payment_id` (string, required): Payment ID in format `PAY_XXXXX`

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/investigate/payment?payment_id=PAY_12345"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "payment_id": "PAY_12345",
    "investigation_type": "payment",
    "root_cause": {
      "category": "E2012",
      "description": "Issuer timeout",
      "confidence": 0.95,
      "evidence_summary": [
        "Error code: E2012",
        "Payment status: timeout",
        "High latency detected"
      ]
    },
    "confidence": 0.95,
    "confidence_level": "high",
    "recommendation": {
      "action": "Implement retry with exponential backoff",
      "priority": "MEDIUM",
      "estimated_impact": "Automatically recover from transient timeouts",
      "steps": [
        "Implement retry logic with exponential backoff",
        "Set maximum retry attempts (3-5)",
        "Monitor retry success rate"
      ],
      "requires_automation": true
    },
    "customer_explanation": "The payment processing is taking longer than usual...",
    "internal_explanation": "Root Cause: E2012 - Issuer timeout\nConfidence: 95.0%...",
    "requires_human_review": false,
    "status": "completed"
  }
}
```

#### GET /api/v1/investigate/payment/{payment_id}
Get investigation results for a specific payment.

**Path Parameters:**
- `payment_id` (string, required): Payment ID

**Response:**
```json
{
  "payment_id": "PAY_12345",
  "investigation_results": { ... }
}
```

### Incident Investigation

#### POST /api/v1/investigate/incident
Investigate a payment incident.

**Request Parameters:**
- `incident_id` (string, required): Incident ID in format `INCXXX`

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/investigate/incident?incident_id=INC123"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "incident_id": "INC123",
    "investigation_type": "incident",
    "root_cause": { ... },
    "confidence": 0.88,
    "recommendation": { ... },
    "status": "completed"
  }
}
```

#### GET /api/v1/investigate/incident/{incident_id}
Get investigation results for a specific incident.

**Path Parameters:**
- `incident_id` (string, required): Incident ID

### Support Assistant

#### POST /api/v1/support/query
Process a customer support query.

**Request Body:**
```json
{
  "query": "My payment failed"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/support/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "My payment failed"}'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "customer_explanation": "The payment processing is taking longer than usual...",
    "internal_explanation": "Root Cause: E2012 - Issuer timeout...",
    "root_cause": {
      "category": "E2012",
      "description": "Issuer timeout",
      "confidence": 0.92
    }
  }
}
```

### Data Management

#### GET /api/v1/transactions
List transactions with pagination.

**Query Parameters:**
- `limit` (integer, optional): Number of results (default: 50, max: 200)
- `offset` (integer, optional): Offset for pagination (default: 0)

**Example:**
```bash
curl "http://localhost:8000/api/v1/transactions?limit=10&offset=0"
```

**Response:**
```json
{
  "transactions": [
    {
      "payment_id": "PAY_12345",
      "customer_id": "CUST_1234",
      "merchant_id": "MERC_123",
      "issuer": "HDFC",
      "amount": 100.50,
      "payment_method": "UPI",
      "status": "failed",
      "error_code": "E2012",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ],
  "total": 10000,
  "limit": 10,
  "offset": 0
}
```

#### GET /api/v1/logs
List logs with pagination.

**Query Parameters:**
- `limit` (integer, optional): Number of results (default: 50, max: 200)
- `offset` (integer, optional): Offset for pagination (default: 0)

#### GET /api/v1/metrics
Get metrics for issuers.

**Query Parameters:**
- `issuer` (string, optional): Filter by issuer
- `hours` (integer, optional): Number of hours of data (default: 24, max: 168)

**Example:**
```bash
curl "http://localhost:8000/api/v1/metrics?issuer=HDFC&hours=24"
```

**Response:**
```json
{
  "metrics": [
    {
      "timestamp": "2024-01-01T12:00:00Z",
      "issuer": "HDFC",
      "latency_ms": 245.5,
      "success_rate": 0.97,
      "timeout_rate": 0.02,
      "failure_rate": 0.01
    }
  ],
  "issuer": "HDFC",
  "hours": 24
}
```

#### GET /api/v1/incidents
List incidents with filters.

**Query Parameters:**
- `status` (string, optional): Filter by status
- `severity` (string, optional): Filter by severity
- `limit` (integer, optional): Number of results (default: 50, max: 200)

**Example:**
```bash
curl "http://localhost:8000/api/v1/incidents?status=investigating&severity=HIGH"
```

**Response:**
```json
{
  "incidents": [
    {
      "incident_id": "INC291",
      "issuer": "HDFC",
      "issue": "Elevated timeout rate",
      "severity": "HIGH",
      "status": "investigating",
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "description": "Issue detected for HDFC"
    }
  ],
  "filters": {
    "status": "investigating",
    "severity": "HIGH"
  },
  "limit": 50
}
```

#### POST /api/v1/runbooks/index
Re-index runbooks in ChromaDB.

**Response:**
```json
{
  "status": "success",
  "message": "Runbooks indexed successfully",
  "runbooks_indexed": 5
}
```

### AIOps

#### GET /api/v1/aiops/health
Get AIOps system health status.

**Response:**
```json
{
  "status": "healthy",
  "components": {
    "database": "operational",
    "chromadb": "operational",
    "ollama": "operational",
    "agents": "operational"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### GET /api/v1/aiops/metrics
Get AIOps metrics.

**Response:**
```json
{
  "investigations_today": 150,
  "avg_investigation_time": "2.5s",
  "success_rate": 0.92,
  "auto_resolution_rate": 0.78,
  "human_review_rate": 0.22
}
```

#### POST /api/v1/aiops/detect-anomalies
Detect anomalies in metrics.

**Response:**
```json
{
  "anomalies_detected": 2,
  "anomalies": [
    {
      "type": "elevated_timeout_rate",
      "issuer": "HDFC",
      "severity": "HIGH",
      "confidence": 0.85
    },
    {
      "type": "success_rate_drop",
      "issuer": "ICICI",
      "severity": "MEDIUM",
      "confidence": 0.72
    }
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily down |

## Rate Limiting

Currently, there are no rate limits. This will be implemented in future versions.

## WebSocket Support

WebSocket support for real-time updates will be added in future versions.

## Interactive Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
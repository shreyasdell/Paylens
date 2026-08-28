// Test data fixtures for Playwright tests

export const testPaymentIds = [
  'PAY_12345',
  'PAY_67890',
  'PAY_11111',
  'PAY_22222'
];

export const testIncidentIds = [
  'INC123',
  'INC456',
  'INC789'
];

export const testQueries = [
  'My payment failed',
  'Why was my payment declined?',
  'Payment status pending',
  'Refund status',
  'Payment timeout'
];

export const mockInvestigationResult = {
  status: 'success',
  data: {
    root_cause: {
      category: 'E2012',
      description: 'Issuer timeout',
      confidence: 0.95,
      evidence_summary: [
        'Error code: E2012',
        'Payment status: timeout',
        'High latency detected'
      ]
    },
    confidence: 0.95,
    recommendation: {
      action: 'Implement retry with exponential backoff',
      priority: 'MEDIUM',
      steps: [
        'Implement retry logic with exponential backoff',
        'Set maximum retry attempts (3-5)',
        'Monitor retry success rate'
      ]
    },
    customer_explanation: 'The payment processing is taking longer than usual. This may be due to high demand or temporary issues with the bank\'s systems.',
    internal_explanation: 'Root Cause: E2012 - Issuer timeout\nConfidence: 95.0%\n\nEvidence:\n- Error code: E2012\n- Payment status: timeout\n- High latency detected',
    requires_human_review: false,
    status: 'completed'
  }
};

export const mockSupportResponse = {
  status: 'success',
  data: {
    customer_explanation: 'The payment processing is taking longer than usual. This may be due to high demand or temporary issues with the bank\'s systems.',
    internal_explanation: 'Root Cause: E2012 - Issuer timeout\nConfidence: 95.0%',
    root_cause: {
      category: 'E2012',
      description: 'Issuer timeout',
      confidence: 0.95
    }
  }
};
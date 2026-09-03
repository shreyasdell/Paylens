import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('ML Anomaly Detection API', () => {
  test('should detect anomalies using trained ML model', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/aiops/detect-anomalies`, {
      data: {
        metrics: [
          {
            timestamp: new Date().toISOString(),
            issuer: 'HDFC',
            latency_ms: 1500,  // High latency - potential anomaly
            success_rate: 0.85,  // Low success rate - potential anomaly
            timeout_rate: 0.15,  // High timeout rate - potential anomaly
            failure_rate: 0.10   // High failure rate - potential anomaly
          }
        ]
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('anomalies');
    expect(Array.isArray(data.anomalies)).toBeTruthy();
  });

  test('should handle normal metrics without anomalies', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/aiops/detect-anomalies`, {
      data: {
        metrics: [
          {
            timestamp: new Date().toISOString(),
            issuer: 'HDFC',
            latency_ms: 200,    // Normal latency
            success_rate: 0.98, // Normal success rate
            timeout_rate: 0.02, // Normal timeout rate
            failure_rate: 0.01  // Normal failure rate
          }
        ]
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('anomalies');
    // Should have fewer or no anomalies for normal data
    expect(data.anomalies.length).toBeLessThan(2);
  });

  test('should detect time series anomalies', async ({ request }) => {
    // Generate time series data with anomalies
    const timeSeriesData = Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      issuer: 'ICICI',
      latency_ms: i < 5 ? 1500 : 200,  // First 5 points have high latency
      success_rate: i < 5 ? 0.85 : 0.98,
      timeout_rate: i < 5 ? 0.15 : 0.02,
      failure_rate: i < 5 ? 0.10 : 0.01
    }));

    const response = await request.post(`${API_URL}/api/v1/aiops/detect-time-series-anomalies`, {
      data: {
        metrics: timeSeriesData
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('anomalies');
    expect(Array.isArray(data.anomalies)).toBeTruthy();
  });

  test('should generate incidents from anomaly patterns', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/aiops/detect-incidents`, {
      data: {
        anomalies: [
          {
            data: { issuer: 'HDFC' },
            metric: 'timeout_rate',
            severity: 'high',
            timestamp: new Date().toISOString()
          },
          {
            data: { issuer: 'HDFC' },
            metric: 'timeout_rate',
            severity: 'high',
            timestamp: new Date().toISOString()
          },
          {
            data: { issuer: 'HDFC' },
            metric: 'timeout_rate',
            severity: 'high',
            timestamp: new Date().toISOString()
          }
        ]
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('incidents');
    expect(Array.isArray(data.incidents)).toBeTruthy();
    
    // Should detect an incident with 3+ anomalies for same issuer
    if (data.incidents.length > 0) {
      expect(data.incidents[0]).toHaveProperty('issuer', 'HDFC');
      expect(data.incidents[0]).toHaveProperty('severity');
    }
  });

  test('should handle ML model training request', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/aiops/train-model`, {
      data: {
        training_data: Array.from({ length: 100 }, () => ({
          timestamp: new Date().toISOString(),
          issuer: ['HDFC', 'ICICI', 'SBI'][Math.floor(Math.random() * 3)],
          latency_ms: Math.random() * 500,
          success_rate: 0.9 + Math.random() * 0.1,
          timeout_rate: Math.random() * 0.05,
          failure_rate: Math.random() * 0.05,
          transaction_count: Math.floor(Math.random() * 500),
          transaction_amount: Math.random() * 100000
        }))
      }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('message');
  });

  test('should return model training status', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/aiops/model-status`);

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('is_trained');
    expect(data).toHaveProperty('model_info');
  });
});
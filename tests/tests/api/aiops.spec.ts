import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('AIOps API', () => {
  test('should return system health status', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/aiops/health`);

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('service');
    expect(data).toHaveProperty('version');
  });

  test('should return AIOps metrics', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/aiops/metrics`);

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('metrics');
    expect(Array.isArray(data.metrics)).toBeTruthy();
  });

  test('should detect anomalies in payment metrics', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/aiops/detect-anomalies`);

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('anomalies');
    expect(Array.isArray(data.anomalies)).toBeTruthy();
  });

  test('should handle concurrent anomaly detection requests', async ({ request }) => {
    // Test concurrent requests
    const requests = Array(5).fill(null).map(() => 
      request.post(`${API_URL}/api/v1/aiops/detect-anomalies`)
    );

    const responses = await Promise.all(requests);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
  });
});
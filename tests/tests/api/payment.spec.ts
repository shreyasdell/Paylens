import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Payment Investigation API', () => {
  test('should investigate a payment successfully', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/investigate/payment`, {
      params: { payment_id: 'PAY_12345' }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'success');
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('root_cause');
    expect(data.data).toHaveProperty('confidence');
  });

  test('should return investigation results for a payment', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/investigate/payment/PAY_12345`);

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('payment_id', 'PAY_12345');
  });

  test('should handle invalid payment ID format', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/investigate/payment`, {
      params: { payment_id: 'INVALID_FORMAT' }
    });

    // Should either return an error or handle gracefully
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
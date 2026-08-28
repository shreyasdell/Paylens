import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Support Assistant API', () => {
  test('should process customer support query', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/support/query`, {
      data: { query: 'My payment failed' }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'success');
    expect(data.data).toHaveProperty('customer_explanation');
    expect(data.data).toHaveProperty('internal_explanation');
  });

  test('should handle empty query gracefully', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/support/query`, {
      data: { query: '' }
    });

    // Should handle empty query gracefully
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should provide relevant explanations for payment issues', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/support/query`, {
      data: { query: 'Why did my payment PAY_12345 fail?' }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.data.customer_explanation).toBeTruthy();
    expect(data.data.customer_explanation.length).toBeGreaterThan(0);
  });
});
import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('Incident Investigation API', () => {
  test('should investigate an incident successfully', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/v1/investigate/incident`, {
      params: { incident_id: 'INC123' }
    });

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'success');
    expect(data).toHaveProperty('data');
  });

  test('should return investigation results for an incident', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/v1/investigate/incident/INC123`);

    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('incident_id', 'INC123');
  });
});
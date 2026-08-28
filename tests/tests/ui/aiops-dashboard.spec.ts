import { test, expect } from '@playwright/test';

test.describe('AIOps Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display AIOps dashboard tab', async ({ page }) => {
    await expect(page.getByText('AIOps Dashboard')).toBeVisible();
  });

  test('should navigate to AIOps dashboard tab', async ({ page }) => {
    await page.click('text=AIOps Dashboard');
    await expect(page.getByText('System Health')).toBeVisible();
  });

  test('should display system health status', async ({ page }) => {
    await page.click('text=AIOps Dashboard');
    
    await expect(page.getByText('System Health')).toBeVisible();
    await expect(page.getByText('Refresh')).toBeVisible();
  });

  test('should display key metrics', async ({ page }) => {
    await page.click('text=AIOps Dashboard');
    
    await expect(page.getByText('Investigations Today')).toBeVisible();
    await expect(page.getByText('Avg Investigation Time')).toBeVisible();
    await expect(page.getByText('Success Rate')).toBeVisible();
    await expect(page.getByText('Auto-Resolution Rate')).toBeVisible();
  });

  test('should display detected anomalies section', async ({ page }) => {
    await page.click('text=AIOps Dashboard');
    
    await expect(page.getByText('Detected Anomalies')).toBeVisible();
  });

  test('should display performance trends section', async ({ page }) => {
    await page.click('text=AIOps Dashboard');
    
    await expect(page.getByText('Performance Trends')).toBeVisible();
  });

  test('should display recent activity section', async ({ page }) => {
    await page.click('text=AIOps Dashboard');
    
    await expect(page.getByText('Recent Activity')).toBeVisible();
  });

  test('should refresh dashboard data', async ({ page }) => {
    await page.click('text=AIOps Dashboard');
    
    const refreshButton = page.getByRole('button', { name: 'Refresh' });
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();
    
    // Should still be on the dashboard after refresh
    await expect(page.getByText('System Health')).toBeVisible();
  });
});
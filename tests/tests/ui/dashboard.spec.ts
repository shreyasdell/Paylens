import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FRONTEND_URL);
  });

  test('should load dashboard page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/PayLens/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display KPI cards', async ({ page }) => {
    // Check for KPI cards
    const kpiCards = page.locator('[data-testid="kpi-card"]');
    await expect(kpiCards.first()).toBeVisible();
    
    // Should have multiple KPI cards
    const cardCount = await kpiCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should display payment chart', async ({ page }) => {
    const chart = page.locator('[data-testid="payment-chart"]');
    await expect(chart).toBeVisible();
  });

  test('should display incidents table', async ({ page }) => {
    const incidentsTable = page.locator('[data-testid="incidents-table"]');
    await expect(incidentsTable).toBeVisible();
  });

  test('should display failed payments section', async ({ page }) => {
    const failedPayments = page.locator('[data-testid="failed-payments"]');
    await expect(failedPayments).toBeVisible();
  });

  test('should navigate to payment investigation', async ({ page }) => {
    // Click on payment investigation link/button
    const paymentInvestigationLink = page.locator('a[href*="investigate"]').first();
    await paymentInvestigationLink.click();
    
    // Should navigate to investigation page
    await expect(page).toHaveURL(/.*investigate/);
  });

  test('should show responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile layout is working
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();
  });
});
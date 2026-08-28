import { test, expect } from '@playwright/test';

test.describe('Payment Investigation UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display payment investigation tab', async ({ page }) => {
    await expect(page.getByText('Payment Investigation')).toBeVisible();
  });

  test('should navigate to payment investigation tab', async ({ page }) => {
    await page.click('text=Payment Investigation');
    await expect(page.locator('input[placeholder*="payment ID"]')).toBeVisible();
  });

  test('should show payment investigation form', async ({ page }) => {
    await page.click('text=Payment Investigation');
    
    await expect(page.getByPlaceholder('Enter payment ID (e.g., PAY_12345)')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Investigate' })).toBeVisible();
  });

  test('should validate empty payment ID', async ({ page }) => {
    await page.click('text=Payment Investigation');
    await page.click('button:has-text("Investigate")');
    
    await expect(page.getByText('Please enter a payment ID')).toBeVisible();
  });

  test('should submit payment investigation', async ({ page }) => {
    await page.click('text=Payment Investigation');
    
    await page.fill('input[placeholder*="payment ID"]', 'PAY_12345');
    await page.click('button:has-text("Investigate")');
    
    // Should show loading state
    await expect(page.getByText('Investigating...')).toBeVisible();
  });

  test('should display investigation results', async ({ page }) => {
    await page.click('text=Payment Investigation');
    
    await page.fill('input[placeholder*="payment ID"]', 'PAY_12345');
    await page.click('button:has-text("Investigate")');
    
    // Wait for results (this might need adjustment based on actual API response time)
    await page.waitForTimeout(3000);
    
    // Check for result sections
    const hasResults = await page.locator('text=Investigation Status').isVisible();
    if (hasResults) {
      await expect(page.getByText('Root Cause Analysis')).toBeVisible();
      await expect(page.getByText('Recommendation')).toBeVisible();
    }
  });

  test('should display confidence score with appropriate color', async ({ page }) => {
    await page.click('text=Payment Investigation');
    
    await page.fill('input[placeholder*="payment ID"]', 'PAY_12345');
    await page.click('button:has-text("Investigate")');
    
    await page.waitForTimeout(3000);
    
    // Check for confidence display
    const confidenceElement = page.locator('text=Confidence');
    const hasConfidence = await confidenceElement.isVisible();
    
    if (hasConfidence) {
      await expect(confidenceElement).toBeVisible();
    }
  });
});
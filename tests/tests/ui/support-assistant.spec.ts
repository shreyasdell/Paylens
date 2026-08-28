import { test, expect } from '@playwright/test';

test.describe('Support Assistant UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display support assistant tab', async ({ page }) => {
    await expect(page.getByText('Support Assistant')).toBeVisible();
  });

  test('should navigate to support assistant tab', async ({ page }) => {
    await page.click('text=Support Assistant');
    await expect(page.getByPlaceholder('Type your message...')).toBeVisible();
  });

  test('should show chat interface', async ({ page }) => {
    await page.click('text=Support Assistant');
    
    await expect(page.getByPlaceholder('Type your message...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
  });

  test('should display initial greeting message', async ({ page }) => {
    await page.click('text=Support Assistant');
    
    await expect(page.getByText(/Hello! I'm the PayLens support assistant/)).toBeVisible();
  });

  test('should send user message', async ({ page }) => {
    await page.click('text=Support Assistant');
    
    await page.fill('input[placeholder*="Type your message"]', 'My payment failed');
    await page.click('button:has-text("Send")');
    
    // Should show user message
    await expect(page.getByText('My payment failed')).toBeVisible();
  });

  test('should show loading state while processing', async ({ page }) => {
    await page.click('text=Support Assistant');
    
    await page.fill('input[placeholder*="Type your message"]', 'My payment failed');
    await page.click('button:has-text("Send")');
    
    // Should show loading indicator
    await expect(page.locator('.animate-bounce')).toBeVisible();
  });

  test('should display assistant response', async ({ page }) => {
    await page.click('text=Support Assistant');
    
    await page.fill('input[placeholder*="Type your message"]', 'My payment failed');
    await page.click('button:has-text("Send")');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should have multiple messages (initial + user + response)
    const messages = page.locator('[class*="rounded-lg"]');
    await expect(messages.count()).resolves.toBeGreaterThanOrEqual(2);
  });

  test('should use quick action buttons', async ({ page }) => {
    await page.click('text=Support Assistant');
    
    await page.click('text=My payment failed');
    
    // Should populate input field
    const input = page.locator('input[placeholder*="Type your message"]');
    await expect(input).toHaveValue('My payment failed');
  });

  test('should display multiple quick action options', async ({ page }) => {
    await page.click('text=Support Assistant');
    
    await expect(page.getByText('My payment failed')).toBeVisible();
    await expect(page.getByText('Payment status pending')).toBeVisible();
    await expect(page.getByText('Refund status')).toBeVisible();
    await expect(page.getByText('Payment timeout')).toBeVisible();
  });

  test('should maintain conversation history', async ({ page }) => {
    await page.click('text=Support Assistant');
    
    // Send first message
    await page.fill('input[placeholder*="Type your message"]', 'First message');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(2000);
    
    // Send second message
    await page.fill('input[placeholder*="Type your message"]', 'Second message');
    await page.click('button:has-text("Send")');
    await page.waitForTimeout(2000);
    
    // Should have conversation history
    await expect(page.getByText('First message')).toBeVisible();
    await expect(page.getByText('Second message')).toBeVisible();
  });
});
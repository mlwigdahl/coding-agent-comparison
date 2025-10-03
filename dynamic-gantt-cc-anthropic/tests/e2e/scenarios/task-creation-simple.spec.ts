import { test, expect } from '@playwright/test';

test.describe('Task Creation - Simple Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should open task modal and verify form fields are present', async ({ page }) => {
    // Click Add Task button
    await page.locator('[aria-label="Add New Task"]').click();

    // Wait for modal to open
    const modal = page.locator('.bg-white.rounded-lg.shadow-xl');
    await expect(modal).toBeVisible();

    // Verify form fields are present
    await expect(page.getByLabel(/task name/i)).toBeVisible();
    await expect(page.getByText('Team')).toBeVisible();
    await expect(page.getByText('Start Quarter')).toBeVisible();
    await expect(page.getByText('End Quarter')).toBeVisible();
    await expect(page.getByLabel(/progress/i)).toBeVisible();
    await expect(page.getByText('Color Theme')).toBeVisible();

    // Verify action buttons
    await expect(page.getByRole('button', { name: /create task/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test('should verify initial teams are visible with task counts', async ({ page }) => {
    // Check that initial teams are visible with task counts
    await expect(page.getByText('Pet Fish (0)')).toBeVisible();
    await expect(page.getByText('Infrastructure (0)')).toBeVisible();
  });

  test('should verify timeline headers are present', async ({ page }) => {
    // Check timeline headers
    await expect(page.getByText('Teams')).toBeVisible();
    await expect(page.getByText(/Q1.*2024/)).toBeVisible();
    await expect(page.getByText(/Q2.*2024/)).toBeVisible();
    await expect(page.getByText(/Q3.*2024/)).toBeVisible();
    await expect(page.getByText(/Q4.*2024/)).toBeVisible();
  });

  test('should be able to open and close task modal multiple times', async ({ page }) => {
    const modal = page.locator('.bg-white.rounded-lg.shadow-xl');

    // Open and close modal first time
    await page.locator('[aria-label="Add New Task"]').click();
    await expect(modal).toBeVisible();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(modal).not.toBeVisible();

    // Open and close modal second time
    await page.locator('[aria-label="Add New Task"]').click();
    await expect(modal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Open and close modal third time
    await page.locator('[aria-label="Add New Task"]').click();
    await expect(modal).toBeVisible();
    await page.getByRole('button', { name: /delete/i }).click();
    await expect(modal).not.toBeVisible();
  });
});
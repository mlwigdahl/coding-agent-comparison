import { test, expect } from '@playwright/test';

test.describe('Task Creation and Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should create a task and display it in the timeline', async ({ page }) => {
    // Click Add Task button
    await page.locator('[aria-label="Add New Task"]').click();

    // Wait for modal to open
    const modal = page.locator('.bg-white.rounded-lg.shadow-xl');
    await expect(modal).toBeVisible();

    // Fill out the form
    await page.getByLabel(/task name/i).fill('Test Task Display');
    
    // Select team from dropdown
    await page.locator('[role="button"]').filter({ hasText: 'Select team' }).click();
    await page.getByRole('option', { name: 'Pet Fish' }).click();

    // Set start quarter
    await page.locator('[role="button"]').filter({ hasText: 'Select start quarter' }).click();
    await page.getByRole('option', { name: 'Q1 2025' }).click();

    // Set end quarter  
    await page.locator('[role="button"]').filter({ hasText: 'Select end quarter' }).click();
    await page.getByRole('option', { name: 'Q2 2025' }).click();

    // Set progress
    await page.getByLabel(/progress/i).fill('25');

    // Set color theme
    await page.locator('[role="button"]').filter({ hasText: 'Select color theme' }).click();
    await page.getByRole('option', { name: 'Blue' }).click();

    // Submit the form
    await page.getByRole('button', { name: /create task/i }).click();

    // Wait for modal to close
    await expect(modal).not.toBeVisible();

    // Verify the task appears in the timeline
    // Look for task with the name we created
    await expect(page.getByText('Test Task Display')).toBeVisible();
    
    // Verify the task shows progress
    await expect(page.getByText('25%')).toBeVisible();
    
    // Verify task count updated for Pet Fish team
    await expect(page.getByText('Pet Fish (1)')).toBeVisible();
  });

  test('should create multiple tasks and display them all', async ({ page }) => {
    // Create first task
    await page.locator('[aria-label="Add New Task"]').click();
    const modal = page.locator('.bg-white.rounded-lg.shadow-xl');
    await expect(modal).toBeVisible();

    await page.getByLabel(/task name/i).fill('First Task');
    await page.locator('[role="button"]').filter({ hasText: 'Select team' }).click();
    await page.getByRole('option', { name: 'Pet Fish' }).click();
    await page.locator('[role="button"]').filter({ hasText: 'Select start quarter' }).click();
    await page.getByRole('option', { name: 'Q1 2025' }).click();
    await page.locator('[role="button"]').filter({ hasText: 'Select end quarter' }).click();
    await page.getByRole('option', { name: 'Q1 2025' }).click();
    await page.getByLabel(/progress/i).fill('50');
    await page.locator('[role="button"]').filter({ hasText: 'Select color theme' }).click();
    await page.getByRole('option', { name: 'Blue' }).click();
    await page.getByRole('button', { name: /create task/i }).click();
    await expect(modal).not.toBeVisible();

    // Create second task
    await page.locator('[aria-label="Add New Task"]').click();
    await expect(modal).toBeVisible();

    await page.getByLabel(/task name/i).fill('Second Task');
    await page.locator('[role="button"]').filter({ hasText: 'Select team' }).click();
    await page.getByRole('option', { name: 'Infrastructure' }).click();
    await page.locator('[role="button"]').filter({ hasText: 'Select start quarter' }).click();
    await page.getByRole('option', { name: 'Q2 2025' }).click();
    await page.locator('[role="button"]').filter({ hasText: 'Select end quarter' }).click();
    await page.getByRole('option', { name: 'Q3 2025' }).click();
    await page.getByLabel(/progress/i).fill('75');
    await page.locator('[role="button"]').filter({ hasText: 'Select color theme' }).click();
    await page.getByRole('option', { name: 'Indigo' }).click();
    await page.getByRole('button', { name: /create task/i }).click();
    await expect(modal).not.toBeVisible();

    // Verify both tasks appear
    await expect(page.getByText('First Task')).toBeVisible();
    await expect(page.getByText('Second Task')).toBeVisible();
    
    // Verify progress percentages
    await expect(page.getByText('50%')).toBeVisible();
    await expect(page.getByText('75%')).toBeVisible();

    // Verify task counts updated
    await expect(page.getByText('Pet Fish (1)')).toBeVisible();
    await expect(page.getByText('Infrastructure (1)')).toBeVisible();
  });

  test('should prevent creating duplicate task names', async ({ page }) => {
    // Create first task
    await page.locator('[aria-label="Add New Task"]').click();
    const modal = page.locator('.bg-white.rounded-lg.shadow-xl');
    await expect(modal).toBeVisible();

    await page.getByLabel(/task name/i).fill('Duplicate Task');
    await page.locator('[role="button"]').filter({ hasText: 'Select team' }).click();
    await page.getByRole('option', { name: 'Pet Fish' }).click();
    await page.locator('[role="button"]').filter({ hasText: 'Select start quarter' }).click();
    await page.getByRole('option', { name: 'Q1 2025' }).click();
    await page.locator('[role="button"]').filter({ hasText: 'Select end quarter' }).click();
    await page.getByRole('option', { name: 'Q1 2025' }).click();
    await page.getByLabel(/progress/i).fill('50');
    await page.locator('[role="button"]').filter({ hasText: 'Select color theme' }).click();
    await page.getByRole('option', { name: 'Blue' }).click();
    await page.getByRole('button', { name: /create task/i }).click();
    await expect(modal).not.toBeVisible();

    // Try to create second task with same name
    await page.locator('[aria-label="Add New Task"]').click();
    await expect(modal).toBeVisible();

    await page.getByLabel(/task name/i).fill('Duplicate Task');
    await page.locator('[role="button"]').filter({ hasText: 'Select team' }).click();
    await page.getByRole('option', { name: 'Infrastructure' }).click();
    await page.locator('[role="button"]').filter({ hasText: 'Select start quarter' }).click();
    await page.getByRole('option', { name: 'Q2 2025' }).click();
    await page.locator('[role="button"]').filter({ hasText: 'Select end quarter' }).click();
    await page.getByRole('option', { name: 'Q2 2025' }).click();
    await page.getByLabel(/progress/i).fill('25');
    await page.locator('[role="button"]').filter({ hasText: 'Select color theme' }).click();
    await page.getByRole('option', { name: 'Indigo' }).click();
    await page.getByRole('button', { name: /create task/i }).click();

    // Should show error and modal should stay open
    await expect(modal).toBeVisible();
    await expect(page.getByText(/already exists/i)).toBeVisible();

    // Cancel out of modal
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(modal).not.toBeVisible();

    // Verify only one task exists
    const duplicateTasks = page.getByText('Duplicate Task');
    await expect(duplicateTasks).toHaveCount(1);
  });
});
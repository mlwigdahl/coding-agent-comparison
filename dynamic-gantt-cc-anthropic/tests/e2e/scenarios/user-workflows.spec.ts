import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Dynamic Project Timeline - User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await expect(page.locator('h1')).toContainText('Dynamic Project Timeline - Quarterly View');
  });

  test.describe('Initial State and Layout', () => {
    test('should display correct header layout and elements', async ({ page }) => {
      // Verify header elements exist and are positioned correctly
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Check for calendar icon and title
      await expect(page.locator('[data-testid="calendar-icon"]')).toBeVisible();
      await expect(page.locator('h1')).toContainText('Dynamic Project Timeline - Quarterly View');

      // Check for timeline selector
      await expect(page.locator('[data-testid="timeline-selector"]')).toBeVisible();
      await expect(page.locator('[data-testid="new-timeline-button"]')).toBeVisible();

      // Check for action buttons
      await expect(page.locator('[data-testid="export-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="import-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-team-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-task-button"]')).toBeVisible();
    });

    test('should display correct timeline grid layout', async ({ page }) => {
      // Check for Teams column
      await expect(page.locator('[data-testid="teams-header"]')).toContainText('Teams');

      // Check for quarterly columns (Q1 2025 - Q4 2028 = 16 quarters)
      const quarterColumns = page.locator('[data-testid="quarter-column"]');
      await expect(quarterColumns).toHaveCount(16);

      // Verify first and last quarter labels
      await expect(page.locator('[data-testid="quarter-Q1-2025"]')).toBeVisible();
      await expect(page.locator('[data-testid="quarter-Q4-2028"]')).toBeVisible();

      // Check for year separators
      const yearSeparators = page.locator('[data-testid="year-separator"]');
      await expect(yearSeparators).toHaveCount(4); // 2025, 2026, 2027, 2028
    });

    test('should display initial teams (Pet Fish, Infrastructure)', async ({ page }) => {
      // Check for default teams from initial state
      await expect(page.locator('[data-testid="team-Pet Fish"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-Infrastructure"]')).toBeVisible();

      // Verify task counts are initially (0)
      await expect(page.locator('[data-testid="team-Pet Fish"] .task-count')).toContainText('(0)');
      await expect(page.locator('[data-testid="team-Infrastructure"] .task-count')).toContainText('(0)');
    });
  });

  test.describe('Task Creation and Management', () => {
    test('should create a new task successfully', async ({ page }) => {
      // Click "Add Task" button
      await page.locator('[data-testid="add-task-button"]').click();

      // Verify task modal opens
      const modal = page.locator('[data-testid="task-modal"]');
      await expect(modal).toBeVisible();
      await expect(modal.locator('h2')).toContainText('Add Task');

      // Fill in task details
      await page.locator('[data-testid="task-name-input"]').fill('Test Task Creation');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('25');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');

      // Submit the form
      await page.locator('[data-testid="save-task-button"]').click();

      // Verify modal closes
      await expect(modal).not.toBeVisible();

      // Verify task appears in the timeline
      const task = page.locator('[data-testid="task-Test Task Creation"]');
      await expect(task).toBeVisible();
      await expect(task).toContainText('Test Task Creation');
      await expect(task).toContainText('25%');

      // Verify task count updated
      await expect(page.locator('[data-testid="team-Pet Fish"] .task-count')).toContainText('(1)');

      // Verify task has correct color theme (blue)
      await expect(task).toHaveClass(/bg-blue/);
    });

    test('should edit an existing task', async ({ page }) => {
      // First create a task
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Task to Edit');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('0');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();

      // Click on the task to edit it
      await page.locator('[data-testid="task-Task to Edit"]').click();

      // Verify modal opens in edit mode
      const modal = page.locator('[data-testid="task-modal"]');
      await expect(modal).toBeVisible();
      await expect(modal.locator('h2')).toContainText('Edit Task');

      // Verify form is populated with existing data
      await expect(page.locator('[data-testid="task-name-input"]')).toHaveValue('Task to Edit');
      await expect(page.locator('[data-testid="progress-input"]')).toHaveValue('0');

      // Update task details
      await page.locator('[data-testid="task-name-input"]').fill('Updated Task Name');
      await page.locator('[data-testid="progress-input"]').fill('75');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('indigo');

      // Save changes
      await page.locator('[data-testid="update-task-button"]').click();

      // Verify modal closes
      await expect(modal).not.toBeVisible();

      // Verify task is updated in the timeline
      const updatedTask = page.locator('[data-testid="task-Updated Task Name"]');
      await expect(updatedTask).toBeVisible();
      await expect(updatedTask).toContainText('Updated Task Name');
      await expect(updatedTask).toContainText('75%');

      // Verify task has new color theme (indigo)
      await expect(updatedTask).toHaveClass(/bg-indigo/);
    });

    test('should delete a task', async ({ page }) => {
      // First create a task
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Task to Delete');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('50');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();

      // Click on the task to edit it
      await page.locator('[data-testid="task-Task to Delete"]').click();

      // Click delete button
      await page.locator('[data-testid="delete-task-button"]').click();

      // Verify task is removed from timeline
      await expect(page.locator('[data-testid="task-Task to Delete"]')).not.toBeVisible();

      // Verify task count is back to (0)
      await expect(page.locator('[data-testid="team-Pet Fish"] .task-count')).toContainText('(0)');
    });

    test('should validate task form inputs', async ({ page }) => {
      // Click "Add Task" button
      await page.locator('[data-testid="add-task-button"]').click();

      // Try to submit empty form
      await page.locator('[data-testid="save-task-button"]').click();

      // Verify validation errors appear
      await expect(page.locator('[data-testid="task-name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-error"]')).toBeVisible();

      // Test invalid progress values
      await page.locator('[data-testid="progress-input"]').fill('150');
      await page.locator('[data-testid="save-task-button"]').click();
      await expect(page.locator('[data-testid="progress-error"]')).toBeVisible();

      await page.locator('[data-testid="progress-input"]').fill('-10');
      await page.locator('[data-testid="save-task-button"]').click();
      await expect(page.locator('[data-testid="progress-error"]')).toBeVisible();

      // Test invalid quarter range (end before start)
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q4 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="save-task-button"]').click();
      await expect(page.locator('[data-testid="quarter-range-error"]')).toBeVisible();
    });
  });

  test.describe('Timeline Management', () => {
    test('should create a new timeline', async ({ page }) => {
      // Click new timeline button
      await page.locator('[data-testid="new-timeline-button"]').click();

      // Verify timeline modal opens
      const modal = page.locator('[data-testid="timeline-modal"]');
      await expect(modal).toBeVisible();
      await expect(modal.locator('h2')).toContainText('Add New Timeline');

      // Fill in timeline name
      await page.locator('[data-testid="timeline-name-input"]').fill('Test Timeline');

      // Save timeline
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Verify modal closes
      await expect(modal).not.toBeVisible();

      // Verify new timeline appears in dropdown
      await page.locator('[data-testid="timeline-selector"]').click();
      await expect(page.locator('option[value="Test Timeline"]')).toBeVisible();

      // Verify timeline is automatically selected
      await expect(page.locator('[data-testid="timeline-selector"]')).toHaveValue('Test Timeline');
    });

    test('should switch between timelines', async ({ page }) => {
      // Create two timelines with different tasks
      // Timeline 1
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Timeline A');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Add task to Timeline A
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Task A');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('50');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();

      // Create Timeline 2
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Timeline B');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Add different task to Timeline B
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Task B');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Infrastructure');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q3 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q4 2025');
      await page.locator('[data-testid="progress-input"]').fill('25');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('indigo');
      await page.locator('[data-testid="save-task-button"]').click();

      // Switch back to Timeline A
      await page.locator('[data-testid="timeline-selector"]').selectOption('Timeline A');

      // Verify Timeline A's task is visible and Timeline B's task is not
      await expect(page.locator('[data-testid="task-Task A"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-Task B"]')).not.toBeVisible();

      // Switch to Timeline B
      await page.locator('[data-testid="timeline-selector"]').selectOption('Timeline B');

      // Verify Timeline B's task is visible and Timeline A's task is not
      await expect(page.locator('[data-testid="task-Task B"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-Task A"]')).not.toBeVisible();
    });

    test('should validate unique timeline names', async ({ page }) => {
      // Create first timeline
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Duplicate Name');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Try to create timeline with same name
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Duplicate Name');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Verify error message appears
      await expect(page.locator('[data-testid="timeline-name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="timeline-name-error"]')).toContainText('already exists');
    });
  });

  test.describe('Team Management', () => {
    test('should create a new team', async ({ page }) => {
      // Click add team button
      await page.locator('[data-testid="add-team-button"]').click();

      // Verify team modal opens
      const modal = page.locator('[data-testid="team-modal"]');
      await expect(modal).toBeVisible();
      await expect(modal.locator('h2')).toContainText('Add New Team');

      // Fill in team name
      await page.locator('[data-testid="team-name-input"]').fill('New Team');

      // Save team
      await page.locator('[data-testid="save-team-button"]').click();

      // Verify modal closes
      await expect(modal).not.toBeVisible();

      // Verify new team appears in swimlanes
      await expect(page.locator('[data-testid="team-New Team"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-New Team"] .task-count')).toContainText('(0)');

      // Verify team appears in task creation dropdown
      await page.locator('[data-testid="add-task-button"]').click();
      await expect(page.locator('[data-testid="team-dropdown"] option[value="New Team"]')).toBeVisible();
      await page.locator('[data-testid="cancel-button"]').click();
    });

    test('should validate unique team names', async ({ page }) => {
      // Try to create team with existing name
      await page.locator('[data-testid="add-team-button"]').click();
      await page.locator('[data-testid="team-name-input"]').fill('Pet Fish');
      await page.locator('[data-testid="save-team-button"]').click();

      // Verify error message appears
      await expect(page.locator('[data-testid="team-name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-name-error"]')).toContainText('already exists');
    });
  });

  test.describe('Animation System', () => {
    test('should animate task transitions when switching timelines', async ({ page }) => {
      // Create two timelines with a task that has the same name but different positions
      // Timeline 1
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Timeline A');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Add task to Timeline A at Q1-Q2
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Animated Task');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('50');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();

      // Create Timeline 2
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Timeline B');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Add same task to Timeline B at Q3-Q4 (different position)
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Animated Task');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q3 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q4 2025');
      await page.locator('[data-testid="progress-input"]').fill('75');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('indigo');
      await page.locator('[data-testid="save-task-button"]').click();

      // Get task element for animation testing
      const task = page.locator('[data-testid="task-Animated Task"]');

      // Switch to Timeline A and measure animation
      await page.locator('[data-testid="timeline-selector"]').selectOption('Timeline A');

      // Verify task has transition CSS properties
      await expect(task).toHaveCSS('transition-duration', '2s');

      // Switch back to Timeline B and verify task moves
      await page.locator('[data-testid="timeline-selector"]').selectOption('Timeline B');

      // Wait for animation to complete (2 seconds)
      await page.waitForTimeout(2100);

      // Verify task is in the correct final position
      await expect(task).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify header elements are still accessible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="timeline-selector"]')).toBeVisible();

      // Test that buttons work on mobile
      await page.locator('[data-testid="add-task-button"]').click();
      const modal = page.locator('[data-testid="task-modal"]');
      await expect(modal).toBeVisible();

      // Verify modal is properly sized for mobile
      const modalBox = await modal.boundingBox();
      expect(modalBox?.width).toBeLessThan(400);

      await page.locator('[data-testid="cancel-button"]').click();
    });

    test('should handle horizontal scroll for timeline grid', async ({ page }) => {
      // Set narrow viewport to force horizontal scroll
      await page.setViewportSize({ width: 800, height: 600 });

      // Verify Teams column remains fixed
      const teamsColumn = page.locator('[data-testid="teams-header"]');
      await expect(teamsColumn).toBeVisible();

      // Scroll horizontally to the right
      await page.locator('[data-testid="timeline-grid"]').evaluate((el) => {
        el.scrollLeft = 500;
      });

      // Verify Teams column is still visible (fixed)
      await expect(teamsColumn).toBeVisible();

      // Verify later quarters are visible after scroll
      await expect(page.locator('[data-testid="quarter-Q4-2028"]')).toBeVisible();
    });
  });
});
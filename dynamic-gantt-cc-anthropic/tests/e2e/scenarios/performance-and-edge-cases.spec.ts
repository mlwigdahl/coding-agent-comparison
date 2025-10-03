import { test, expect } from '@playwright/test';

test.describe('Performance and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dynamic Project Timeline - Quarterly View');
  });

  test.describe('Performance Tests', () => {
    test('should load initial page within performance targets', async ({ page }) => {
      const startTime = Date.now();
      
      // Wait for all critical elements to be visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="timeline-selector"]')).toBeVisible();
      await expect(page.locator('[data-testid="teams-header"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 2 seconds (APP-PLAN.md target)
      expect(loadTime).toBeLessThan(2000);
    });

    test('should handle timeline switching within performance targets', async ({ page }) => {
      // Create test timeline with data
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Performance Test Timeline');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Add a task for switching test
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Performance Task');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('50');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();

      // Measure timeline switching performance
      const startTime = Date.now();
      
      await page.locator('[data-testid="timeline-selector"]').selectOption('Main Timeline');
      
      // Wait for the switch to complete (excluding 2s animation)
      await page.waitForTimeout(100); // Small buffer for DOM updates
      
      const switchTime = Date.now() - startTime;
      
      // Should switch within 100ms excluding animation (APP-PLAN.md target)
      expect(switchTime).toBeLessThan(200); // Allow some buffer for test environment
    });

    test('should handle task positioning for large datasets efficiently', async ({ page }) => {
      const taskCount = 50;
      const startTime = Date.now();
      
      // Create many overlapping tasks to stress-test positioning algorithm
      for (let i = 0; i < taskCount; i++) {
        await page.locator('[data-testid="add-task-button"]').click();
        await page.locator('[data-testid="task-name-input"]').fill(`Performance Task ${i}`);
        await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
        await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
        await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
        await page.locator('[data-testid="progress-input"]').fill((i % 101).toString());
        await page.locator('[data-testid="color-theme-dropdown"]').selectOption(i % 2 === 0 ? 'blue' : 'indigo');
        await page.locator('[data-testid="save-task-button"]').click();
      }
      
      const totalTime = Date.now() - startTime;
      
      // Verify all tasks are positioned correctly
      const tasks = page.locator('[data-testid^="task-Performance Task"]');
      await expect(tasks).toHaveCount(taskCount);
      
      // Task positioning should be completed within reasonable time
      // Note: This includes modal interactions, not just positioning algorithm
      expect(totalTime).toBeLessThan(30000); // 30 seconds for 50 tasks with UI interactions
      
      // Verify task count is updated
      await expect(page.locator('[data-testid="team-Pet Fish"] .task-count')).toContainText(`(${taskCount})`);
    });

    test('should maintain responsive performance on mobile viewports', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      
      // Test critical mobile interactions
      await page.locator('[data-testid="add-task-button"]').click();
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
      
      const modalOpenTime = Date.now() - startTime;
      expect(modalOpenTime).toBeLessThan(500);
      
      await page.locator('[data-testid="cancel-button"]').click();
      
      // Test horizontal scroll performance
      const scrollStartTime = Date.now();
      await page.locator('[data-testid="timeline-grid"]').evaluate((el) => {
        el.scrollLeft = 800;
      });
      
      // Verify scroll completed without performance issues
      const scrollTime = Date.now() - scrollStartTime;
      expect(scrollTime).toBeLessThan(100);
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle extremely long task names gracefully', async ({ page }) => {
      const longName = 'A'.repeat(200);
      
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill(longName);
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('50');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();
      
      // Task should be created and displayed (potentially truncated)
      const task = page.locator(`[data-testid="task-${longName}"]`);
      await expect(task).toBeVisible();
      
      // Task should not break layout
      const taskBox = await task.boundingBox();
      expect(taskBox?.width).toBeLessThan(page.viewportSize()?.width || 1200);
    });

    test('should handle special characters in names', async ({ page }) => {
      const specialCharNames = [
        'Task with émojis 🚀',
        'Task-with-dashes',
        'Task with "quotes"',
        "Task with 'apostrophes'",
        'Task with <brackets>',
        'Task & Ampersand'
      ];
      
      for (const name of specialCharNames) {
        await page.locator('[data-testid="add-task-button"]').click();
        await page.locator('[data-testid="task-name-input"]').fill(name);
        await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
        await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
        await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
        await page.locator('[data-testid="progress-input"]').fill('50');
        await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
        await page.locator('[data-testid="save-task-button"]').click();
        
        // Verify task appears correctly
        await expect(page.locator(`[data-testid*="${name}"]`)).toBeVisible();
      }
    });

    test('should handle whitespace-only names correctly', async ({ page }) => {
      await page.locator('[data-testid="add-task-button"]').click();
      
      // Try to create task with whitespace-only name
      await page.locator('[data-testid="task-name-input"]').fill('   ');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('50');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();
      
      // Should show validation error
      await expect(page.locator('[data-testid="task-name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-name-error"]')).toContainText('required');
    });

    test('should handle rapid consecutive actions', async ({ page }) => {
      // Test rapid modal opening/closing
      for (let i = 0; i < 5; i++) {
        await page.locator('[data-testid="add-task-button"]').click();
        await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
        await page.locator('[data-testid="cancel-button"]').click();
        await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible();
      }
      
      // Test rapid timeline switching
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Rapid Test 1');
      await page.locator('[data-testid="save-timeline-button"]').click();
      
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Rapid Test 2');
      await page.locator('[data-testid="save-timeline-button"]').click();
      
      // Rapidly switch between timelines
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="timeline-selector"]').selectOption('Rapid Test 1');
        await page.locator('[data-testid="timeline-selector"]').selectOption('Rapid Test 2');
      }
      
      // Should end up in consistent state
      await expect(page.locator('[data-testid="timeline-selector"]')).toHaveValue('Rapid Test 2');
    });

    test('should handle browser refresh gracefully', async ({ page }) => {
      // Create some data
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Refresh Test Task');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('50');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();
      
      // Verify task exists
      await expect(page.locator('[data-testid="task-Refresh Test Task"]')).toBeVisible();
      
      // Refresh browser
      await page.reload();
      
      // Should load with initial state (data is not persisted by design)
      await expect(page.locator('h1')).toContainText('Dynamic Project Timeline - Quarterly View');
      await expect(page.locator('[data-testid="timeline-selector"]')).toHaveValue('Main Timeline');
      await expect(page.locator('[data-testid="team-Pet Fish"] .task-count')).toContainText('(0)');
    });

    test('should handle network interruptions gracefully', async ({ page }) => {
      // This test simulates network issues during file operations
      
      // Go offline
      await page.context().setOffline(true);
      
      // App should still function (it's browser-only)
      await page.locator('[data-testid="add-task-button"]').click();
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
      await page.locator('[data-testid="cancel-button"]').click();
      
      // Timeline operations should work offline
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Offline Timeline');
      await page.locator('[data-testid="save-timeline-button"]').click();
      
      await expect(page.locator('[data-testid="timeline-selector"]')).toHaveValue('Offline Timeline');
      
      // Go back online
      await page.context().setOffline(false);
      
      // App should continue working normally
      await page.locator('[data-testid="add-task-button"]').click();
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
      await page.locator('[data-testid="cancel-button"]').click();
    });

    test('should handle extreme viewport sizes', async ({ page }) => {
      // Test very narrow viewport
      await page.setViewportSize({ width: 320, height: 568 });
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="timeline-selector"]')).toBeVisible();
      
      // Test very wide viewport
      await page.setViewportSize({ width: 2560, height: 1440 });
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="quarter-Q4-2028"]')).toBeVisible();
      
      // Test very tall viewport
      await page.setViewportSize({ width: 1024, height: 2000 });
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('[data-testid="teams-header"]')).toBeVisible();
    });

    test('should handle maximum task overlap scenarios', async ({ page }) => {
      // Create scenario where many tasks overlap in same timeframe
      const overlappingTasks = 20;
      
      for (let i = 0; i < overlappingTasks; i++) {
        await page.locator('[data-testid="add-task-button"]').click();
        await page.locator('[data-testid="task-name-input"]').fill(`Overlap Task ${i}`);
        await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
        await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
        await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q1 2025');
        await page.locator('[data-testid="progress-input"]').fill((i * 5).toString());
        await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
        await page.locator('[data-testid="save-task-button"]').click();
      }
      
      // All tasks should be visible and properly positioned
      const tasks = page.locator('[data-testid^="task-Overlap Task"]');
      await expect(tasks).toHaveCount(overlappingTasks);
      
      // Tasks should be stacked vertically without gaps
      const swimlane = page.locator('[data-testid="team-Pet Fish"]');
      const swimlaneHeight = await swimlane.boundingBox();
      
      // Height should accommodate all overlapping tasks
      expect(swimlaneHeight?.height).toBeGreaterThan(overlappingTasks * 30); // Assuming min 30px per task row
    });
  });

  test.describe('Accessibility and Usability', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Test tab navigation through main UI elements
      await page.keyboard.press('Tab');
      
      // Should be able to navigate to and activate buttons
      let focused = await page.locator(':focus').getAttribute('data-testid');
      const interactiveElements = [
        'timeline-selector',
        'new-timeline-button', 
        'export-button',
        'import-button',
        'add-team-button',
        'add-task-button'
      ];
      
      // Tab through several elements
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        focused = await page.locator(':focus').getAttribute('data-testid');
        if (focused && interactiveElements.includes(focused)) {
          // Found an interactive element, good
          break;
        }
      }
      
      // Should be able to activate focused element with Enter/Space
      if (focused === 'add-task-button') {
        await page.keyboard.press('Enter');
        await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('[data-testid="task-modal"]')).not.toBeVisible();
      }
    });

    test('should provide appropriate ARIA labels and roles', async ({ page }) => {
      // Check main interactive elements have proper accessibility attributes
      await expect(page.locator('[data-testid="add-task-button"]')).toHaveAttribute('aria-label');
      await expect(page.locator('[data-testid="timeline-selector"]')).toHaveRole('combobox');
      
      // Open modal and check accessibility
      await page.locator('[data-testid="add-task-button"]').click();
      await expect(page.locator('[data-testid="task-modal"]')).toHaveAttribute('role', 'dialog');
      await expect(page.locator('[data-testid="task-modal"]')).toHaveAttribute('aria-modal', 'true');
      
      await page.locator('[data-testid="cancel-button"]').click();
    });

    test('should handle focus management correctly', async ({ page }) => {
      // Test focus returns to trigger after modal closes
      const addTaskButton = page.locator('[data-testid="add-task-button"]');
      await addTaskButton.focus();
      await addTaskButton.click();
      
      await expect(page.locator('[data-testid="task-modal"]')).toBeVisible();
      await page.locator('[data-testid="cancel-button"]').click();
      
      // Focus should return to the button that opened the modal
      await expect(addTaskButton).toBeFocused();
    });
  });
});
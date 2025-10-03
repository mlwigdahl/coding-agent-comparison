import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Import/Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Dynamic Project Timeline - Quarterly View');
  });

  test.describe('Export Functionality', () => {
    test('should export data as JSON file', async ({ page }) => {
      // Create some test data first
      // Add a custom team
      await page.locator('[data-testid="add-team-button"]').click();
      await page.locator('[data-testid="team-name-input"]').fill('Export Test Team');
      await page.locator('[data-testid="save-team-button"]').click();

      // Create a timeline
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Export Test Timeline');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Add a task
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Export Test Task');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Export Test Team');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q3 2025');
      await page.locator('[data-testid="progress-input"]').fill('66');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('indigo');
      await page.locator('[data-testid="save-task-button"]').click();

      // Setup download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await page.locator('[data-testid="export-button"]').click();

      // Wait for download
      const download = await downloadPromise;

      // Verify download properties
      expect(download.suggestedFilename()).toMatch(/timeline-export-\d{4}-\d{2}-\d{2}\.json/);

      // Save and verify file content
      const downloadPath = path.join(__dirname, '..', 'temp', download.suggestedFilename());
      await download.saveAs(downloadPath);

      // Read and parse the JSON file
      const fs = await import('fs');
      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      const exportedData = JSON.parse(fileContent);

      // Verify JSON structure matches SPEC.md format
      expect(exportedData).toHaveProperty('scenarios');
      expect(exportedData).toHaveProperty('activeScenario');
      expect(exportedData).toHaveProperty('swimlanes');
      expect(exportedData).toHaveProperty('exportDate');

      // Verify our test data is included
      expect(exportedData.scenarios).toHaveLength(2); // Main Timeline + Export Test Timeline
      expect(exportedData.activeScenario).toBe('Export Test Timeline');
      expect(exportedData.swimlanes).toContain('Export Test Team');

      // Find our test timeline and verify task
      const testTimeline = exportedData.scenarios.find((s: any) => s.name === 'Export Test Timeline');
      expect(testTimeline).toBeDefined();
      expect(testTimeline.tasks).toHaveLength(1);
      
      const testTask = testTimeline.tasks[0];
      expect(testTask.name).toBe('Export Test Task');
      expect(testTask.swimlane).toBe('Export Test Team');
      expect(testTask.startQuarter).toBe('Q1 2025');
      expect(testTask.endQuarter).toBe('Q3 2025');
      expect(testTask.progress).toBe(66);
      expect(testTask.color).toBe('indigo');

      // Verify export date is valid ISO string
      expect(new Date(exportedData.exportDate)).toBeInstanceOf(Date);

      // Clean up
      fs.unlinkSync(downloadPath);
    });

    test('should export empty state correctly', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');
      
      // Export with initial state (no custom data)
      await page.locator('[data-testid="export-button"]').click();
      
      const download = await downloadPromise;
      const downloadPath = path.join(__dirname, '..', 'temp', download.suggestedFilename());
      await download.saveAs(downloadPath);

      const fs = await import('fs');
      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      const exportedData = JSON.parse(fileContent);

      // Verify structure for empty state
      expect(exportedData.scenarios).toHaveLength(1);
      expect(exportedData.scenarios[0].name).toBe('Main Timeline');
      expect(exportedData.scenarios[0].tasks).toHaveLength(0);
      expect(exportedData.activeScenario).toBe('Main Timeline');
      expect(exportedData.swimlanes).toEqual(['Pet Fish', 'Infrastructure']);

      fs.unlinkSync(downloadPath);
    });

    test('should export with multiple timelines and complex data', async ({ page }) => {
      // Create complex scenario with multiple timelines and overlapping tasks
      
      // Timeline 1: Add tasks to default teams
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Pet Fish Task 1');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('100');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();

      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Infrastructure Task 1');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Infrastructure');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q4 2025');
      await page.locator('[data-testid="progress-input"]').fill('0');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('indigo');
      await page.locator('[data-testid="save-task-button"]').click();

      // Create Timeline 2
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Aggressive Timeline');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Add different versions of tasks to Timeline 2
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Pet Fish Task 1');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="progress-input"]').fill('100');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();

      // Export and verify complex data structure
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-button"]').click();
      
      const download = await downloadPromise;
      const downloadPath = path.join(__dirname, '..', 'temp', download.suggestedFilename());
      await download.saveAs(downloadPath);

      const fs = await import('fs');
      const fileContent = fs.readFileSync(downloadPath, 'utf8');
      const exportedData = JSON.parse(fileContent);

      // Verify two timelines with different task configurations
      expect(exportedData.scenarios).toHaveLength(2);
      
      const mainTimeline = exportedData.scenarios.find((s: any) => s.name === 'Main Timeline');
      const aggressiveTimeline = exportedData.scenarios.find((s: any) => s.name === 'Aggressive Timeline');

      expect(mainTimeline.tasks).toHaveLength(2);
      expect(aggressiveTimeline.tasks).toHaveLength(1);

      // Verify same task name has different properties in different timelines
      const mainPetFishTask = mainTimeline.tasks.find((t: any) => t.name === 'Pet Fish Task 1');
      const aggressivePetFishTask = aggressiveTimeline.tasks.find((t: any) => t.name === 'Pet Fish Task 1');

      expect(mainPetFishTask.endQuarter).toBe('Q2 2025');
      expect(aggressivePetFishTask.endQuarter).toBe('Q1 2025');

      fs.unlinkSync(downloadPath);
    });
  });

  test.describe('Import Functionality', () => {
    test('should import valid JSON file successfully', async ({ page }) => {
      // Create test JSON file with valid structure
      const testData = {
        scenarios: [
          {
            name: 'Imported Timeline',
            tasks: [
              {
                name: 'Imported Task 1',
                swimlane: 'Imported Team A',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 25,
                color: 'blue'
              },
              {
                name: 'Imported Task 2',
                swimlane: 'Imported Team B',
                startQuarter: 'Q3 2025',
                endQuarter: 'Q4 2025',
                progress: 75,
                color: 'indigo'
              }
            ]
          }
        ],
        activeScenario: 'Imported Timeline',
        swimlanes: ['Imported Team A', 'Imported Team B'],
        exportDate: '2025-08-26T17:25:25.117Z'
      };

      // Create temporary file
      const fs = await import('fs');
      const testFilePath = path.join(__dirname, '..', 'temp', 'test-import.json');
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2));

      // Setup file input listener
      const fileChooserPromise = page.waitForEvent('filechooser');
      
      // Click import button
      await page.locator('[data-testid="import-button"]').click();
      
      // Select file
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(testFilePath);

      // Wait for import to complete
      await page.waitForTimeout(1000);

      // Verify imported data is displayed correctly
      await expect(page.locator('[data-testid="timeline-selector"]')).toHaveValue('Imported Timeline');

      // Verify imported teams appear
      await expect(page.locator('[data-testid="team-Imported Team A"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-Imported Team B"]')).toBeVisible();

      // Verify imported tasks appear
      await expect(page.locator('[data-testid="task-Imported Task 1"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-Imported Task 2"]')).toBeVisible();

      // Verify task details are correct
      const task1 = page.locator('[data-testid="task-Imported Task 1"]');
      await expect(task1).toContainText('25%');
      await expect(task1).toHaveClass(/bg-blue/);

      const task2 = page.locator('[data-testid="task-Imported Task 2"]');
      await expect(task2).toContainText('75%');
      await expect(task2).toHaveClass(/bg-indigo/);

      // Verify task counts
      await expect(page.locator('[data-testid="team-Imported Team A"] .task-count')).toContainText('(1)');
      await expect(page.locator('[data-testid="team-Imported Team B"] .task-count')).toContainText('(1)');

      // Clean up
      fs.unlinkSync(testFilePath);
    });

    test('should handle invalid JSON files gracefully', async ({ page }) => {
      const fs = await import('fs');
      
      // Test 1: Invalid JSON syntax
      const invalidJsonPath = path.join(__dirname, '..', 'temp', 'invalid.json');
      fs.mkdirSync(path.dirname(invalidJsonPath), { recursive: true });
      fs.writeFileSync(invalidJsonPath, '{ invalid json syntax');

      let fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('[data-testid="import-button"]').click();
      let fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(invalidJsonPath);

      // Verify error message appears
      await expect(page.locator('[data-testid="import-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="import-error"]')).toContainText('invalid JSON');

      // Test 2: Missing required fields
      const invalidStructurePath = path.join(__dirname, '..', 'temp', 'invalid-structure.json');
      fs.writeFileSync(invalidStructurePath, JSON.stringify({
        scenarios: [], // Empty scenarios should fail
        activeScenario: 'Non-existent',
        swimlanes: []
      }));

      fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('[data-testid="import-button"]').click();
      fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(invalidStructurePath);

      await expect(page.locator('[data-testid="import-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="import-error"]')).toContainText('Invalid file format');

      // Test 3: File too large
      const largePath = path.join(__dirname, '..', 'temp', 'large.json');
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      fs.writeFileSync(largePath, largeContent);

      fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('[data-testid="import-button"]').click();
      fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(largePath);

      await expect(page.locator('[data-testid="import-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="import-error"]')).toContainText('File size exceeds maximum');

      // Clean up
      fs.unlinkSync(invalidJsonPath);
      fs.unlinkSync(invalidStructurePath);
      fs.unlinkSync(largePath);
    });

    test('should handle constraint violations in imported data', async ({ page }) => {
      // Test data with duplicate task names (should be rejected)
      const duplicateTasksData = {
        scenarios: [
          {
            name: 'Timeline A',
            tasks: [
              {
                name: 'Duplicate Task',
                swimlane: 'Team A',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue'
              }
            ]
          },
          {
            name: 'Timeline B',
            tasks: [
              {
                name: 'Duplicate Task', // Same name should fail validation
                swimlane: 'Team B',
                startQuarter: 'Q3 2025',
                endQuarter: 'Q4 2025',
                progress: 75,
                color: 'indigo'
              }
            ]
          }
        ],
        activeScenario: 'Timeline A',
        swimlanes: ['Team A', 'Team B'],
        exportDate: '2025-08-26T17:25:25.117Z'
      };

      const fs = await import('fs');
      const testFilePath = path.join(__dirname, '..', 'temp', 'duplicate-tasks.json');
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      fs.writeFileSync(testFilePath, JSON.stringify(duplicateTasksData));

      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('[data-testid="import-button"]').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(testFilePath);

      // Verify validation error for duplicate task names
      await expect(page.locator('[data-testid="import-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="import-error"]')).toContainText('task names must be unique');

      fs.unlinkSync(testFilePath);
    });

    test('should replace existing data completely on successful import', async ({ page }) => {
      // First, create some initial data
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Original Task');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q1 2025');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q2 2025');
      await page.locator('[data-testid="progress-input"]').fill('50');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('blue');
      await page.locator('[data-testid="save-task-button"]').click();

      // Verify original task exists
      await expect(page.locator('[data-testid="task-Original Task"]')).toBeVisible();

      // Now import completely different data
      const replacementData = {
        scenarios: [
          {
            name: 'Replacement Timeline',
            tasks: [
              {
                name: 'Replacement Task',
                swimlane: 'Replacement Team',
                startQuarter: 'Q3 2025',
                endQuarter: 'Q4 2025',
                progress: 90,
                color: 'indigo'
              }
            ]
          }
        ],
        activeScenario: 'Replacement Timeline',
        swimlanes: ['Replacement Team'],
        exportDate: '2025-08-26T17:25:25.117Z'
      };

      const fs = await import('fs');
      const testFilePath = path.join(__dirname, '..', 'temp', 'replacement.json');
      fs.mkdirSync(path.dirname(testFilePath), { recursive: true });
      fs.writeFileSync(testFilePath, JSON.stringify(replacementData));

      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('[data-testid="import-button"]').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(testFilePath);

      await page.waitForTimeout(1000);

      // Verify original data is completely replaced
      await expect(page.locator('[data-testid="task-Original Task"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="team-Pet Fish"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="timeline-selector"]')).toHaveValue('Replacement Timeline');

      // Verify new data is present
      await expect(page.locator('[data-testid="task-Replacement Task"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-Replacement Team"]')).toBeVisible();

      fs.unlinkSync(testFilePath);
    });
  });

  test.describe('Export-Import Cycle Integrity', () => {
    test('should maintain data integrity through export-import cycle', async ({ page }) => {
      // Create comprehensive test data
      // Multiple timelines
      await page.locator('[data-testid="new-timeline-button"]').click();
      await page.locator('[data-testid="timeline-name-input"]').fill('Cycle Test Timeline');
      await page.locator('[data-testid="save-timeline-button"]').click();

      // Multiple teams
      await page.locator('[data-testid="add-team-button"]').click();
      await page.locator('[data-testid="team-name-input"]').fill('Cycle Test Team');
      await page.locator('[data-testid="save-team-button"]').click();

      // Multiple tasks with various properties
      const testTasks = [
        {
          name: 'Cycle Task 1',
          team: 'Pet Fish',
          start: 'Q1 2025',
          end: 'Q1 2025',
          progress: 0,
          color: 'blue'
        },
        {
          name: 'Cycle Task 2',
          team: 'Cycle Test Team',
          start: 'Q2 2025',
          end: 'Q4 2025',
          progress: 100,
          color: 'indigo'
        },
        {
          name: 'Cycle Task 3',
          team: 'Infrastructure',
          start: 'Q1 2026',
          end: 'Q4 2028',
          progress: 42,
          color: 'blue'
        }
      ];

      // Create all test tasks
      for (const taskData of testTasks) {
        await page.locator('[data-testid="add-task-button"]').click();
        await page.locator('[data-testid="task-name-input"]').fill(taskData.name);
        await page.locator('[data-testid="team-dropdown"]').selectOption(taskData.team);
        await page.locator('[data-testid="start-quarter-dropdown"]').selectOption(taskData.start);
        await page.locator('[data-testid="end-quarter-dropdown"]').selectOption(taskData.end);
        await page.locator('[data-testid="progress-input"]').fill(taskData.progress.toString());
        await page.locator('[data-testid="color-theme-dropdown"]').selectOption(taskData.color);
        await page.locator('[data-testid="save-task-button"]').click();
      }

      // Switch to main timeline and add task there too
      await page.locator('[data-testid="timeline-selector"]').selectOption('Main Timeline');
      await page.locator('[data-testid="add-task-button"]').click();
      await page.locator('[data-testid="task-name-input"]').fill('Main Timeline Task');
      await page.locator('[data-testid="team-dropdown"]').selectOption('Pet Fish');
      await page.locator('[data-testid="start-quarter-dropdown"]').selectOption('Q3 2026');
      await page.locator('[data-testid="end-quarter-dropdown"]').selectOption('Q1 2027');
      await page.locator('[data-testid="progress-input"]').fill('88');
      await page.locator('[data-testid="color-theme-dropdown"]').selectOption('indigo');
      await page.locator('[data-testid="save-task-button"]').click();

      // Export the data
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="export-button"]').click();
      const download = await downloadPromise;

      const fs = await import('fs');
      const exportPath = path.join(__dirname, '..', 'temp', 'cycle-test-export.json');
      await download.saveAs(exportPath);

      // Clear browser data by refreshing
      await page.reload();
      await expect(page.locator('h1')).toContainText('Dynamic Project Timeline - Quarterly View');

      // Import the exported data
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.locator('[data-testid="import-button"]').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(exportPath);

      await page.waitForTimeout(1000);

      // Verify all data was restored correctly
      // Check timelines
      await expect(page.locator('[data-testid="timeline-selector"] option')).toHaveCount(2);
      await expect(page.locator('[data-testid="timeline-selector"]')).toHaveValue('Cycle Test Timeline');

      // Check teams
      await expect(page.locator('[data-testid="team-Pet Fish"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-Infrastructure"]')).toBeVisible();
      await expect(page.locator('[data-testid="team-Cycle Test Team"]')).toBeVisible();

      // Check tasks in current timeline
      for (const taskData of testTasks) {
        const task = page.locator(`[data-testid="task-${taskData.name}"]`);
        await expect(task).toBeVisible();
        await expect(task).toContainText(`${taskData.progress}%`);
      }

      // Switch to main timeline and verify its task
      await page.locator('[data-testid="timeline-selector"]').selectOption('Main Timeline');
      await expect(page.locator('[data-testid="task-Main Timeline Task"]')).toBeVisible();
      await expect(page.locator('[data-testid="task-Main Timeline Task"]')).toContainText('88%');

      // Verify task counts are correct
      await expect(page.locator('[data-testid="team-Pet Fish"] .task-count')).toContainText('(1)');

      // Switch back and verify counts there too
      await page.locator('[data-testid="timeline-selector"]').selectOption('Cycle Test Timeline');
      await expect(page.locator('[data-testid="team-Pet Fish"] .task-count')).toContainText('(1)');
      await expect(page.locator('[data-testid="team-Cycle Test Team"] .task-count')).toContainText('(1)');
      await expect(page.locator('[data-testid="team-Infrastructure"] .task-count')).toContainText('(1)');

      // Clean up
      fs.unlinkSync(exportPath);
    });
  });
});
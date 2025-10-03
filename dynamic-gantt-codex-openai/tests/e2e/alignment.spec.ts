import { test, expect } from '@playwright/test';

const KEY = 'dynamic-gantt-app-data';

const data = {
  scenarios: [
    {
      name: 'Main',
      tasks: [
        {
          name: 'Top Task',
          swimlane: 'Team A',
          startQuarter: 'Q2 2025',
          endQuarter: 'Q4 2025',
          progress: 10,
          color: 'blue',
        },
        {
          name: 'Bottom Task',
          swimlane: 'Team A',
          startQuarter: 'Q4 2025',
          endQuarter: 'Q1 2026',
          progress: 0,
          color: 'indigo',
        },
      ],
    },
  ],
  activeScenario: 'Main',
  swimlanes: ['Team A'],
};

test.beforeEach(async ({ context }) => {
  await context.addInitScript(([key, value]) => {
    // @ts-ignore
    window.localStorage.setItem(key, value);
  }, [KEY, JSON.stringify(data)]);
});

test('task spans align to half-quarter boundaries and year separators', async ({ page }) => {
  await page.goto('/');

  const overlay = page.getByTestId('overlay-Team A');
  const overlayBox = await overlay.boundingBox();
  expect(overlayBox).toBeTruthy();

  // Helper to compute expected x in px within overlay for a quarter index (0..16) at half steps
  const xForQuarter = (q: number) => (overlayBox!.x + (q * overlayBox!.width) / 16);

  // For Q2..Q4 2025: left at 0.5 -> between Q1 and Q2 (index 0.5), right at 3.5 -> between Q4 and Q1 next year
  const expectedLeft = xForQuarter(0.5);
  const expectedRight = xForQuarter(3.5);

  const topTask = page.getByTestId('task-Top Task');
  const taskBox = await topTask.boundingBox();
  expect(taskBox).toBeTruthy();

  const tol = 2; // px
  expect(Math.abs(taskBox!.x - expectedLeft)).toBeLessThanOrEqual(tol);
  expect(Math.abs(taskBox!.x + taskBox!.width - expectedRight)).toBeLessThanOrEqual(tol);

  // Year separator at index 4 should sit exactly at xForQuarter(4)
  const yearSep = page.getByTestId('year-sep-4');
  const sepBox = await yearSep.boundingBox();
  expect(sepBox).toBeTruthy();
  expect(Math.abs(sepBox!.x - xForQuarter(4))).toBeLessThanOrEqual(tol);
});


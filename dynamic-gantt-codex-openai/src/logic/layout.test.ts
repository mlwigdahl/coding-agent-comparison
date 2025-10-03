import { describe, it, expect } from 'vitest';
import { layoutTeamTasks } from './layout';
import type { Task } from '../state/types';

const task = (name: string, start: string, end: string): Task => ({
  name,
  swimlane: 'Team',
  startQuarter: start as any,
  endQuarter: end as any,
  progress: 0,
  color: 'blue',
});

describe('layoutTeamTasks', () => {
  it('stacks overlapping tasks on separate rows', () => {
    const tasks: Task[] = [
      task('A', 'Q1 2025', 'Q2 2025'), // 0..1
      task('B', 'Q2 2025', 'Q3 2025'), // 1..2 overlaps with A at 1
      task('C', 'Q4 2025', 'Q1 2026'), // 3..4 no overlap with first two
      task('D', 'Q1 2025', 'Q1 2025'), // 0..0 overlaps with A row 0, should go row 1
    ];

    const res = layoutTeamTasks(tasks);
    const byName = Object.fromEntries(res.boxes.map((b) => [b.name, b.rowIndex]));
    expect(byName['A']).toBe(0);
    expect(byName['B']).toBe(1);
    expect(byName['D']).toBe(1);
    expect(byName['C']).toBe(0);
    expect(res.rowCount).toBeGreaterThanOrEqual(2);
  });

  it('computes left/width CSS based on quarter indices', () => {
    const tasks: Task[] = [task('A', 'Q1 2025', 'Q2 2025')];
    const res = layoutTeamTasks(tasks);
    const b = res.boxes[0];
    expect(b.leftCss.endsWith('%')).toBe(true);
    expect(b.widthCss.endsWith('%')).toBe(true);
  });
});

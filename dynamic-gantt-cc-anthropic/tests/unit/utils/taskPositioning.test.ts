import { describe, it, expect } from 'vitest';
import {
  positionTasks,
  getMaxRows,
  groupTasksByRow,
  repositionTasks
} from '../../../src/utils/taskPositioning';
import { ITask, PositionedTask } from '../../../src/types/task';

// Helper function to create test tasks
function createTask(
  name: string,
  startQuarter: string,
  endQuarter: string,
  swimlane: string = 'Test Team',
  progress: number = 0,
  color: 'blue' | 'indigo' = 'blue'
): ITask {
  return {
    name,
    swimlane,
    startQuarter: startQuarter as any,
    endQuarter: endQuarter as any,
    progress,
    color
  };
}

describe('taskPositioning', () => {
  describe('positionTasks', () => {
    it('should return empty array for empty task list', () => {
      const result = positionTasks([]);
      expect(result).toEqual([]);
    });

    it('should position single task in row 0', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q2 2025')
      ];
      
      const result = positionTasks(tasks);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        task: tasks[0],
        row: 0,
        startColumn: 1,
        endColumn: 2
      });
    });

    it('should position non-overlapping tasks in same row', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q1 2025'),
        createTask('Task 2', 'Q2 2025', 'Q3 2025')
      ];
      
      const result = positionTasks(tasks);
      
      expect(result).toHaveLength(2);
      expect(result[0].row).toBe(0); // Task 1
      expect(result[1].row).toBe(0); // Task 2 - no overlap
    });

    it('should position overlapping tasks in different rows', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q2 2025'),
        createTask('Task 2', 'Q2 2025', 'Q3 2025')
      ];
      
      const result = positionTasks(tasks);
      
      expect(result).toHaveLength(2);
      expect(result[0].row).toBe(0); // Task 1
      expect(result[1].row).toBe(1); // Task 2 - overlaps with Task 1
    });

    it('should handle complex overlap scenarios', () => {
      const tasks = [
        createTask('Long Task', 'Q1 2025', 'Q4 2025'),    // Spans all of 2025
        createTask('Q1 Task', 'Q1 2025', 'Q1 2025'),     // Overlaps with Long Task
        createTask('Q2 Task', 'Q2 2025', 'Q2 2025'),     // Overlaps with Long Task
        createTask('Q3 Task', 'Q3 2025', 'Q3 2025'),     // Overlaps with Long Task
        createTask('Q4 Task', 'Q4 2025', 'Q4 2025'),     // Overlaps with Long Task
        createTask('Independent', 'Q1 2026', 'Q1 2026')  // No overlap
      ];
      
      const result = positionTasks(tasks);
      
      expect(result).toHaveLength(6);
      
      // Long Task should be in row 0 (sorted first by duration)
      const longTask = result.find(r => r.task.name === 'Long Task');
      expect(longTask?.row).toBe(0);
      
      // All Q1-Q4 tasks should be in row 1 (they overlap with Long Task)
      const q1Task = result.find(r => r.task.name === 'Q1 Task');
      const q2Task = result.find(r => r.task.name === 'Q2 Task');
      const q3Task = result.find(r => r.task.name === 'Q3 Task');
      const q4Task = result.find(r => r.task.name === 'Q4 Task');
      
      expect(q1Task?.row).toBe(1);
      expect(q2Task?.row).toBe(1);
      expect(q3Task?.row).toBe(1);
      expect(q4Task?.row).toBe(1);
      
      // Independent task should be in row 0 (no overlap with others)
      const independentTask = result.find(r => r.task.name === 'Independent');
      expect(independentTask?.row).toBe(0);
    });

    it('should sort tasks by start date, then by duration (descending)', () => {
      const tasks = [
        createTask('Short Q2', 'Q2 2025', 'Q2 2025'),     // Start Q2, duration 1
        createTask('Long Q1', 'Q1 2025', 'Q3 2025'),      // Start Q1, duration 3
        createTask('Medium Q2', 'Q2 2025', 'Q3 2025'),    // Start Q2, duration 2
        createTask('Short Q1', 'Q1 2025', 'Q1 2025')      // Start Q1, duration 1
      ];
      
      const result = positionTasks(tasks);
      
      // Should be sorted by start quarter first, then by duration (descending)
      // Expected order: Long Q1, Short Q1, Medium Q2, Short Q2
      expect(result[0].task.name).toBe('Long Q1');
      expect(result[1].task.name).toBe('Short Q1');
      expect(result[2].task.name).toBe('Medium Q2');
      expect(result[3].task.name).toBe('Short Q2');
    });

    it('should handle tasks with identical start and end quarters', () => {
      const tasks = [
        createTask('Task A', 'Q1 2025', 'Q1 2025'),
        createTask('Task B', 'Q1 2025', 'Q1 2025'),
        createTask('Task C', 'Q1 2025', 'Q1 2025')
      ];
      
      const result = positionTasks(tasks);
      
      expect(result).toHaveLength(3);
      // All tasks overlap, so they should be in different rows
      expect(result[0].row).toBe(0);
      expect(result[1].row).toBe(1);
      expect(result[2].row).toBe(2);
    });

    it('should calculate correct column positions', () => {
      const tasks = [
        createTask('Q1 Task', 'Q1 2025', 'Q1 2025'),     // Column 1
        createTask('Q2 Task', 'Q2 2025', 'Q3 2025'),     // Columns 2-3
        createTask('Q4 2028', 'Q4 2028', 'Q4 2028')      // Column 16 (last quarter)
      ];
      
      const result = positionTasks(tasks);
      
      const q1Task = result.find(r => r.task.name === 'Q1 Task');
      expect(q1Task?.startColumn).toBe(1);
      expect(q1Task?.endColumn).toBe(1);
      
      const q2Task = result.find(r => r.task.name === 'Q2 Task');
      expect(q2Task?.startColumn).toBe(2);
      expect(q2Task?.endColumn).toBe(3);
      
      const q4Task = result.find(r => r.task.name === 'Q4 2028');
      expect(q4Task?.startColumn).toBe(16);
      expect(q4Task?.endColumn).toBe(16);
    });

    it('should handle edge case of maximum quarter span', () => {
      const tasks = [
        createTask('Full Span', 'Q1 2025', 'Q4 2028')
      ];
      
      const result = positionTasks(tasks);
      
      expect(result).toHaveLength(1);
      expect(result[0].startColumn).toBe(1);
      expect(result[0].endColumn).toBe(16);
      expect(result[0].row).toBe(0);
    });

    it('should optimize row packing with multiple task lengths', () => {
      const tasks = [
        createTask('Long 1', 'Q1 2025', 'Q4 2025'),       // Q1-Q4 2025
        createTask('Long 2', 'Q1 2026', 'Q4 2026'),       // Q1-Q4 2026 (different year, no overlap)
        createTask('Short 1', 'Q1 2027', 'Q1 2027'),      // Q1 2027
        createTask('Short 2', 'Q2 2027', 'Q2 2027'),      // Q2 2027
        createTask('Short 3', 'Q3 2027', 'Q3 2027')       // Q3 2027
      ];
      
      const result = positionTasks(tasks);
      
      expect(result).toHaveLength(5);
      
      // Long 1 and Long 2 should be in row 0 (no overlap)
      const long1 = result.find(r => r.task.name === 'Long 1');
      const long2 = result.find(r => r.task.name === 'Long 2');
      expect(long1?.row).toBe(0);
      expect(long2?.row).toBe(0);
      
      // All short tasks should be in row 0 (no overlaps between them or with long tasks)
      const short1 = result.find(r => r.task.name === 'Short 1');
      const short2 = result.find(r => r.task.name === 'Short 2');
      const short3 = result.find(r => r.task.name === 'Short 3');
      expect(short1?.row).toBe(0);
      expect(short2?.row).toBe(0);
      expect(short3?.row).toBe(0);
    });

    it('should handle overlap at quarter boundaries', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q2 2025'),       // Ends Q2
        createTask('Task 2', 'Q2 2025', 'Q3 2025'),       // Starts Q2 (overlaps)
        createTask('Task 3', 'Q3 2025', 'Q4 2025')        // Starts Q3 (no overlap with Task 1)
      ];
      
      const result = positionTasks(tasks);
      
      expect(result).toHaveLength(3);
      
      const task1 = result.find(r => r.task.name === 'Task 1');
      const task2 = result.find(r => r.task.name === 'Task 2');
      const task3 = result.find(r => r.task.name === 'Task 3');
      
      expect(task1?.row).toBe(0);
      expect(task2?.row).toBe(1); // Overlaps with Task 1
      expect(task3?.row).toBe(0); // No overlap with Task 1
    });
  });

  describe('getMaxRows', () => {
    it('should return 0 for empty positioned tasks', () => {
      const result = getMaxRows([]);
      expect(result).toBe(0);
    });

    it('should return 1 for single task', () => {
      const positionedTasks: PositionedTask[] = [{
        task: createTask('Task 1', 'Q1 2025', 'Q1 2025'),
        row: 0,
        startColumn: 1,
        endColumn: 1
      }];
      
      const result = getMaxRows(positionedTasks);
      expect(result).toBe(1);
    });

    it('should return correct max rows for multiple tasks', () => {
      const positionedTasks: PositionedTask[] = [
        {
          task: createTask('Task 1', 'Q1 2025', 'Q1 2025'),
          row: 0,
          startColumn: 1,
          endColumn: 1
        },
        {
          task: createTask('Task 2', 'Q1 2025', 'Q1 2025'),
          row: 1,
          startColumn: 1,
          endColumn: 1
        },
        {
          task: createTask('Task 3', 'Q1 2025', 'Q1 2025'),
          row: 2,
          startColumn: 1,
          endColumn: 1
        }
      ];
      
      const result = getMaxRows(positionedTasks);
      expect(result).toBe(3);
    });
  });

  describe('groupTasksByRow', () => {
    it('should return empty array for empty positioned tasks', () => {
      const result = groupTasksByRow([]);
      expect(result).toEqual([]);
    });

    it('should group tasks by row correctly', () => {
      const positionedTasks: PositionedTask[] = [
        {
          task: createTask('Task A', 'Q1 2025', 'Q1 2025'),
          row: 0,
          startColumn: 1,
          endColumn: 1
        },
        {
          task: createTask('Task B', 'Q2 2025', 'Q2 2025'),
          row: 0,
          startColumn: 2,
          endColumn: 2
        },
        {
          task: createTask('Task C', 'Q1 2025', 'Q1 2025'),
          row: 1,
          startColumn: 1,
          endColumn: 1
        }
      ];
      
      const result = groupTasksByRow(positionedTasks);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2); // Row 0 has 2 tasks
      expect(result[1]).toHaveLength(1); // Row 1 has 1 task
      
      // Tasks should be sorted by start column within each row
      expect(result[0][0].task.name).toBe('Task A'); // Column 1
      expect(result[0][1].task.name).toBe('Task B'); // Column 2
      expect(result[1][0].task.name).toBe('Task C');
    });

    it('should sort tasks within rows by start column', () => {
      const positionedTasks: PositionedTask[] = [
        {
          task: createTask('Task Late', 'Q3 2025', 'Q3 2025'),
          row: 0,
          startColumn: 3,
          endColumn: 3
        },
        {
          task: createTask('Task Early', 'Q1 2025', 'Q1 2025'),
          row: 0,
          startColumn: 1,
          endColumn: 1
        },
        {
          task: createTask('Task Middle', 'Q2 2025', 'Q2 2025'),
          row: 0,
          startColumn: 2,
          endColumn: 2
        }
      ];
      
      const result = groupTasksByRow(positionedTasks);
      
      expect(result[0][0].task.name).toBe('Task Early');   // Column 1
      expect(result[0][1].task.name).toBe('Task Middle');  // Column 2
      expect(result[0][2].task.name).toBe('Task Late');    // Column 3
    });
  });

  describe('repositionTasks', () => {
    it('should return comprehensive positioning data', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q2 2025'),
        createTask('Task 2', 'Q1 2025', 'Q1 2025') // Overlaps with Task 1
      ];
      
      const result = repositionTasks(tasks);
      
      expect(result).toHaveProperty('positionedTasks');
      expect(result).toHaveProperty('maxRows');
      expect(result).toHaveProperty('tasksByRow');
      
      expect(result.positionedTasks).toHaveLength(2);
      expect(result.maxRows).toBe(2); // Two rows due to overlap
      expect(result.tasksByRow).toHaveLength(2);
      expect(result.tasksByRow[0]).toHaveLength(1); // Row 0 has 1 task
      expect(result.tasksByRow[1]).toHaveLength(1); // Row 1 has 1 task
    });

    it('should handle empty task array', () => {
      const result = repositionTasks([]);
      
      expect(result.positionedTasks).toEqual([]);
      expect(result.maxRows).toBe(0);
      expect(result.tasksByRow).toEqual([]);
    });
  });

  describe('edge cases and performance', () => {
    it('should handle large number of non-overlapping tasks efficiently', () => {
      const tasks: ITask[] = [];
      
      // Create 50 non-overlapping tasks (each in different quarters)
      for (let year = 2025; year <= 2028; year++) {
        for (let quarter = 1; quarter <= 4; quarter++) {
          if (tasks.length >= 16) break; // Only 16 quarters available
          tasks.push(createTask(
            `Task ${year}Q${quarter}`,
            `Q${quarter} ${year}`,
            `Q${quarter} ${year}`
          ));
        }
      }
      
      const startTime = performance.now();
      const result = positionTasks(tasks);
      const endTime = performance.now();
      
      expect(result).toHaveLength(16);
      expect(result.every(r => r.row === 0)).toBe(true); // All in same row (no overlaps)
      expect(endTime - startTime).toBeLessThan(10); // Should be fast (< 10ms)
    });

    it('should handle worst-case overlap scenario (all tasks overlap)', () => {
      const tasks: ITask[] = [];
      
      // Create 10 tasks that all overlap in Q1 2025
      for (let i = 0; i < 10; i++) {
        tasks.push(createTask(`Task ${i}`, 'Q1 2025', 'Q1 2025'));
      }
      
      const startTime = performance.now();
      const result = positionTasks(tasks);
      const endTime = performance.now();
      
      expect(result).toHaveLength(10);
      expect(result.map(r => r.row)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); // Each in different row
      expect(endTime - startTime).toBeLessThan(10); // Should still be fast
    });

    it('should maintain task identity through positioning process', () => {
      const originalTask = createTask('Original Task', 'Q1 2025', 'Q2 2025');
      originalTask.progress = 75;
      originalTask.color = 'indigo';
      originalTask.swimlane = 'Special Team';
      
      const result = positionTasks([originalTask]);
      
      expect(result[0].task).toBe(originalTask); // Same object reference
      expect(result[0].task.progress).toBe(75);
      expect(result[0].task.color).toBe('indigo');
      expect(result[0].task.swimlane).toBe('Special Team');
    });
  });
});
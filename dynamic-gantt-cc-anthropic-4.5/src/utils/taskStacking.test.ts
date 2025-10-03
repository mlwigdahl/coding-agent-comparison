import { describe, it, expect } from 'vitest'
import { stackTasks } from './taskStacking'
import type { Task } from '../types'

describe('taskStacking', () => {
  describe('stackTasks', () => {
    it('returns empty array for empty input', () => {
      const result = stackTasks([])
      expect(result).toEqual([])
    })

    it('assigns single task to row 0', () => {
      const tasks: Task[] = [
        {
          name: 'Task 1',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(1)
      expect(result[0]?.row).toBe(0)
    })

    it('assigns non-overlapping tasks to same row', () => {
      const tasks: Task[] = [
        {
          name: 'Task 1',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task 2',
          swimlane: 'Engineering',
          startQuarter: 'Q3 2025',
          endQuarter: 'Q4 2025',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(2)
      expect(result[0]?.row).toBe(0)
      expect(result[1]?.row).toBe(0)
    })

    it('assigns overlapping tasks to different rows', () => {
      const tasks: Task[] = [
        {
          name: 'Task 1',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q3 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task 2',
          swimlane: 'Engineering',
          startQuarter: 'Q2 2025',
          endQuarter: 'Q4 2025',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(2)
      expect(result[0]?.row).toBe(0)
      expect(result[1]?.row).toBe(1)
    })

    it('handles tasks that share a boundary quarter', () => {
      // Q1-Q2 and Q2-Q3 overlap at Q2
      const tasks: Task[] = [
        {
          name: 'Task 1',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task 2',
          swimlane: 'Engineering',
          startQuarter: 'Q2 2025',
          endQuarter: 'Q3 2025',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(2)
      // These overlap at Q2, so should be in different rows
      expect(result[0]?.row).toBe(0)
      expect(result[1]?.row).toBe(1)
    })

    it('stacks multiple overlapping tasks efficiently', () => {
      const tasks: Task[] = [
        {
          name: 'Task A',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task B',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q3 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task C',
          swimlane: 'Engineering',
          startQuarter: 'Q4 2025',
          endQuarter: 'Q4 2025',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(3)

      // Task B should be in row 0 (longer, starts at Q1)
      const taskB = result.find((t) => t.name === 'Task B')
      expect(taskB?.row).toBe(0)

      // Task A should be in row 1 (overlaps with B at Q1-Q2)
      const taskA = result.find((t) => t.name === 'Task A')
      expect(taskA?.row).toBe(1)

      // Task C should be in row 0 (doesn't overlap with B, starts after B ends)
      const taskC = result.find((t) => t.name === 'Task C')
      expect(taskC?.row).toBe(0)
    })

    it('handles complex scenario with 3+ rows', () => {
      const tasks: Task[] = [
        {
          name: 'Task 1',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q4 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task 2',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task 3',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q3 2025',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(3)

      // All three tasks overlap at Q1, so should use 3 rows
      const rows = result.map((t) => t.row)
      const uniqueRows = new Set(rows)
      expect(uniqueRows.size).toBe(3)
      expect(rows).toContain(0)
      expect(rows).toContain(1)
      expect(rows).toContain(2)
    })

    it('sorts by start quarter then duration', () => {
      const tasks: Task[] = [
        {
          name: 'Short Task',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q1 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Long Task',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q4 2025',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)

      // Long task should be assigned to row 0 first
      const longTask = result.find((t) => t.name === 'Long Task')
      const shortTask = result.find((t) => t.name === 'Short Task')
      expect(longTask?.row).toBe(0)
      expect(shortTask?.row).toBe(1)
    })

    it('reuses rows when possible', () => {
      const tasks: Task[] = [
        {
          name: 'Task 1',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q1 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task 2',
          swimlane: 'Engineering',
          startQuarter: 'Q2 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task 3',
          swimlane: 'Engineering',
          startQuarter: 'Q3 2025',
          endQuarter: 'Q3 2025',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(3)

      // All tasks should fit in row 0 (no overlaps)
      expect(result[0]?.row).toBe(0)
      expect(result[1]?.row).toBe(0)
      expect(result[2]?.row).toBe(0)
    })

    it('handles tasks spanning multiple years', () => {
      const tasks: Task[] = [
        {
          name: 'Long Project',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q4 2028',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Short Project',
          swimlane: 'Engineering',
          startQuarter: 'Q2 2026',
          endQuarter: 'Q3 2026',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(2)

      // Short project overlaps with long project
      expect(result[0]?.row).toBe(0)
      expect(result[1]?.row).toBe(1)
    })

    it('preserves all task properties', () => {
      const tasks: Task[] = [
        {
          name: 'Task with Props',
          swimlane: 'Design',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 75,
          color: 'indigo',
        },
      ]
      const result = stackTasks(tasks)
      expect(result[0]).toMatchObject({
        name: 'Task with Props',
        swimlane: 'Design',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 75,
        color: 'indigo',
        row: 0,
      })
    })

    it('handles identical tasks', () => {
      const tasks: Task[] = [
        {
          name: 'Task 1',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task 2',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(2)

      // Identical time ranges should be in different rows
      expect(result[0]?.row).toBe(0)
      expect(result[1]?.row).toBe(1)
    })

    it('handles mixed overlapping and non-overlapping tasks', () => {
      const tasks: Task[] = [
        {
          name: 'Task A',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task B',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q3 2025',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task C',
          swimlane: 'Engineering',
          startQuarter: 'Q4 2025',
          endQuarter: 'Q1 2026',
          progress: 50,
          color: 'blue',
        },
        {
          name: 'Task D',
          swimlane: 'Engineering',
          startQuarter: 'Q2 2026',
          endQuarter: 'Q3 2026',
          progress: 50,
          color: 'blue',
        },
      ]
      const result = stackTasks(tasks)
      expect(result).toHaveLength(4)

      // Task B (longest starting at Q1) should be row 0
      const taskB = result.find((t) => t.name === 'Task B')
      expect(taskB?.row).toBe(0)

      // Task A overlaps with B, should be row 1
      const taskA = result.find((t) => t.name === 'Task A')
      expect(taskA?.row).toBe(1)

      // Task C doesn't overlap with B, can be row 0
      const taskC = result.find((t) => t.name === 'Task C')
      expect(taskC?.row).toBe(0)

      // Task D doesn't overlap with anything in row 0, can be row 0
      const taskD = result.find((t) => t.name === 'Task D')
      expect(taskD?.row).toBe(0)
    })
  })
})

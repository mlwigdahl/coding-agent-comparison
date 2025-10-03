import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { DataProvider, useData } from './DataContext'
import type { Task } from '../types'

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DataProvider>{children}</DataProvider>
)

describe('DataContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('initialization', () => {
    it('provides default data on first load', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      expect(result.current.data).toEqual({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: [],
      })
    })

    it('throws error when used outside provider', () => {
      // Suppress console errors for this test
      const consoleError = console.error
      console.error = () => {}

      try {
        const { result } = renderHook(() => useData())
        // Should not reach here
        expect(result.current).toBeUndefined()
      } catch (error) {
        expect((error as Error).message).toContain('useData must be used within a DataProvider')
      } finally {
        console.error = consoleError
      }
    })
  })

  describe('getAllTaskNames', () => {
    it('returns empty array when no tasks exist', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      expect(result.current.getAllTaskNames()).toEqual([])
    })

    it('returns all unique task names across scenarios', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      act(() => {
        result.current.addTask('Main Timeline', {
          name: 'Task 1',
          swimlane: 'Engineering',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue',
        })
      })

      expect(result.current.getAllTaskNames()).toEqual(['Task 1'])
    })
  })

  describe('getAllTeamNames', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('returns empty array when no teams exist', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      expect(result.current.getAllTeamNames()).toEqual([])
    })

    it('returns all team names', () => {
      localStorage.clear()
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      act(() => {
        result.current.addTeam('Design')
      })

      expect(result.current.getAllTeamNames()).toEqual(['Engineering', 'Design'])
    })
  })

  describe('getAllScenarioNames', () => {
    it('returns default scenario name', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      expect(result.current.getAllScenarioNames()).toEqual(['Main Timeline'])
    })

    it('returns all scenario names', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addScenario('Scenario 2')
      })

      expect(result.current.getAllScenarioNames()).toEqual([
        'Main Timeline',
        'Scenario 2',
      ])
    })
  })

  describe('addTeam', () => {
    it('successfully adds a team', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTeam('Engineering')
      })

      expect(response.success).toBe(true)
      expect(result.current.data.swimlanes).toContain('Engineering')
    })

    it('rejects empty team name', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTeam('')
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Team name is required')
    })

    it('rejects team name with whitespace', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTeam(' Engineering ')
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Team name must not have leading or trailing whitespace')
    })

    it('rejects duplicate team name', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTeam('Engineering')
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Team name must be unique')
    })
  })

  describe('addScenario', () => {
    it('successfully adds a scenario', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addScenario('Aggressive Timeline')
      })

      expect(response.success).toBe(true)
      expect(result.current.data.scenarios).toHaveLength(2)
      expect(result.current.data.scenarios[1]?.name).toBe('Aggressive Timeline')
    })

    it('rejects empty scenario name', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addScenario('')
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Timeline name is required')
    })

    it('rejects duplicate scenario name', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addScenario('Main Timeline')
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Timeline name must be unique')
    })
  })

  describe('setActiveScenario', () => {
    it('successfully sets active scenario', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addScenario('Scenario 2')
      })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.setActiveScenario('Scenario 2')
      })

      expect(response.success).toBe(true)
      expect(result.current.data.activeScenario).toBe('Scenario 2')
    })

    it('rejects non-existent scenario', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.setActiveScenario('Non-existent')
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Scenario "Non-existent" not found')
    })
  })

  describe('addTask', () => {
    it('successfully adds a task', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const task: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTask('Main Timeline', task)
      })

      expect(response.success).toBe(true)
      expect(result.current.data.scenarios[0]?.tasks).toHaveLength(1)
      expect(result.current.data.scenarios[0]?.tasks[0]).toEqual(task)
    })

    it('rejects task with duplicate name in same scenario', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const task1: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      act(() => {
        result.current.addTask('Main Timeline', task1)
      })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTask('Main Timeline', task1)
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Task name must be unique')
    })

    it('allows same task name in different scenarios', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      act(() => {
        result.current.addScenario('Scenario 2')
      })

      const task1: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      act(() => {
        result.current.addTask('Main Timeline', task1)
      })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTask('Scenario 2', task1)
      })

      expect(response.success).toBe(true)
      expect(result.current.data.scenarios[1]?.tasks).toHaveLength(1)
    })

    it('rejects task with non-existent team', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      const task: Task = {
        name: 'Task 1',
        swimlane: 'Non-existent Team',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTask('Main Timeline', task)
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Team "Non-existent Team" does not exist')
    })

    it('rejects task for non-existent scenario', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const task: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTask('Non-existent Scenario', task)
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Scenario "Non-existent Scenario" not found')
    })

    it('rejects task with empty name', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const task: Task = {
        name: '',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.addTask('Main Timeline', task)
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Task name is required')
    })
  })

  describe('updateTask', () => {
    it('successfully updates a task', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const task: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      act(() => {
        result.current.addTask('Main Timeline', task)
      })

      const updatedTask: Task = {
        ...task,
        progress: 75,
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.updateTask('Main Timeline', 'Task 1', 'Engineering', updatedTask)
      })

      expect(response.success).toBe(true)
      expect(result.current.data.scenarios[0]?.tasks[0]?.progress).toBe(75)
    })

    it('successfully updates task name', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const task: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      act(() => {
        result.current.addTask('Main Timeline', task)
      })

      const updatedTask: Task = {
        ...task,
        name: 'Renamed Task',
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.updateTask('Main Timeline', 'Task 1', 'Engineering', updatedTask)
      })

      expect(response.success).toBe(true)
      expect(result.current.data.scenarios[0]?.tasks[0]?.name).toBe('Renamed Task')
    })

    it('rejects update to duplicate name', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const task1: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      const task2: Task = {
        name: 'Task 2',
        swimlane: 'Engineering',
        startQuarter: 'Q3 2025',
        endQuarter: 'Q4 2025',
        progress: 50,
        color: 'blue',
      }

      act(() => {
        result.current.addTask('Main Timeline', task1)
      })

      act(() => {
        result.current.addTask('Main Timeline', task2)
      })

      const updatedTask: Task = {
        ...task2,
        name: 'Task 1', // Try to rename to existing name
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.updateTask('Main Timeline', 'Task 2', 'Engineering', updatedTask)
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Task name must be unique')
    })

    it('rejects update with non-existent team', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const task: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      act(() => {
        result.current.addTask('Main Timeline', task)
      })

      const updatedTask: Task = {
        ...task,
        swimlane: 'Non-existent Team',
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.updateTask('Main Timeline', 'Task 1', 'Engineering', updatedTask)
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Team "Non-existent Team" does not exist')
    })

    it('rejects update for non-existent scenario', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const updatedTask: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.updateTask('Non-existent', 'Task 1', 'Engineering', updatedTask)
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Scenario "Non-existent" not found')
    })

    it('rejects update for non-existent task', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const updatedTask: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.updateTask('Main Timeline', 'Non-existent', 'Engineering', updatedTask)
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Task "Non-existent" not found in team "Engineering"')
    })

    it('updates task only in specified scenario', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      act(() => {
        result.current.addScenario('Scenario 2')
      })

      const task: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      act(() => {
        result.current.addTask('Main Timeline', task)
      })

      act(() => {
        result.current.addTask('Scenario 2', task)
      })

      const updatedTask: Task = {
        ...task,
        progress: 100,
      }

      act(() => {
        result.current.updateTask('Main Timeline', 'Task 1', 'Engineering', updatedTask)
      })

      // Task should be updated only in Main Timeline, not in Scenario 2
      expect(result.current.data.scenarios[0]?.tasks[0]?.progress).toBe(100)
      expect(result.current.data.scenarios[1]?.tasks[0]?.progress).toBe(50)
    })
  })

  describe('deleteTask', () => {
    it('successfully deletes a task', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      const task: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      act(() => {
        result.current.addTask('Main Timeline', task)
      })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.deleteTask('Main Timeline', 'Task 1', 'Engineering')
      })

      expect(response.success).toBe(true)
      expect(result.current.data.scenarios[0]?.tasks).toHaveLength(0)
    })

    it('deletes task only from specified scenario', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      act(() => {
        result.current.addScenario('Scenario 2')
      })

      const task: Task = {
        name: 'Task 1',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      act(() => {
        result.current.addTask('Main Timeline', task)
      })

      act(() => {
        result.current.addTask('Scenario 2', task)
      })

      act(() => {
        result.current.deleteTask('Main Timeline', 'Task 1', 'Engineering')
      })

      // Task should be removed only from Main Timeline, not Scenario 2
      expect(result.current.data.scenarios[0]?.tasks).toHaveLength(0)
      expect(result.current.data.scenarios[1]?.tasks).toHaveLength(1)
    })

    it('rejects delete for non-existent scenario', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      let response: { success: boolean; error?: string } = { success: false }
      act(() => {
        response = result.current.deleteTask('Non-existent', 'Task 1', 'Engineering')
      })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Scenario "Non-existent" not found')
    })
  })

  describe('data persistence', () => {
    it('persists data to localStorage', () => {
      const { result } = renderHook(() => useData(), { wrapper })

      act(() => {
        result.current.addTeam('Engineering')
      })

      // Re-render with new wrapper to simulate reload
      const { result: result2 } = renderHook(() => useData(), { wrapper })

      expect(result2.current.data.swimlanes).toContain('Engineering')
    })
  })
})

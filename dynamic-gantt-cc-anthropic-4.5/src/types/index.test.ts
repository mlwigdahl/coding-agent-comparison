import { describe, it, expect } from 'vitest'
import type {
  ColorTheme,
  Quarter,
  Task,
  Scenario,
  AppData,
  StackedTask,
} from './index'

describe('Types', () => {
  describe('ColorTheme', () => {
    it('accepts valid color themes', () => {
      const blue: ColorTheme = 'blue'
      const indigo: ColorTheme = 'indigo'
      expect(blue).toBe('blue')
      expect(indigo).toBe('indigo')
    })
  })

  describe('Quarter', () => {
    it('accepts valid quarters', () => {
      const q1: Quarter = 'Q1 2025'
      const q4: Quarter = 'Q4 2028'
      expect(q1).toBe('Q1 2025')
      expect(q4).toBe('Q4 2028')
    })

    it('includes all 16 quarters', () => {
      const quarters: Quarter[] = [
        'Q1 2025',
        'Q2 2025',
        'Q3 2025',
        'Q4 2025',
        'Q1 2026',
        'Q2 2026',
        'Q3 2026',
        'Q4 2026',
        'Q1 2027',
        'Q2 2027',
        'Q3 2027',
        'Q4 2027',
        'Q1 2028',
        'Q2 2028',
        'Q3 2028',
        'Q4 2028',
      ]
      expect(quarters).toHaveLength(16)
    })
  })

  describe('Task', () => {
    it('creates valid task object', () => {
      const task: Task = {
        name: 'Test Task',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }
      expect(task.name).toBe('Test Task')
      expect(task.progress).toBe(50)
    })
  })

  describe('Scenario', () => {
    it('creates valid scenario object', () => {
      const scenario: Scenario = {
        name: 'Main Timeline',
        tasks: [],
      }
      expect(scenario.name).toBe('Main Timeline')
      expect(scenario.tasks).toEqual([])
    })
  })

  describe('AppData', () => {
    it('creates valid app data object', () => {
      const appData: AppData = {
        scenarios: [],
        activeScenario: 'Main Timeline',
        swimlanes: ['Engineering', 'Design'],
      }
      expect(appData.scenarios).toEqual([])
      expect(appData.swimlanes).toHaveLength(2)
    })

    it('accepts optional exportDate', () => {
      const appData: AppData = {
        scenarios: [],
        activeScenario: 'Main Timeline',
        swimlanes: [],
        exportDate: '2025-01-01T00:00:00.000Z',
      }
      expect(appData.exportDate).toBeDefined()
    })
  })

  describe('StackedTask', () => {
    it('creates valid stacked task with row', () => {
      const stackedTask: StackedTask = {
        name: 'Test Task',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
        row: 0,
      }
      expect(stackedTask.row).toBe(0)
    })
  })
})

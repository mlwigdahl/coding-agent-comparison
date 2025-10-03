import { describe, it, expect } from 'vitest'
import {
  validateTaskName,
  validateTeamName,
  validateScenarioName,
  validateProgress,
  validateQuarterRange,
  validateAppData,
} from './validation'
import type { AppData, Quarter } from '../types'

describe('validation utilities', () => {
  describe('validateTaskName', () => {
    it('returns null for valid task name', () => {
      expect(validateTaskName('Valid Task Name')).toBeNull()
      expect(validateTaskName('Task 1', [])).toBeNull()
      expect(validateTaskName('New Task', ['Existing Task'])).toBeNull()
    })

    it('returns error for empty name', () => {
      expect(validateTaskName('')).toBe('Task name is required')
      expect(validateTaskName('   ')).toBe('Task name is required')
    })

    it('returns error for name with leading whitespace', () => {
      expect(validateTaskName(' Task')).toBe(
        'Task name must not have leading or trailing whitespace'
      )
    })

    it('returns error for name with trailing whitespace', () => {
      expect(validateTaskName('Task ')).toBe(
        'Task name must not have leading or trailing whitespace'
      )
    })

    it('returns error for duplicate name', () => {
      expect(validateTaskName('Task 1', ['Task 1', 'Task 2'])).toBe(
        'Task name must be unique'
      )
    })
  })

  describe('validateTeamName', () => {
    it('returns null for valid team name', () => {
      expect(validateTeamName('Engineering')).toBeNull()
      expect(validateTeamName('Design', [])).toBeNull()
      expect(validateTeamName('New Team', ['Existing Team'])).toBeNull()
    })

    it('returns error for empty name', () => {
      expect(validateTeamName('')).toBe('Team name is required')
      expect(validateTeamName('   ')).toBe('Team name is required')
    })

    it('returns error for name with leading whitespace', () => {
      expect(validateTeamName(' Team')).toBe(
        'Team name must not have leading or trailing whitespace'
      )
    })

    it('returns error for name with trailing whitespace', () => {
      expect(validateTeamName('Team ')).toBe(
        'Team name must not have leading or trailing whitespace'
      )
    })

    it('returns error for duplicate name', () => {
      expect(validateTeamName('Engineering', ['Engineering', 'Design'])).toBe(
        'Team name must be unique'
      )
    })
  })

  describe('validateScenarioName', () => {
    it('returns null for valid scenario name', () => {
      expect(validateScenarioName('Main Timeline')).toBeNull()
      expect(validateScenarioName('Scenario 1', [])).toBeNull()
      expect(
        validateScenarioName('New Timeline', ['Existing Timeline'])
      ).toBeNull()
    })

    it('returns error for empty name', () => {
      expect(validateScenarioName('')).toBe('Timeline name is required')
      expect(validateScenarioName('   ')).toBe('Timeline name is required')
    })

    it('returns error for name with leading whitespace', () => {
      expect(validateScenarioName(' Timeline')).toBe(
        'Timeline name must not have leading or trailing whitespace'
      )
    })

    it('returns error for name with trailing whitespace', () => {
      expect(validateScenarioName('Timeline ')).toBe(
        'Timeline name must not have leading or trailing whitespace'
      )
    })

    it('returns error for duplicate name', () => {
      expect(
        validateScenarioName('Main Timeline', ['Main Timeline', 'Scenario 2'])
      ).toBe('Timeline name must be unique')
    })
  })

  describe('validateProgress', () => {
    it('returns null for valid progress values', () => {
      expect(validateProgress(0)).toBeNull()
      expect(validateProgress(50)).toBeNull()
      expect(validateProgress(100)).toBeNull()
      expect(validateProgress(1)).toBeNull()
      expect(validateProgress(99)).toBeNull()
    })

    it('returns error for non-number', () => {
      expect(validateProgress('50' as unknown as number)).toBe(
        'Progress must be a number'
      )
      expect(validateProgress(null as unknown as number)).toBe(
        'Progress must be a number'
      )
      expect(validateProgress(undefined as unknown as number)).toBe(
        'Progress must be a number'
      )
    })

    it('returns error for NaN', () => {
      expect(validateProgress(NaN)).toBe('Progress must be a number')
    })

    it('returns error for decimal values', () => {
      expect(validateProgress(50.5)).toBe('Progress must be an integer')
      expect(validateProgress(0.1)).toBe('Progress must be an integer')
      expect(validateProgress(99.9)).toBe('Progress must be an integer')
    })

    it('returns error for negative values', () => {
      expect(validateProgress(-1)).toBe('Progress must be between 0 and 100')
      expect(validateProgress(-50)).toBe('Progress must be between 0 and 100')
    })

    it('returns error for values > 100', () => {
      expect(validateProgress(101)).toBe('Progress must be between 0 and 100')
      expect(validateProgress(200)).toBe('Progress must be between 0 and 100')
    })
  })

  describe('validateQuarterRange', () => {
    it('returns null for valid ranges', () => {
      expect(validateQuarterRange('Q1 2025', 'Q1 2025')).toBeNull()
      expect(validateQuarterRange('Q1 2025', 'Q4 2025')).toBeNull()
      expect(validateQuarterRange('Q1 2025', 'Q4 2028')).toBeNull()
      expect(validateQuarterRange('Q3 2026', 'Q2 2027')).toBeNull()
    })

    it('returns error when start is after end', () => {
      expect(validateQuarterRange('Q4 2025', 'Q1 2025')).toBe(
        'Start quarter must be before or equal to end quarter'
      )
      expect(validateQuarterRange('Q1 2028', 'Q4 2025')).toBe(
        'Start quarter must be before or equal to end quarter'
      )
    })

    it('returns error for invalid start quarter', () => {
      expect(validateQuarterRange('Q5 2025' as unknown as Quarter, 'Q1 2025')).toBe(
        'Start quarter is invalid'
      )
      expect(validateQuarterRange('Q1 2024' as unknown as Quarter, 'Q1 2025')).toBe(
        'Start quarter is invalid'
      )
    })

    it('returns error for invalid end quarter', () => {
      expect(validateQuarterRange('Q1 2025', 'Q5 2025' as unknown as Quarter)).toBe(
        'End quarter is invalid'
      )
      expect(validateQuarterRange('Q1 2025', 'Q1 2029' as unknown as Quarter)).toBe(
        'End quarter is invalid'
      )
    })
  })

  describe('validateAppData', () => {
    const validAppData: AppData = {
      scenarios: [
        {
          name: 'Main Timeline',
          tasks: [
            {
              name: 'Task 1',
              swimlane: 'Engineering',
              startQuarter: 'Q1 2025',
              endQuarter: 'Q2 2025',
              progress: 50,
              color: 'blue',
            },
          ],
        },
      ],
      activeScenario: 'Main Timeline',
      swimlanes: ['Engineering'],
    }

    it('returns null for valid app data', () => {
      expect(validateAppData(validAppData)).toBeNull()
    })

    it('returns null for valid data with multiple scenarios', () => {
      const data: AppData = {
        scenarios: [
          {
            name: 'Scenario 1',
            tasks: [
              {
                name: 'Task A',
                swimlane: 'Team 1',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 0,
                color: 'blue',
              },
            ],
          },
          {
            name: 'Scenario 2',
            tasks: [
              {
                name: 'Task B',
                swimlane: 'Team 1',
                startQuarter: 'Q3 2025',
                endQuarter: 'Q4 2025',
                progress: 100,
                color: 'indigo',
              },
            ],
          },
        ],
        activeScenario: 'Scenario 1',
        swimlanes: ['Team 1'],
      }
      expect(validateAppData(data)).toBeNull()
    })

    it('returns error for non-object', () => {
      expect(validateAppData(null)).toBe('Data must be an object')
      expect(validateAppData('string')).toBe('Data must be an object')
      expect(validateAppData(123)).toBe('Data must be an object')
    })

    it('returns error for missing scenarios', () => {
      expect(
        validateAppData({
          activeScenario: 'Main',
          swimlanes: [],
        })
      ).toBe('Missing or invalid scenarios array')
    })

    it('returns error for invalid scenarios', () => {
      expect(
        validateAppData({
          scenarios: 'not an array',
          activeScenario: 'Main',
          swimlanes: [],
        })
      ).toBe('Missing or invalid scenarios array')
    })

    it('returns error for missing activeScenario', () => {
      expect(
        validateAppData({
          scenarios: [],
          swimlanes: [],
        })
      ).toBe('Missing or invalid activeScenario')
    })

    it('returns error for missing swimlanes', () => {
      expect(
        validateAppData({
          scenarios: [],
          activeScenario: 'Main',
        })
      ).toBe('Missing or invalid swimlanes array')
    })

    it('returns error when activeScenario does not exist', () => {
      expect(
        validateAppData({
          scenarios: [{ name: 'Scenario 1', tasks: [] }],
          activeScenario: 'Non-existent',
          swimlanes: [],
        })
      ).toBe('Active scenario does not exist in scenarios list')
    })

    it('returns error for duplicate scenario names', () => {
      expect(
        validateAppData({
          scenarios: [
            { name: 'Duplicate', tasks: [] },
            { name: 'Duplicate', tasks: [] },
          ],
          activeScenario: 'Duplicate',
          swimlanes: [],
        })
      ).toBe('Scenario names must be unique')
    })

    it('returns error for duplicate swimlane names', () => {
      expect(
        validateAppData({
          scenarios: [{ name: 'Main', tasks: [] }],
          activeScenario: 'Main',
          swimlanes: ['Team 1', 'Team 1'],
        })
      ).toBe('Swimlane names must be unique')
    })

    it('returns error when task references non-existent swimlane', () => {
      const data = {
        scenarios: [
          {
            name: 'Main',
            tasks: [
              {
                name: 'Task 1',
                swimlane: 'Non-existent Team',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue',
              },
            ],
          },
        ],
        activeScenario: 'Main',
        swimlanes: ['Engineering'],
      }
      expect(validateAppData(data)).toContain(
        'references non-existent swimlane'
      )
    })

    it('returns error for task with leading/trailing whitespace', () => {
      const data = {
        scenarios: [
          {
            name: 'Main',
            tasks: [
              {
                name: ' Task 1 ',
                swimlane: 'Engineering',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue',
              },
            ],
          },
        ],
        activeScenario: 'Main',
        swimlanes: ['Engineering'],
      }
      expect(validateAppData(data)).toContain(
        'has leading or trailing whitespace'
      )
    })

    it('returns error for invalid task progress', () => {
      const data = {
        scenarios: [
          {
            name: 'Main',
            tasks: [
              {
                name: 'Task 1',
                swimlane: 'Engineering',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 150,
                color: 'blue',
              },
            ],
          },
        ],
        activeScenario: 'Main',
        swimlanes: ['Engineering'],
      }
      expect(validateAppData(data)).toContain('Progress must be between')
    })

    it('returns error for invalid quarter range', () => {
      const data = {
        scenarios: [
          {
            name: 'Main',
            tasks: [
              {
                name: 'Task 1',
                swimlane: 'Engineering',
                startQuarter: 'Q4 2025',
                endQuarter: 'Q1 2025',
                progress: 50,
                color: 'blue',
              },
            ],
          },
        ],
        activeScenario: 'Main',
        swimlanes: ['Engineering'],
      }
      expect(validateAppData(data)).toContain('Start quarter must be before')
    })

    it('returns error for duplicate task names', () => {
      const data = {
        scenarios: [
          {
            name: 'Main',
            tasks: [
              {
                name: 'Task 1',
                swimlane: 'Engineering',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue',
              },
              {
                name: 'Task 1',
                swimlane: 'Engineering',
                startQuarter: 'Q3 2025',
                endQuarter: 'Q4 2025',
                progress: 50,
                color: 'blue',
              },
            ],
          },
        ],
        activeScenario: 'Main',
        swimlanes: ['Engineering'],
      }
      expect(validateAppData(data)).toBe(
        'Task names must be unique within each team in scenario "Main"'
      )
    })

    it('returns error for swimlane with leading/trailing whitespace', () => {
      const data = {
        scenarios: [{ name: 'Main', tasks: [] }],
        activeScenario: 'Main',
        swimlanes: [' Engineering '],
      }
      expect(validateAppData(data)).toContain(
        'has leading or trailing whitespace'
      )
    })

    it('returns error for scenario with leading/trailing whitespace', () => {
      const data = {
        scenarios: [{ name: ' Main ', tasks: [] }],
        activeScenario: ' Main ',
        swimlanes: [],
      }
      expect(validateAppData(data)).toContain(
        'has leading or trailing whitespace'
      )
    })

    it('returns error for invalid task structure', () => {
      const data = {
        scenarios: [
          {
            name: 'Main',
            tasks: [
              {
                name: 'Task 1',
                // missing required fields
              },
            ],
          },
        ],
        activeScenario: 'Main',
        swimlanes: [],
      }
      expect(validateAppData(data)).toBe('One or more scenarios are invalid')
    })

    it('returns error for null task in tasks array', () => {
      const data = {
        scenarios: [
          {
            name: 'Main',
            tasks: [null],
          },
        ],
        activeScenario: 'Main',
        swimlanes: [],
      }
      expect(validateAppData(data)).toBe('One or more scenarios are invalid')
    })

    it('returns error for null scenario in scenarios array', () => {
      const data = {
        scenarios: [null],
        activeScenario: 'Main',
        swimlanes: [],
      }
      expect(validateAppData(data)).toBe('One or more scenarios are invalid')
    })
  })
})

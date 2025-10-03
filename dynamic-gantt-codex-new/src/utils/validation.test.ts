import { type Quarter } from './quarter'
import {
  ValidationError,
  ensureProgressWithinRange,
  ensureQuarterRangeIsValid,
  normalizeName,
  validateTaskName,
  validateTaskPayload,
  validateTeamName,
  validateTimelineName,
} from './validation'

describe('validation utilities', () => {
  describe('normalizeName', () => {
    it('trims outer whitespace and collapses inner spaces', () => {
      expect(normalizeName('  Alpha   Team  ')).toBe('Alpha Team')
    })
  })

  describe('name validation', () => {
    const existing = ['Alpha Team', 'Beta Team']

    it('ensures team names are unique and trimmed', () => {
      expect(validateTeamName(' Gamma ', existing)).toBe('Gamma')
    })

    it('rejects duplicate names case-insensitively', () => {
      expect(() => validateTimelineName('alpha team', existing)).toThrow(ValidationError)
    })

    it('throws when task name is empty after trimming', () => {
      expect(() => validateTaskName('   ', existing)).toThrow('Task name is required')
    })
  })

  describe('progress validation', () => {
    it('accepts progress within range', () => {
      expect(() => ensureProgressWithinRange(100)).not.toThrow()
    })

    it('rejects non-integer values', () => {
      expect(() => ensureProgressWithinRange(50.5)).toThrow(ValidationError)
    })

    it('rejects out-of-range integers', () => {
      expect(() => ensureProgressWithinRange(101)).toThrow('Progress must be between 0 and 100')
    })
  })

  describe('quarter validation', () => {
    const start: Quarter = { year: 2025, quarter: 1 }
    const end: Quarter = { year: 2025, quarter: 4 }

    it('accepts valid ranges', () => {
      expect(() => ensureQuarterRangeIsValid(start, end)).not.toThrow()
    })

    it('rejects invalid ranges', () => {
      expect(() => ensureQuarterRangeIsValid(end, start)).toThrow('End quarter must be on or after start quarter')
    })
  })

  describe('task payload', () => {
    it('validates names, progress, and quarter ordering together', () => {
      const payload = {
        name: '  Task Alpha  ',
        existingTaskNames: ['Task Beta'],
        progress: 75,
        startQuarter: { year: 2025, quarter: 1 } as Quarter,
        endQuarter: { year: 2025, quarter: 2 } as Quarter,
      }

      expect(validateTaskPayload(payload)).toEqual({ name: 'Task Alpha' })
    })
  })
})

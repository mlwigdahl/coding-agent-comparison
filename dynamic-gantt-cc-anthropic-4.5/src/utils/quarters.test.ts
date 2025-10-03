import { describe, it, expect } from 'vitest'
import {
  getAllQuarters,
  getQuarterIndex,
  compareQuarters,
  getQuartersBetween,
} from './quarters'
import type { Quarter } from '../types'

describe('quarters utilities', () => {
  describe('getAllQuarters', () => {
    it('returns all 16 quarters', () => {
      const quarters = getAllQuarters()
      expect(quarters).toHaveLength(16)
    })

    it('starts with Q1 2025', () => {
      const quarters = getAllQuarters()
      expect(quarters[0]).toBe('Q1 2025')
    })

    it('ends with Q4 2028', () => {
      const quarters = getAllQuarters()
      expect(quarters[15]).toBe('Q4 2028')
    })

    it('includes all quarters in order', () => {
      const quarters = getAllQuarters()
      expect(quarters).toEqual([
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
      ])
    })
  })

  describe('getQuarterIndex', () => {
    it('returns 0 for Q1 2025', () => {
      expect(getQuarterIndex('Q1 2025')).toBe(0)
    })

    it('returns 15 for Q4 2028', () => {
      expect(getQuarterIndex('Q4 2028')).toBe(15)
    })

    it('returns correct index for middle quarters', () => {
      expect(getQuarterIndex('Q1 2026')).toBe(4)
      expect(getQuarterIndex('Q4 2026')).toBe(7)
      expect(getQuarterIndex('Q1 2027')).toBe(8)
      expect(getQuarterIndex('Q3 2028')).toBe(14)
    })

    it('returns -1 for invalid quarter', () => {
      expect(getQuarterIndex('Q5 2025' as Quarter)).toBe(-1)
    })
  })

  describe('compareQuarters', () => {
    it('returns 0 for equal quarters', () => {
      expect(compareQuarters('Q1 2025', 'Q1 2025')).toBe(0)
      expect(compareQuarters('Q3 2027', 'Q3 2027')).toBe(0)
    })

    it('returns -1 when first quarter is earlier', () => {
      expect(compareQuarters('Q1 2025', 'Q2 2025')).toBe(-1)
      expect(compareQuarters('Q4 2025', 'Q1 2026')).toBe(-1)
      expect(compareQuarters('Q1 2025', 'Q4 2028')).toBe(-1)
    })

    it('returns 1 when first quarter is later', () => {
      expect(compareQuarters('Q2 2025', 'Q1 2025')).toBe(1)
      expect(compareQuarters('Q1 2026', 'Q4 2025')).toBe(1)
      expect(compareQuarters('Q4 2028', 'Q1 2025')).toBe(1)
    })

    it('handles quarters from different years', () => {
      expect(compareQuarters('Q4 2025', 'Q1 2026')).toBe(-1)
      expect(compareQuarters('Q1 2028', 'Q4 2027')).toBe(1)
    })
  })

  describe('getQuartersBetween', () => {
    it('returns single quarter when start equals end', () => {
      const result = getQuartersBetween('Q1 2025', 'Q1 2025')
      expect(result).toEqual(['Q1 2025'])
    })

    it('returns correct range for consecutive quarters', () => {
      const result = getQuartersBetween('Q1 2025', 'Q3 2025')
      expect(result).toEqual(['Q1 2025', 'Q2 2025', 'Q3 2025'])
    })

    it('returns correct range spanning multiple years', () => {
      const result = getQuartersBetween('Q3 2025', 'Q2 2026')
      expect(result).toEqual([
        'Q3 2025',
        'Q4 2025',
        'Q1 2026',
        'Q2 2026',
      ])
    })

    it('returns full range from first to last quarter', () => {
      const result = getQuartersBetween('Q1 2025', 'Q4 2028')
      expect(result).toHaveLength(16)
      expect(result[0]).toBe('Q1 2025')
      expect(result[15]).toBe('Q4 2028')
    })

    it('returns empty array when start is after end', () => {
      const result = getQuartersBetween('Q3 2025', 'Q1 2025')
      expect(result).toEqual([])
    })

    it('returns empty array for invalid start quarter', () => {
      const result = getQuartersBetween('Q5 2025' as Quarter, 'Q3 2025')
      expect(result).toEqual([])
    })

    it('returns empty array for invalid end quarter', () => {
      const result = getQuartersBetween('Q1 2025', 'Q5 2025' as Quarter)
      expect(result).toEqual([])
    })

    it('returns correct range for last quarters of consecutive years', () => {
      const result = getQuartersBetween('Q4 2026', 'Q1 2027')
      expect(result).toEqual(['Q4 2026', 'Q1 2027'])
    })
  })
})

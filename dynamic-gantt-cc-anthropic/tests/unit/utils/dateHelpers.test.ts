import { describe, it, expect } from 'vitest';
import {
  parseQuarter,
  getQuarterIndex,
  isQuarterBefore,
  isQuarterAfter,
  getQuartersForYear,
  getQuartersByYear,
  getQuarterDuration,
  getTaskColumnSpan,
  getTaskStartColumn
} from '../../../src/utils/dateHelpers';
import { Quarter } from '../../../src/types/task';

describe('dateHelpers', () => {
  describe('parseQuarter', () => {
    it('should parse valid quarter strings correctly', () => {
      const testCases: Array<{ input: Quarter, expected: { quarter: number, year: number } }> = [
        { input: 'Q1 2025', expected: { quarter: 1, year: 2025 } },
        { input: 'Q2 2025', expected: { quarter: 2, year: 2025 } },
        { input: 'Q3 2025', expected: { quarter: 3, year: 2025 } },
        { input: 'Q4 2025', expected: { quarter: 4, year: 2025 } },
        { input: 'Q1 2028', expected: { quarter: 1, year: 2028 } },
        { input: 'Q4 2028', expected: { quarter: 4, year: 2028 } }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parseQuarter(input);
        expect(result).toEqual(expected);
      });
    });

    it('should throw error for invalid quarter formats', () => {
      const invalidFormats = [
        'Q1-2025',      // Wrong separator
        '2025 Q1',      // Wrong order
        'Quarter 1 2025', // Wrong format
        'Q1 25',        // Short year
        'Q1  2025',     // Extra space
        'q1 2025',      // Lowercase
        'Q12025',       // No space
        '',             // Empty string
        'invalid'       // Completely invalid
      ];

      invalidFormats.forEach(invalid => {
        expect(() => parseQuarter(invalid as Quarter)).toThrow('Invalid quarter format');
      });
    });

    it('should parse quarters that match format but are outside valid range', () => {
      // These match the regex format but are outside the valid QUARTERS range
      // parseQuarter only validates format, not whether it's in the valid range
      const outsideRangeButValidFormat = [
        'Q1 2024',      // Year too early
        'Q5 2025',      // Invalid quarter number
        'Q1 2029'       // Year too late
      ];

      outsideRangeButValidFormat.forEach(quarter => {
        const result = parseQuarter(quarter as Quarter);
        expect(result).toHaveProperty('quarter');
        expect(result).toHaveProperty('year');
        expect(typeof result.quarter).toBe('number');
        expect(typeof result.year).toBe('number');
      });
    });
  });

  describe('getQuarterIndex', () => {
    it('should return correct index for all valid quarters', () => {
      const expectedIndices: Array<{ quarter: Quarter, index: number }> = [
        { quarter: 'Q1 2025', index: 0 },
        { quarter: 'Q2 2025', index: 1 },
        { quarter: 'Q3 2025', index: 2 },
        { quarter: 'Q4 2025', index: 3 },
        { quarter: 'Q1 2026', index: 4 },
        { quarter: 'Q2 2026', index: 5 },
        { quarter: 'Q3 2026', index: 6 },
        { quarter: 'Q4 2026', index: 7 },
        { quarter: 'Q1 2027', index: 8 },
        { quarter: 'Q2 2027', index: 9 },
        { quarter: 'Q3 2027', index: 10 },
        { quarter: 'Q4 2027', index: 11 },
        { quarter: 'Q1 2028', index: 12 },
        { quarter: 'Q2 2028', index: 13 },
        { quarter: 'Q3 2028', index: 14 },
        { quarter: 'Q4 2028', index: 15 }
      ];

      expectedIndices.forEach(({ quarter, index }) => {
        expect(getQuarterIndex(quarter)).toBe(index);
      });
    });

    it('should return -1 for invalid quarters', () => {
      const invalidQuarters = ['Q1 2024', 'Q5 2025', 'Q1 2029', 'invalid'] as Quarter[];
      
      invalidQuarters.forEach(quarter => {
        expect(getQuarterIndex(quarter)).toBe(-1);
      });
    });
  });

  describe('isQuarterBefore', () => {
    it('should return true when first quarter is before second', () => {
      const testCases: Array<{ first: Quarter, second: Quarter }> = [
        { first: 'Q1 2025', second: 'Q2 2025' },
        { first: 'Q1 2025', second: 'Q4 2025' },
        { first: 'Q4 2025', second: 'Q1 2026' },
        { first: 'Q1 2025', second: 'Q4 2028' },
        { first: 'Q3 2027', second: 'Q1 2028' }
      ];

      testCases.forEach(({ first, second }) => {
        expect(isQuarterBefore(first, second)).toBe(true);
      });
    });

    it('should return false when first quarter is after second', () => {
      const testCases: Array<{ first: Quarter, second: Quarter }> = [
        { first: 'Q2 2025', second: 'Q1 2025' },
        { first: 'Q4 2025', second: 'Q1 2025' },
        { first: 'Q1 2026', second: 'Q4 2025' },
        { first: 'Q4 2028', second: 'Q1 2025' }
      ];

      testCases.forEach(({ first, second }) => {
        expect(isQuarterBefore(first, second)).toBe(false);
      });
    });

    it('should return false when quarters are the same', () => {
      const testCases: Quarter[] = ['Q1 2025', 'Q2 2026', 'Q3 2027', 'Q4 2028'];

      testCases.forEach(quarter => {
        expect(isQuarterBefore(quarter, quarter)).toBe(false);
      });
    });
  });

  describe('isQuarterAfter', () => {
    it('should return true when first quarter is after second', () => {
      const testCases: Array<{ first: Quarter, second: Quarter }> = [
        { first: 'Q2 2025', second: 'Q1 2025' },
        { first: 'Q4 2025', second: 'Q1 2025' },
        { first: 'Q1 2026', second: 'Q4 2025' },
        { first: 'Q4 2028', second: 'Q1 2025' },
        { first: 'Q1 2028', second: 'Q3 2027' }
      ];

      testCases.forEach(({ first, second }) => {
        expect(isQuarterAfter(first, second)).toBe(true);
      });
    });

    it('should return false when first quarter is before second', () => {
      const testCases: Array<{ first: Quarter, second: Quarter }> = [
        { first: 'Q1 2025', second: 'Q2 2025' },
        { first: 'Q1 2025', second: 'Q4 2025' },
        { first: 'Q4 2025', second: 'Q1 2026' },
        { first: 'Q1 2025', second: 'Q4 2028' }
      ];

      testCases.forEach(({ first, second }) => {
        expect(isQuarterAfter(first, second)).toBe(false);
      });
    });

    it('should return false when quarters are the same', () => {
      const testCases: Quarter[] = ['Q1 2025', 'Q2 2026', 'Q3 2027', 'Q4 2028'];

      testCases.forEach(quarter => {
        expect(isQuarterAfter(quarter, quarter)).toBe(false);
      });
    });
  });

  describe('getQuartersForYear', () => {
    it('should return all quarters for a given year', () => {
      const testCases = [
        { 
          year: 2025, 
          expected: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'] 
        },
        { 
          year: 2026, 
          expected: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'] 
        },
        { 
          year: 2027, 
          expected: ['Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027'] 
        },
        { 
          year: 2028, 
          expected: ['Q1 2028', 'Q2 2028', 'Q3 2028', 'Q4 2028'] 
        }
      ];

      testCases.forEach(({ year, expected }) => {
        const result = getQuartersForYear(year);
        expect(result).toEqual(expected);
        expect(result).toHaveLength(4);
      });
    });

    it('should return empty array for invalid years', () => {
      const invalidYears = [2024, 2029, 2020, 2030];

      invalidYears.forEach(year => {
        const result = getQuartersForYear(year);
        expect(result).toEqual([]);
      });
    });
  });

  describe('getQuartersByYear', () => {
    it('should return quarters grouped by year', () => {
      const result = getQuartersByYear();
      
      expect(result).toHaveLength(4);
      expect(result).toEqual([
        {
          year: 2025,
          quarters: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025']
        },
        {
          year: 2026,
          quarters: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026']
        },
        {
          year: 2027,
          quarters: ['Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027']
        },
        {
          year: 2028,
          quarters: ['Q1 2028', 'Q2 2028', 'Q3 2028', 'Q4 2028']
        }
      ]);
    });

    it('should return consistent structure with each year having 4 quarters', () => {
      const result = getQuartersByYear();
      
      result.forEach(yearGroup => {
        expect(yearGroup).toHaveProperty('year');
        expect(yearGroup).toHaveProperty('quarters');
        expect(yearGroup.quarters).toHaveLength(4);
        expect(typeof yearGroup.year).toBe('number');
        expect(Array.isArray(yearGroup.quarters)).toBe(true);
      });
    });
  });

  describe('getQuarterDuration', () => {
    it('should calculate correct duration for same quarter', () => {
      const testCases: Quarter[] = ['Q1 2025', 'Q2 2026', 'Q3 2027', 'Q4 2028'];

      testCases.forEach(quarter => {
        expect(getQuarterDuration(quarter, quarter)).toBe(1);
      });
    });

    it('should calculate correct duration for adjacent quarters', () => {
      const testCases: Array<{ start: Quarter, end: Quarter, expected: number }> = [
        { start: 'Q1 2025', end: 'Q2 2025', expected: 2 },
        { start: 'Q2 2025', end: 'Q3 2025', expected: 2 },
        { start: 'Q3 2025', end: 'Q4 2025', expected: 2 },
        { start: 'Q4 2025', end: 'Q1 2026', expected: 2 }
      ];

      testCases.forEach(({ start, end, expected }) => {
        expect(getQuarterDuration(start, end)).toBe(expected);
      });
    });

    it('should calculate correct duration for multi-quarter spans', () => {
      const testCases: Array<{ start: Quarter, end: Quarter, expected: number }> = [
        { start: 'Q1 2025', end: 'Q4 2025', expected: 4 }, // Full year
        { start: 'Q1 2025', end: 'Q2 2026', expected: 6 }, // 1.25 years
        { start: 'Q1 2025', end: 'Q4 2028', expected: 16 }, // Full span
        { start: 'Q2 2025', end: 'Q3 2026', expected: 6 }, // 1.5 years
        { start: 'Q4 2027', end: 'Q2 2028', expected: 3 }  // Across year boundary
      ];

      testCases.forEach(({ start, end, expected }) => {
        expect(getQuarterDuration(start, end)).toBe(expected);
      });
    });

    it('should throw error for invalid quarters', () => {
      expect(() => getQuarterDuration('invalid' as Quarter, 'Q1 2025')).toThrow('Invalid quarter provided');
      expect(() => getQuarterDuration('Q1 2025', 'invalid' as Quarter)).toThrow('Invalid quarter provided');
      expect(() => getQuarterDuration('invalid' as Quarter, 'also invalid' as Quarter)).toThrow('Invalid quarter provided');
    });

    it('should handle minimum duration of 1 even for backwards ranges', () => {
      // This tests the Math.max(1, ...) part of the function
      const testCases: Array<{ start: Quarter, end: Quarter }> = [
        { start: 'Q2 2025', end: 'Q1 2025' },
        { start: 'Q4 2025', end: 'Q1 2025' },
        { start: 'Q1 2026', end: 'Q4 2025' }
      ];

      testCases.forEach(({ start, end }) => {
        const result = getQuarterDuration(start, end);
        expect(result).toBe(1); // Should be minimum of 1
      });
    });
  });

  describe('getTaskColumnSpan', () => {
    it('should return same value as getQuarterDuration', () => {
      const testCases: Array<{ start: Quarter, end: Quarter }> = [
        { start: 'Q1 2025', end: 'Q1 2025' },
        { start: 'Q1 2025', end: 'Q2 2025' },
        { start: 'Q1 2025', end: 'Q4 2025' },
        { start: 'Q1 2025', end: 'Q4 2028' },
        { start: 'Q2 2026', end: 'Q3 2027' }
      ];

      testCases.forEach(({ start, end }) => {
        const columnSpan = getTaskColumnSpan(start, end);
        const duration = getQuarterDuration(start, end);
        expect(columnSpan).toBe(duration);
      });
    });

    it('should return correct column spans for CSS Grid', () => {
      const testCases: Array<{ start: Quarter, end: Quarter, expected: number }> = [
        { start: 'Q1 2025', end: 'Q1 2025', expected: 1 },
        { start: 'Q1 2025', end: 'Q2 2025', expected: 2 },
        { start: 'Q1 2025', end: 'Q3 2025', expected: 3 },
        { start: 'Q1 2025', end: 'Q4 2025', expected: 4 },
        { start: 'Q1 2025', end: 'Q4 2028', expected: 16 }
      ];

      testCases.forEach(({ start, end, expected }) => {
        expect(getTaskColumnSpan(start, end)).toBe(expected);
      });
    });
  });

  describe('getTaskStartColumn', () => {
    it('should return 1-based column positions for CSS Grid', () => {
      const testCases: Array<{ quarter: Quarter, expected: number }> = [
        { quarter: 'Q1 2025', expected: 1 },   // Index 0 -> Column 1
        { quarter: 'Q2 2025', expected: 2 },   // Index 1 -> Column 2
        { quarter: 'Q3 2025', expected: 3 },   // Index 2 -> Column 3
        { quarter: 'Q4 2025', expected: 4 },   // Index 3 -> Column 4
        { quarter: 'Q1 2026', expected: 5 },   // Index 4 -> Column 5
        { quarter: 'Q2 2026', expected: 6 },   // Index 5 -> Column 6
        { quarter: 'Q3 2026', expected: 7 },   // Index 6 -> Column 7
        { quarter: 'Q4 2026', expected: 8 },   // Index 7 -> Column 8
        { quarter: 'Q1 2027', expected: 9 },   // Index 8 -> Column 9
        { quarter: 'Q2 2027', expected: 10 },  // Index 9 -> Column 10
        { quarter: 'Q3 2027', expected: 11 },  // Index 10 -> Column 11
        { quarter: 'Q4 2027', expected: 12 },  // Index 11 -> Column 12
        { quarter: 'Q1 2028', expected: 13 },  // Index 12 -> Column 13
        { quarter: 'Q2 2028', expected: 14 },  // Index 13 -> Column 14
        { quarter: 'Q3 2028', expected: 15 },  // Index 14 -> Column 15
        { quarter: 'Q4 2028', expected: 16 }   // Index 15 -> Column 16
      ];

      testCases.forEach(({ quarter, expected }) => {
        expect(getTaskStartColumn(quarter)).toBe(expected);
      });
    });

    it('should return 0 for invalid quarters (index -1 + 1 = 0)', () => {
      const invalidQuarters = ['Q1 2024', 'Q5 2025', 'Q1 2029', 'invalid'] as Quarter[];
      
      invalidQuarters.forEach(quarter => {
        expect(getTaskStartColumn(quarter)).toBe(0);
      });
    });
  });

  describe('integration and edge cases', () => {
    it('should handle full application timeline span', () => {
      const startQuarter: Quarter = 'Q1 2025';
      const endQuarter: Quarter = 'Q4 2028';
      
      expect(getQuarterIndex(startQuarter)).toBe(0);
      expect(getQuarterIndex(endQuarter)).toBe(15);
      expect(getQuarterDuration(startQuarter, endQuarter)).toBe(16);
      expect(getTaskColumnSpan(startQuarter, endQuarter)).toBe(16);
      expect(getTaskStartColumn(startQuarter)).toBe(1);
      expect(isQuarterBefore(startQuarter, endQuarter)).toBe(true);
      expect(isQuarterAfter(endQuarter, startQuarter)).toBe(true);
    });

    it('should maintain consistency between related functions', () => {
      const testQuarters: Quarter[] = [
        'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025',
        'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026',
        'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027',
        'Q1 2028', 'Q2 2028', 'Q3 2028', 'Q4 2028'
      ];

      testQuarters.forEach((quarter, index) => {
        // Start column should be index + 1 (1-based)
        expect(getTaskStartColumn(quarter)).toBe(index + 1);
        
        // Index should match array position
        expect(getQuarterIndex(quarter)).toBe(index);
        
        // Duration to same quarter should be 1
        expect(getQuarterDuration(quarter, quarter)).toBe(1);
        expect(getTaskColumnSpan(quarter, quarter)).toBe(1);
        
        // Quarter should not be before or after itself
        expect(isQuarterBefore(quarter, quarter)).toBe(false);
        expect(isQuarterAfter(quarter, quarter)).toBe(false);
      });
    });

    it('should handle performance requirements', () => {
      // Test performance with many operations
      const testQuarters: Quarter[] = [
        'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025',
        'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026',
        'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027',
        'Q1 2028', 'Q2 2028', 'Q3 2028', 'Q4 2028'
      ];

      const startTime = performance.now();
      
      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        testQuarters.forEach(quarter => {
          getQuarterIndex(quarter);
          getTaskStartColumn(quarter);
          parseQuarter(quarter);
          getQuarterDuration(quarter, quarter);
        });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete all operations quickly (< 50ms for 16,000 operations)
      expect(duration).toBeLessThan(50);
    });

    it('should validate parseQuarter and other functions work together', () => {
      const quarter: Quarter = 'Q3 2026';
      
      const parsed = parseQuarter(quarter);
      expect(parsed.quarter).toBe(3);
      expect(parsed.year).toBe(2026);
      
      const index = getQuarterIndex(quarter);
      expect(index).toBe(6); // Q3 2026 should be index 6
      
      const startColumn = getTaskStartColumn(quarter);
      expect(startColumn).toBe(7); // Index 6 -> Column 7
      
      const quartersForYear = getQuartersForYear(2026);
      expect(quartersForYear).toContain(quarter);
    });

    it('should handle boundary quarters correctly', () => {
      const firstQuarter: Quarter = 'Q1 2025';
      const lastQuarter: Quarter = 'Q4 2028';
      
      // First quarter
      expect(getQuarterIndex(firstQuarter)).toBe(0);
      expect(getTaskStartColumn(firstQuarter)).toBe(1);
      expect(parseQuarter(firstQuarter)).toEqual({ quarter: 1, year: 2025 });
      
      // Last quarter
      expect(getQuarterIndex(lastQuarter)).toBe(15);
      expect(getTaskStartColumn(lastQuarter)).toBe(16);
      expect(parseQuarter(lastQuarter)).toEqual({ quarter: 4, year: 2028 });
      
      // Relations
      expect(isQuarterBefore(firstQuarter, lastQuarter)).toBe(true);
      expect(isQuarterAfter(lastQuarter, firstQuarter)).toBe(true);
      expect(getQuarterDuration(firstQuarter, lastQuarter)).toBe(16);
    });
  });
});
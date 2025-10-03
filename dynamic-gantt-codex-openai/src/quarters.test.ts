import { describe, it, expect } from 'vitest';
import {
  ALL_QUARTERS,
  QuarterId,
  quarterIndex,
  indexToQuarter,
  quartersBetween,
  compareQuarters,
  isValidQuarter,
  splitQuarterLabel,
  YEAR_SEPARATOR_INDICES,
} from './state/quarters';

describe('quarters utilities', () => {
  it('has 16 ordered quarters from Q1 2025 to Q4 2028', () => {
    expect(ALL_QUARTERS.length).toBe(16);
    expect(ALL_QUARTERS[0]).toBe('Q1 2025');
    expect(ALL_QUARTERS[15]).toBe('Q4 2028');
  });

  it('maps quarter to index and back', () => {
    expect(quarterIndex('Q1 2025' as QuarterId)).toBe(0);
    expect(quarterIndex('Q4 2025' as QuarterId)).toBe(3);
    expect(quarterIndex('Q1 2026' as QuarterId)).toBe(4);
    expect(quarterIndex('Q4 2028' as QuarterId)).toBe(15);

    expect(indexToQuarter(0)).toBe('Q1 2025');
    expect(indexToQuarter(15)).toBe('Q4 2028');
  });

  it('computes inclusive span between quarters', () => {
    expect(quartersBetween('Q1 2025' as QuarterId, 'Q1 2025' as QuarterId)).toBe(1);
    expect(quartersBetween('Q1 2025' as QuarterId, 'Q4 2025' as QuarterId)).toBe(4);
    expect(quartersBetween('Q3 2025' as QuarterId, 'Q2 2026' as QuarterId)).toBe(4);
  });

  it('compares quarters chronologically', () => {
    expect(compareQuarters('Q1 2025' as QuarterId, 'Q2 2025' as QuarterId)).toBeLessThan(0);
    expect(compareQuarters('Q2 2025' as QuarterId, 'Q2 2025' as QuarterId)).toBe(0);
    expect(compareQuarters('Q4 2028' as QuarterId, 'Q3 2028' as QuarterId)).toBeGreaterThan(0);
  });

  it('validates quarter IDs and splits labels', () => {
    expect(isValidQuarter('Q2 2027')).toBe(true);
    expect(isValidQuarter('Q5 2027')).toBe(false);
    const parts = splitQuarterLabel('Q1 2025' as QuarterId);
    expect(parts.quarter).toBe('Q1');
    expect(parts.year).toBe('2025');
  });

  it('exposes year separator indices', () => {
    expect(YEAR_SEPARATOR_INDICES).toEqual([0, 4, 8, 12]);
  });
});


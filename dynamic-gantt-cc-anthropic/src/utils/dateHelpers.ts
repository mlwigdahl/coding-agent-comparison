import { QUARTERS, YEARS } from './constants';
import { Quarter } from '../types';

// Extract quarter number and year from quarter string
export function parseQuarter(quarter: Quarter): { quarter: number; year: number } {
  const match = quarter.match(/^Q(\d) (\d{4})$/);
  if (!match) {
    throw new Error(`Invalid quarter format: ${quarter}`);
  }
  
  return {
    quarter: parseInt(match[1], 10),
    year: parseInt(match[2], 10)
  };
}

// Get quarter index in the QUARTERS array
export function getQuarterIndex(quarter: Quarter): number {
  return QUARTERS.indexOf(quarter);
}

// Check if one quarter is before another
export function isQuarterBefore(quarter1: Quarter, quarter2: Quarter): boolean {
  return getQuarterIndex(quarter1) < getQuarterIndex(quarter2);
}

// Check if one quarter is after another
export function isQuarterAfter(quarter1: Quarter, quarter2: Quarter): boolean {
  return getQuarterIndex(quarter1) > getQuarterIndex(quarter2);
}

// Get quarters for a specific year
export function getQuartersForYear(year: number): Quarter[] {
  return QUARTERS.filter(quarter => quarter.includes(year.toString()));
}

// Get all quarters grouped by year
export function getQuartersByYear(): Array<{ year: number; quarters: Quarter[] }> {
  return YEARS.map(year => ({
    year,
    quarters: getQuartersForYear(year)
  }));
}

// Calculate duration between two quarters (inclusive)
export function getQuarterDuration(startQuarter: Quarter, endQuarter: Quarter): number {
  const startIndex = getQuarterIndex(startQuarter);
  const endIndex = getQuarterIndex(endQuarter);
  
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Invalid quarter provided');
  }
  
  return Math.max(1, endIndex - startIndex + 1);
}

// Get the column span for a task (for CSS Grid)
export function getTaskColumnSpan(startQuarter: Quarter, endQuarter: Quarter): number {
  return getQuarterDuration(startQuarter, endQuarter);
}

// Get the starting column for a task (1-based for CSS Grid)
export function getTaskStartColumn(startQuarter: Quarter): number {
  return getQuarterIndex(startQuarter) + 1;
}
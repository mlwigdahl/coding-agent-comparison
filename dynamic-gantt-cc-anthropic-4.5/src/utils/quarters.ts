import type { Quarter } from '../types'
import { QUARTERS } from '../constants'

/**
 * Returns all available quarters from Q1 2025 through Q4 2028
 */
export function getAllQuarters(): Quarter[] {
  return QUARTERS
}

/**
 * Returns the 0-based index of a quarter in the timeline
 * @param quarter - The quarter to get the index for
 * @returns The index (0-15) or -1 if not found
 */
export function getQuarterIndex(quarter: Quarter): number {
  return QUARTERS.indexOf(quarter)
}

/**
 * Compares two quarters
 * @param q1 - First quarter
 * @param q2 - Second quarter
 * @returns -1 if q1 < q2, 0 if q1 === q2, 1 if q1 > q2
 */
export function compareQuarters(q1: Quarter, q2: Quarter): number {
  const index1 = getQuarterIndex(q1)
  const index2 = getQuarterIndex(q2)

  if (index1 < index2) return -1
  if (index1 > index2) return 1
  return 0
}

/**
 * Returns an array of quarters between start and end (inclusive)
 * @param start - Starting quarter
 * @param end - Ending quarter
 * @returns Array of quarters in the range
 */
export function getQuartersBetween(start: Quarter, end: Quarter): Quarter[] {
  const startIndex = getQuarterIndex(start)
  const endIndex = getQuarterIndex(end)

  if (startIndex === -1 || endIndex === -1) {
    return []
  }

  if (startIndex > endIndex) {
    return []
  }

  return QUARTERS.slice(startIndex, endIndex + 1)
}

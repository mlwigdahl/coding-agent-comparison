import type { Quarter, ColorTheme } from '../types'

/**
 * All available quarters from Q1 2025 through Q4 2028
 */
export const QUARTERS: Quarter[] = [
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

/**
 * Color scheme definitions matching the spec
 */
export const COLOR_THEMES: Record<
  ColorTheme,
  { uncompleted: string; completed: string }
> = {
  blue: {
    uncompleted: '#3b82f6',
    completed: '#1e40af',
  },
  indigo: {
    uncompleted: '#6366f1',
    completed: '#3730a3',
  },
}

/**
 * Progress bar color (orange)
 */
export const PROGRESS_BAR_COLOR = '#f97316'

/**
 * LocalStorage key for persisting application data
 */
export const STORAGE_KEY = 'dynamic-timeline-data'

/**
 * Default application data structure
 */
export const DEFAULT_APP_DATA = {
  scenarios: [{ name: 'Main Timeline', tasks: [] }],
  activeScenario: 'Main Timeline',
  swimlanes: [],
}

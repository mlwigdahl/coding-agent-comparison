// Quarter definitions for Q1 2025 - Q4 2028
export const QUARTERS = [
  'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025',
  'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026',
  'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027',
  'Q1 2028', 'Q2 2028', 'Q3 2028', 'Q4 2028'
] as const;

// Color themes as specified
export const COLOR_THEMES = ['blue', 'indigo'] as const;

// Color palette from specification
export const COLORS = {
  blue: {
    uncompleted: '#3b82f6',
    completed: '#1e40af'
  },
  indigo: {
    uncompleted: '#6366f1',
    completed: '#3730a3'
  },
  progress: '#f97316'
} as const;

// Years for display
export const YEARS = [2025, 2026, 2027, 2028] as const;

// Max file size for imports (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Animation duration for timeline transitions
export const ANIMATION_DURATION = 2000;
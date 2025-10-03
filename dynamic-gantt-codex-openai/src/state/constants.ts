export const FIRST_YEAR = 2025 as const;
export const LAST_YEAR = 2028 as const;
export const QUARTERS_PER_YEAR = 4 as const;
export const TOTAL_QUARTERS = (LAST_YEAR - FIRST_YEAR + 1) * QUARTERS_PER_YEAR;
export const FIRST_COL_PX = 200 as const; // width of left Teams column

export const COLORS = {
  blue: {
    uncompleted: '#3b82f6',
    completed: '#1e40af',
  },
  indigo: {
    uncompleted: '#6366f1',
    completed: '#3730a3',
  },
  orange: '#f97316',
} as const;

export const APP_TITLE = 'Dynamic Project Timeline - Quarterly View' as const;

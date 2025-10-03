import { QUARTERS, COLOR_THEMES } from '../utils/constants';

// Quarter type from constants
export type Quarter = typeof QUARTERS[number];

// Color theme type from constants  
export type ColorTheme = typeof COLOR_THEMES[number];

// Core Task interface based on SPEC.md requirements
export interface ITask {
  name: string;                    // Unique task name (trimmed)
  swimlane: string;               // Associated team name
  startQuarter: Quarter;          // Start quarter (Q1 2025 - Q4 2028)
  endQuarter: Quarter;            // End quarter (Q1 2025 - Q4 2028)  
  progress: number;               // Completion percentage (0-100 integer)
  color: ColorTheme;              // Color theme (blue or indigo)
}

// Task creation payload (for forms)
export type CreateTaskPayload = Omit<ITask, 'name'> & {
  name: string;
};

// Task update payload (for forms)
export type UpdateTaskPayload = Partial<ITask> & {
  name: string; // Name is required for identification
};

// Task with positioning information for rendering
export interface PositionedTask {
  task: ITask;
  row: number;                    // Row position in swimlane (0-based)
  startColumn: number;            // Start column index (0-based) 
  endColumn: number;              // End column index (0-based)
}
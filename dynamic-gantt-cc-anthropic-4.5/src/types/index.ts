/**
 * Color themes available for tasks
 */
export type ColorTheme = 'blue' | 'indigo'

/**
 * All available quarters from Q1 2025 through Q4 2028
 */
export type Quarter =
  | 'Q1 2025'
  | 'Q2 2025'
  | 'Q3 2025'
  | 'Q4 2025'
  | 'Q1 2026'
  | 'Q2 2026'
  | 'Q3 2026'
  | 'Q4 2026'
  | 'Q1 2027'
  | 'Q2 2027'
  | 'Q3 2027'
  | 'Q4 2027'
  | 'Q1 2028'
  | 'Q2 2028'
  | 'Q3 2028'
  | 'Q4 2028'

/**
 * Represents a task in the timeline
 */
export interface Task {
  name: string
  swimlane: string // team name
  startQuarter: Quarter
  endQuarter: Quarter
  progress: number // 0-100
  color: ColorTheme
}

/**
 * Represents a timeline scenario with its associated tasks
 */
export interface Scenario {
  name: string
  tasks: Task[]
}

/**
 * Complete application data structure
 */
export interface AppData {
  scenarios: Scenario[]
  activeScenario: string
  swimlanes: string[] // team names
  exportDate?: string
}

/**
 * Task with calculated row position for stacking display
 */
export interface StackedTask extends Task {
  row: number
}

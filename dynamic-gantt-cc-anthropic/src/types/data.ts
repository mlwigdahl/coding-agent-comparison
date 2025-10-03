import { ITimeline } from './timeline';

// Export/Import data structure based on SPEC.md JSON example
export interface ExportData {
  scenarios: ITimeline[];         // Array of timelines (called scenarios in export)
  activeScenario: string;         // Name of currently active timeline
  swimlanes: string[];           // Array of team names (swimlanes)
  exportDate: string;            // ISO date string when exported
}

// Validation result for import operations
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: ExportData;
}

// Application state structure
export interface AppState {
  timelines: ITimeline[];         // All configured timelines
  activeTimeline: string;         // Name of currently selected timeline  
  teams: string[];               // All configured team names
}
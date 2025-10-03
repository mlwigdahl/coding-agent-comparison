import type { QuarterId } from './quarters';

export type ColorTheme = 'blue' | 'indigo';

export interface Task {
  name: string; // unique within a scenario, trimmed
  swimlane: string; // team name, trimmed, must exist in AppData.swimlanes
  startQuarter: QuarterId;
  endQuarter: QuarterId; // inclusive, >= start
  progress: number; // 0..100 integer
  color: ColorTheme;
}

export interface Scenario {
  name: string; // unique across scenarios, trimmed
  tasks: Task[];
}

export interface AppData {
  scenarios: Scenario[];
  activeScenario: string; // must match a Scenario.name
  swimlanes: string[]; // unique team names, trimmed
  exportDate?: string; // ISO string on export
}


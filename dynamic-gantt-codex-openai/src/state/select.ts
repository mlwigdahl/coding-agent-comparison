import type { AppData } from './types';

export function getActiveScenario(state: AppData) {
  return state.scenarios.find((s) => s.name === state.activeScenario)!;
}

export function getTasksForActiveScenario(state: AppData) {
  return getActiveScenario(state).tasks;
}

export function getTeamTaskCounts(state: AppData): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const team of state.swimlanes) counts[team] = 0;
  for (const t of getTasksForActiveScenario(state)) counts[t.swimlane] = (counts[t.swimlane] ?? 0) + 1;
  return counts;
}


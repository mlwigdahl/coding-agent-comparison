import type { Task } from './types';

export type Action =
  | { type: 'ADD_TEAM'; name: string }
  | { type: 'ADD_SCENARIO'; name: string }
  | { type: 'SET_ACTIVE_SCENARIO'; name: string }
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; originalName: string; originalSwimlane: string; updates: Partial<Task> }
  | { type: 'DELETE_TASK'; name: string; swimlane: string }
  | { type: 'IMPORT_DATA'; payload: import('./types').AppData };

export const addTeam = (name: string): Action => ({ type: 'ADD_TEAM', name });
export const addScenario = (name: string): Action => ({ type: 'ADD_SCENARIO', name });
export const setActiveScenario = (name: string): Action => ({ type: 'SET_ACTIVE_SCENARIO', name });
export const addTask = (task: Task): Action => ({ type: 'ADD_TASK', task });
export const updateTask = (originalName: string, originalSwimlane: string, updates: Partial<Task>): Action => ({
  type: 'UPDATE_TASK',
  originalName,
  originalSwimlane,
  updates,
});
export const deleteTask = (name: string, swimlane: string): Action => ({ type: 'DELETE_TASK', name, swimlane });

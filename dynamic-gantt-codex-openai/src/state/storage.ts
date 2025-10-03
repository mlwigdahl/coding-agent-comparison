import type { AppData } from './types';
import { AppDataSchema } from './schema';
import { initialState } from './reducer';

const KEY = 'dynamic-gantt-app-data';

export function loadFromStorage(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return AppDataSchema.parse(parsed);
  } catch {
    return initialState;
  }
}

export function saveToStorage(state: AppData) {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(KEY, json);
  } catch {
    // ignore
  }
}


import type { AppData, Scenario, Task } from './types';
import type { Action } from './actions';
import { AppDataSchema, TaskSchema } from './schema';
import { ALL_QUARTERS } from './quarters';

export const DEFAULT_SCENARIO_NAME = 'Main Timeline';

export const initialState: AppData = {
  scenarios: [
    {
      name: DEFAULT_SCENARIO_NAME,
      tasks: [],
    },
  ],
  activeScenario: DEFAULT_SCENARIO_NAME,
  swimlanes: [],
};

function assertTrimmed(name: string, label: string) {
  if (name.trim() !== name || name.length === 0) {
    throw new Error(`${label} must be non-empty and have no leading/trailing whitespace`);
  }
}

function requireScenario(state: AppData, name: string): Scenario {
  const s = state.scenarios.find((x) => x.name === name);
  if (!s) throw new Error(`Scenario not found: ${name}`);
  return s;
}

function validateTaskAgainstState(task: Task, state: AppData) {
  // Base schema validation (progress bounds, quarter order, color, etc.)
  TaskSchema.parse(task);
  // Ensure swimlane exists
  if (!state.swimlanes.includes(task.swimlane)) {
    throw new Error(`Task references unknown swimlane: ${task.swimlane}`);
  }
  // Ensure quarters are in supported range (already enforced by schema through enum)
  if (!ALL_QUARTERS.includes(task.startQuarter as any) || !ALL_QUARTERS.includes(task.endQuarter as any)) {
    throw new Error('Task quarter out of supported range');
  }
}

export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'ADD_TEAM': {
      const name = action.name;
      assertTrimmed(name, 'Team name');
      if (state.swimlanes.includes(name)) throw new Error('Duplicate team name');
      return { ...state, swimlanes: [...state.swimlanes, name] };
    }
    case 'ADD_SCENARIO': {
      const name = action.name;
      assertTrimmed(name, 'Scenario name');
      if (state.scenarios.some((s) => s.name === name)) throw new Error('Duplicate scenario name');
      const scenarios = [...state.scenarios, { name, tasks: [] }];
      return { ...state, scenarios };
    }
    case 'SET_ACTIVE_SCENARIO': {
      const name = action.name;
      if (!state.scenarios.some((s) => s.name === name)) throw new Error('Unknown scenario');
      return { ...state, activeScenario: name };
    }
    case 'ADD_TASK': {
      const task = action.task;
      assertTrimmed(task.name, 'Task name');
      assertTrimmed(task.swimlane, 'Swimlane');
      validateTaskAgainstState(task, state);

      const scenario = requireScenario(state, state.activeScenario);
      if (scenario.tasks.some((t) => t.name === task.name && t.swimlane === task.swimlane)) {
        throw new Error('Duplicate task name in same team for this scenario');
      }

      const scenarios = state.scenarios.map((s) =>
        s.name === scenario.name ? { ...s, tasks: [...s.tasks, task] } : s
      );
      return { ...state, scenarios };
    }
    case 'UPDATE_TASK': {
      const scenario = requireScenario(state, state.activeScenario);
      const idx = scenario.tasks.findIndex((t) => t.name === action.originalName && t.swimlane === action.originalSwimlane);
      if (idx === -1) throw new Error(`Task not found: ${action.originalName}`);

      const current = scenario.tasks[idx];
      const next: Task = { ...current, ...action.updates } as Task;
      assertTrimmed(next.name, 'Task name');
      assertTrimmed(next.swimlane, 'Swimlane');
      validateTaskAgainstState(next, state);

      // If name or swimlane changed, ensure no duplicate pair exists
      if ((next.name !== action.originalName || next.swimlane !== action.originalSwimlane) &&
          scenario.tasks.some((t, i) => i !== idx && t.name === next.name && t.swimlane === next.swimlane)) {
        throw new Error('Duplicate task name in same team for this scenario');
      }

      const nextTasks = scenario.tasks.slice();
      nextTasks[idx] = next;

      const scenarios = state.scenarios.map((s) => (s.name === scenario.name ? { ...s, tasks: nextTasks } : s));
      return { ...state, scenarios };
    }
    case 'DELETE_TASK': {
      const scenario = requireScenario(state, state.activeScenario);
      const nextTasks = scenario.tasks.filter((t) => !(t.name === action.name && t.swimlane === action.swimlane));
      const scenarios = state.scenarios.map((s) => (s.name === scenario.name ? { ...s, tasks: nextTasks } : s));
      return { ...state, scenarios };
    }
    case 'IMPORT_DATA': {
      const parsed = AppDataSchema.parse(action.payload);
      return parsed;
    }
    default:
      return state;
  }
}

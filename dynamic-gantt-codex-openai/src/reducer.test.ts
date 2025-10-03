import { describe, it, expect } from 'vitest';
import { reducer, initialState } from './state/reducer';
import { addTeam, addScenario, setActiveScenario, addTask, updateTask, deleteTask } from './state/actions';
import type { QuarterId } from './state/quarters';

describe('reducer', () => {
  it('initializes with default scenario and no teams', () => {
    expect(initialState.scenarios.length).toBe(1);
    expect(initialState.swimlanes.length).toBe(0);
  });

  it('adds a team and prevents duplicates', () => {
    let state = reducer(initialState, addTeam('Pet Fish'));
    expect(state.swimlanes).toContain('Pet Fish');
    expect(() => reducer(state, addTeam('Pet Fish'))).toThrow(/Duplicate team/);
  });

  it('adds scenarios and switches active', () => {
    let state = initialState;
    state = reducer(state, addScenario('Aggressive'));
    expect(state.scenarios.some((s) => s.name === 'Aggressive')).toBe(true);
    state = reducer(state, setActiveScenario('Aggressive'));
    expect(state.activeScenario).toBe('Aggressive');
  });

  it('adds/updates/deletes a task with constraints', () => {
    let state = reducer(initialState, addTeam('Infrastructure'));
    state = reducer(state, addTask({
      name: 'Signature Capture',
      swimlane: 'Infrastructure',
      startQuarter: 'Q2 2025' as QuarterId,
      endQuarter: 'Q4 2025' as QuarterId,
      progress: 10,
      color: 'blue',
    }));

    // Adding duplicate name in same scenario and same team should fail
    expect(() => reducer(state, addTask({
      name: 'Signature Capture',
      swimlane: 'Infrastructure',
      startQuarter: 'Q3 2025' as QuarterId,
      endQuarter: 'Q4 2025' as QuarterId,
      progress: 20,
      color: 'indigo',
    }))).toThrow(/Duplicate task/);

    // Update name to non-conflicting value
    state = reducer(state, updateTask('Signature Capture', 'Infrastructure', { name: 'SigCap' }));
    const tasks = state.scenarios[0].tasks;
    expect(tasks[0].name).toBe('SigCap');

    // Update to conflicting name should fail
    state = reducer(state, addTask({
      name: 'Other',
      swimlane: 'Infrastructure',
      startQuarter: 'Q2 2025' as QuarterId,
      endQuarter: 'Q3 2025' as QuarterId,
      progress: 0,
      color: 'blue',
    }));
    expect(() => reducer(state, updateTask('Other', 'Infrastructure', { name: 'SigCap' }))).toThrow(/Duplicate task/);

    // Delete
    state = reducer(state, deleteTask('Other', 'Infrastructure'));
    expect(state.scenarios[0].tasks.map((t) => t.name)).not.toContain('Other');
  });

  it('rejects task with unknown swimlane', () => {
    expect(() => reducer(initialState, addTask({
      name: 'X',
      swimlane: 'Unknown',
      startQuarter: 'Q1 2025' as QuarterId,
      endQuarter: 'Q1 2025' as QuarterId,
      progress: 0,
      color: 'blue',
    }))).toThrow(/unknown swimlane/i);
  });
});

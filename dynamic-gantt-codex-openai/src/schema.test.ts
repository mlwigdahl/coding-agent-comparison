import { describe, it, expect } from 'vitest';
import { AppDataSchema } from './state/schema';

const validExample = {
  scenarios: [
    {
      name: 'Main Timeline',
      tasks: [
        {
          name: 'Onboarding Flow',
          swimlane: 'Pet Fish',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q3 2025',
          progress: 90,
          color: 'blue',
        },
        {
          name: 'Dispense -- Basic',
          swimlane: 'Pet Fish',
          startQuarter: 'Q3 2025',
          endQuarter: 'Q4 2025',
          progress: 0,
          color: 'indigo',
        },
        {
          name: 'Signature Capture',
          swimlane: 'Infrastructure',
          startQuarter: 'Q2 2025',
          endQuarter: 'Q4 2025',
          progress: 0,
          color: 'blue',
        },
      ],
    },
    {
      name: 'Aggressive Timeline',
      tasks: [
        {
          name: 'Onboarding Flow',
          swimlane: 'Pet Fish',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 100,
          color: 'blue',
        },
        {
          name: 'Signature Capture',
          swimlane: 'Infrastructure',
          startQuarter: 'Q2 2025',
          endQuarter: 'Q4 2025',
          progress: 0,
          color: 'blue',
        },
      ],
    },
  ],
  activeScenario: 'Main Timeline',
  swimlanes: ['Pet Fish', 'Infrastructure'],
  exportDate: '2025-08-26T17:25:25.117Z',
};

describe('AppDataSchema', () => {
  it('accepts the SPEC example payload', () => {
    const parsed = AppDataSchema.parse(validExample);
    expect(parsed.scenarios.length).toBe(2);
  });

  it('rejects duplicate tasks within the same team in a scenario', () => {
    const bad = {
      ...validExample,
      scenarios: [
        {
          name: 'S1',
          tasks: [
            {
              name: 'A',
              swimlane: 'Pet Fish',
              startQuarter: 'Q1 2025',
              endQuarter: 'Q2 2025',
              progress: 10,
              color: 'blue',
            },
            {
              name: 'A',
              swimlane: 'Pet Fish',
              startQuarter: 'Q2 2025',
              endQuarter: 'Q3 2025',
              progress: 20,
              color: 'indigo',
            },
          ],
        },
      ],
      activeScenario: 'S1',
    } as const;
    expect(() => AppDataSchema.parse(bad)).toThrow(/Duplicate task/);
  });

  it('rejects endQuarter before startQuarter', () => {
    const bad = JSON.parse(JSON.stringify(validExample));
    bad.scenarios[0].tasks[0].startQuarter = 'Q3 2025';
    bad.scenarios[0].tasks[0].endQuarter = 'Q1 2025';
    expect(() => AppDataSchema.parse(bad)).toThrow(/endQuarter must be/);
  });

  it('rejects progress outside 0..100', () => {
    const bad = JSON.parse(JSON.stringify(validExample));
    bad.scenarios[0].tasks[0].progress = 101;
    expect(() => AppDataSchema.parse(bad)).toThrow();
  });

  it('rejects unknown swimlane', () => {
    const bad = JSON.parse(JSON.stringify(validExample));
    bad.scenarios[0].tasks[0].swimlane = 'Unknown';
    expect(() => AppDataSchema.parse(bad)).toThrow(/unknown swimlane/);
  });

  it('rejects duplicate scenario names', () => {
    const bad = JSON.parse(JSON.stringify(validExample));
    bad.scenarios[1].name = bad.scenarios[0].name;
    expect(() => AppDataSchema.parse(bad)).toThrow(/Duplicate scenario names/);
  });

  it('rejects duplicate swimlane names', () => {
    const bad = JSON.parse(JSON.stringify(validExample));
    bad.swimlanes = ['A', 'A'];
    expect(() => AppDataSchema.parse(bad)).toThrow(/Duplicate swimlane names/);
  });

  it('rejects activeScenario not present', () => {
    const bad = JSON.parse(JSON.stringify(validExample));
    bad.activeScenario = 'Missing';
    expect(() => AppDataSchema.parse(bad)).toThrow(/activeScenario/);
  });

  it('rejects leading/trailing whitespace in names', () => {
    const bad = JSON.parse(JSON.stringify(validExample));
    bad.scenarios[0].name = ' Main Timeline ';
    expect(() => AppDataSchema.parse(bad)).toThrow(/whitespace/);
  });
});

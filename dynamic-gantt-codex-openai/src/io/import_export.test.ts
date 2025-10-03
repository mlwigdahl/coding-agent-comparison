import { describe, it, expect } from 'vitest';
import { buildExportPayload } from './export';
import { parseAppDataJson } from './import';

const example = {
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
      ],
    },
  ],
  activeScenario: 'Main Timeline',
  swimlanes: ['Pet Fish'],
};

describe('import/export helpers', () => {
  it('builds a valid export payload', () => {
    const payload = buildExportPayload(example as any);
    expect(payload.exportDate).toBeTruthy();
    expect(payload.scenarios[0].name).toBe('Main Timeline');
  });

  it('parses valid JSON and rejects invalid', () => {
    const json = JSON.stringify({ ...example, exportDate: '2025-08-26T17:25:25.117Z' });
    const parsed = parseAppDataJson(json);
    expect(parsed.activeScenario).toBe('Main Timeline');

    const bad = JSON.stringify({ ...example, activeScenario: 'Missing' });
    expect(() => parseAppDataJson(bad)).toThrow();
  });
});


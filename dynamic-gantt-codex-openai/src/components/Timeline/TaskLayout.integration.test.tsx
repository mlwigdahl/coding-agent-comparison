import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '../../state/context';
import Swimlanes from './Swimlanes';
import type { AppData } from '../../state/types';

const KEY = 'dynamic-gantt-app-data';

function preload(state: AppData) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

describe('Task layout in swimlanes', () => {
  beforeEach(() => localStorage.clear());

  it('positions overlapping tasks on different vertical rows', () => {
    preload({
      swimlanes: ['Team'],
      activeScenario: 'Main',
      scenarios: [
        {
          name: 'Main',
          tasks: [
            {
              name: 'A',
              swimlane: 'Team',
              startQuarter: 'Q1 2025',
              endQuarter: 'Q2 2025',
              progress: 0,
              color: 'blue',
            },
            {
              name: 'B',
              swimlane: 'Team',
              startQuarter: 'Q2 2025',
              endQuarter: 'Q3 2025',
              progress: 0,
              color: 'indigo',
            },
          ],
        },
      ],
    });

    render(
      <AppProvider>
        <Swimlanes />
      </AppProvider>
    );

    const a = screen.getByTestId('task-A');
    const b = screen.getByTestId('task-B');
    expect(a).toBeInTheDocument();
    expect(b).toBeInTheDocument();
    // Different vertical offsets (top) imply different rows
    expect((a as HTMLElement).style.top).not.toBe((b as HTMLElement).style.top);
  });
});

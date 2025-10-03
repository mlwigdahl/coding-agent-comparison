import React from 'react';
import { render, screen } from '@testing-library/react';
import Swimlanes from './Swimlanes';
import { AppProvider } from '../../state/context';
import type { AppData } from '../../state/types';

const STORAGE_KEY = 'dynamic-gantt-app-data';

function preload(state: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe('Swimlanes', () => {
  beforeEach(() => localStorage.clear());

  it('shows empty hint when no teams', () => {
    preload({ scenarios: [{ name: 'Main', tasks: [] }], activeScenario: 'Main', swimlanes: [] });
    render(
      <AppProvider>
        <Swimlanes />
      </AppProvider>
    );
    expect(screen.getByText(/No teams yet/i)).toBeInTheDocument();
  });

  it('renders swimlanes with counts based on active scenario', () => {
    preload({
      scenarios: [
        {
          name: 'Main',
          tasks: [
            {
              name: 'A',
              swimlane: 'Team A',
              startQuarter: 'Q1 2025',
              endQuarter: 'Q2 2025',
              progress: 10,
              color: 'blue',
            },
            {
              name: 'B',
              swimlane: 'Team A',
              startQuarter: 'Q2 2025',
              endQuarter: 'Q3 2025',
              progress: 0,
              color: 'indigo',
            },
            {
              name: 'C',
              swimlane: 'Team B',
              startQuarter: 'Q3 2025',
              endQuarter: 'Q4 2025',
              progress: 0,
              color: 'blue',
            },
          ],
        },
        { name: 'Other', tasks: [] },
      ],
      activeScenario: 'Main',
      swimlanes: ['Team A', 'Team B'],
    });

    render(
      <AppProvider>
        <Swimlanes />
      </AppProvider>
    );

    expect(screen.getByTestId('swimlane-Team A')).toBeInTheDocument();
    expect(screen.getByText('Team A (2)')).toBeInTheDocument();
    expect(screen.getByText('Team B (1)')).toBeInTheDocument();
  });
});


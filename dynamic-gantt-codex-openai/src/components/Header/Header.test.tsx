import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { AppProvider } from '../../state/context';
import type { AppData } from '../../state/types';

const STORAGE_KEY = 'dynamic-gantt-app-data';

function preloadState(state: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders title, scenario select, and buttons', () => {
    preloadState({
      scenarios: [
        { name: 'Main Timeline', tasks: [] },
        { name: 'Aggressive', tasks: [] },
      ],
      activeScenario: 'Main Timeline',
      swimlanes: ['Team A', 'Team B'],
    });
    render(
      <AppProvider>
        <Header />
      </AppProvider>
    );
    expect(screen.getByText('Dynamic Project Timeline - Quarterly View')).toBeInTheDocument();
    const select = screen.getByTestId('scenario-select') as HTMLSelectElement;
    expect(select.value).toBe('Main Timeline');
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
    expect(screen.getByTestId('add-team')).toBeInTheDocument();
    expect(screen.getByTestId('add-task')).toBeInTheDocument();
  });

  it('switches active scenario when selection changes', () => {
    preloadState({
      scenarios: [
        { name: 'Main Timeline', tasks: [] },
        { name: 'Aggressive', tasks: [] },
      ],
      activeScenario: 'Main Timeline',
      swimlanes: [],
    });
    render(
      <AppProvider>
        <Header />
      </AppProvider>
    );
    const select = screen.getByTestId('scenario-select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'Aggressive' } });
    expect(select.value).toBe('Aggressive');
  });
});


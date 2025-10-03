import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../state/context';
import { ModalProvider, useModal } from './ModalContext';
import ScenarioModal from './ScenarioModal';

const KEY = 'dynamic-gantt-app-data';

function preload(state: any) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function OpenButton() {
  const { openScenarioCreate } = useModal();
  return (
    <button onClick={() => openScenarioCreate()} data-testid="open-scenario-create">
      open
    </button>
  );
}

describe('ScenarioModal', () => {
  beforeEach(() => localStorage.clear());

  it('creates a new timeline', () => {
    preload({ scenarios: [{ name: 'Main', tasks: [] }], activeScenario: 'Main', swimlanes: [] });
    render(
      <AppProvider>
        <ModalProvider>
          <OpenButton />
          <ScenarioModal />
        </ModalProvider>
      </AppProvider>
    );

    fireEvent.click(screen.getByTestId('open-scenario-create'));
    fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: 'Aggressive' } });
    fireEvent.click(screen.getByText('Save Timeline'));

    const state = JSON.parse(localStorage.getItem(KEY) || '{}');
    expect(state.scenarios.some((s: any) => s.name === 'Aggressive')).toBe(true);
  });
});


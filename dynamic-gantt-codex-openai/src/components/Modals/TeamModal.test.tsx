import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../state/context';
import { ModalProvider, useModal } from './ModalContext';
import TeamModal from './TeamModal';

const KEY = 'dynamic-gantt-app-data';

function preload(state: any) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function OpenButton() {
  const { openTeamCreate } = useModal();
  return (
    <button onClick={() => openTeamCreate()} data-testid="open-team-create">
      open
    </button>
  );
}

describe('TeamModal', () => {
  beforeEach(() => localStorage.clear());

  it('creates a new team', () => {
    preload({ scenarios: [{ name: 'Main', tasks: [] }], activeScenario: 'Main', swimlanes: [] });
    render(
      <AppProvider>
        <ModalProvider>
          <OpenButton />
          <TeamModal />
        </ModalProvider>
      </AppProvider>
    );

    fireEvent.click(screen.getByTestId('open-team-create'));
    fireEvent.change(screen.getByLabelText('Team Name'), { target: { value: 'New Team' } });
    fireEvent.click(screen.getByText('Save Team'));

    const state = JSON.parse(localStorage.getItem(KEY) || '{}');
    expect(state.swimlanes).toContain('New Team');
  });
});


import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../state/context';
import { ModalProvider, useModal } from './ModalContext';
import TaskModal from './TaskModal';
import type { AppData } from '../../state/types';

const KEY = 'dynamic-gantt-app-data';

function preload(state: AppData) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function CreateOpener() {
  const { openTaskCreate } = useModal();
  return (
    <button onClick={() => openTaskCreate()} data-testid="open-create">
      open
    </button>
  );
}

function EditOpener({ name, swimlane }: { name: string; swimlane: string }) {
  const { openTaskEdit } = useModal();
  return (
    <button onClick={() => openTaskEdit(name, swimlane)} data-testid="open-edit">
      open
    </button>
  );
}

describe('TaskModal', () => {
  beforeEach(() => localStorage.clear());

  it('creates a task with required fields', () => {
    preload({ scenarios: [{ name: 'Main', tasks: [] }], activeScenario: 'Main', swimlanes: ['Team'] });
    render(
      <AppProvider>
        <ModalProvider>
          <CreateOpener />
          <TaskModal />
        </ModalProvider>
      </AppProvider>
    );
    fireEvent.click(screen.getByTestId('open-create'));
    // Fill form
    fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText('Team'), { target: { value: 'Team' } });
    fireEvent.change(screen.getByLabelText('Start Quarter'), { target: { value: 'Q1 2025' } });
    fireEvent.change(screen.getByLabelText('End Quarter'), { target: { value: 'Q2 2025' } });
    fireEvent.change(screen.getByLabelText('Progress (%)'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Color Theme'), { target: { value: 'blue' } });
    fireEvent.click(screen.getByText('Create Task'));
    // Close modal and ensure in localStorage
    const state = JSON.parse(localStorage.getItem(KEY) || '{}');
    expect(state.scenarios[0].tasks.some((t: any) => t.name === 'New Task')).toBe(true);
  });

  it('edits and deletes a task', () => {
    preload({
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
          ],
        },
      ],
      activeScenario: 'Main',
      swimlanes: ['Team'],
    });

    render(
      <AppProvider>
        <ModalProvider>
          <EditOpener name="A" swimlane="Team" />
          <TaskModal />
        </ModalProvider>
      </AppProvider>
    );

    fireEvent.click(screen.getByTestId('open-edit'));
    fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'A2' } });
    fireEvent.click(screen.getByText('Update Task'));
    let state = JSON.parse(localStorage.getItem(KEY) || '{}');
    expect(state.scenarios[0].tasks[0].name).toBe('A2');

    // Delete
    fireEvent.click(screen.getByTestId('open-edit'));
    fireEvent.click(screen.getByText('Delete'));
    state = JSON.parse(localStorage.getItem(KEY) || '{}');
    expect(state.scenarios[0].tasks.length).toBe(0);
  });
});

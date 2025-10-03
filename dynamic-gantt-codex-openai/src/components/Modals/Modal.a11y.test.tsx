import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../state/context';
import { ModalProvider, useModal } from './ModalContext';
import TaskModal from './TaskModal';

function Open() {
  const { openTaskCreate } = useModal();
  return (
    <button onClick={() => openTaskCreate()} data-testid="open">open</button>
  );
}

describe('Modal accessibility', () => {
  it('closes on Escape and traps focus', () => {
    localStorage.clear();
    localStorage.setItem('dynamic-gantt-app-data', JSON.stringify({ scenarios: [{ name: 'Main', tasks: [] }], activeScenario: 'Main', swimlanes: ['Team'] }));

    render(
      <AppProvider>
        <ModalProvider>
          <Open />
          <TaskModal />
        </ModalProvider>
      </AppProvider>
    );

    fireEvent.click(screen.getByTestId('open'));
    const nameInput = screen.getByLabelText('Task Name') as HTMLInputElement;
    expect(nameInput).toHaveFocus();

    // Press Tab and ensure focus moves within modal
    fireEvent.keyDown(nameInput, { key: 'Tab' });
    expect(screen.getByLabelText('Team')).toHaveFocus();

    // Escape closes
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
  });
});


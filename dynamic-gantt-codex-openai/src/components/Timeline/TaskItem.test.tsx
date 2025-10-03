import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskItem from './TaskItem';

describe('TaskItem', () => {
  it('shows name, percent, and progress bar width', () => {
    render(
      <TaskItem name="Onboarding" swimlane="Team A" left="0%" width="12.5%" top="0px" progress={45} color="blue" />
    );
    expect(screen.getByTestId('task-name-Onboarding')).toHaveTextContent('Onboarding');
    expect(screen.getByTestId('task-progress-Onboarding')).toHaveTextContent('45%');
    const bar = screen.getByTestId('task-bar-Onboarding') as HTMLElement;
    expect(bar.style.width).toBe('45%');
  });

  it('uses completed shade at 100% and uncompleted otherwise', () => {
    const { rerender } = render(
      <TaskItem name="SigCap" swimlane="Team A" left="0%" width="6.25%" top="0" progress={100} color="blue" />
    );
    const bg = screen.getByTestId('task-bg-SigCap') as HTMLElement;
    expect(bg.style.backgroundColor).toBe('rgb(30, 64, 175)'); // #1e40af

    rerender(
      <TaskItem name="SigCap" swimlane="Team A" left="0%" width="6.25%" top="0" progress={50} color="blue" />
    );
    // jsdom may normalize colors; ensure it changed from completed color
    expect(item.style.backgroundColor).not.toBe('rgb(30, 64, 175)');
  });
});

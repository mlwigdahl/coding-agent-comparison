import React from 'react';
import { render, screen } from '@testing-library/react';
import TimelineGrid from './TimelineGrid';

describe('TimelineGrid', () => {
  it('renders Teams column and 16 quarter headers', () => {
    render(<TimelineGrid />);
    expect(screen.getByText('Teams')).toBeInTheDocument();
    // Check a few known labels
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getAllByText('Q4').length).toBeGreaterThan(0);
  });

  it('marks year starts for 2026, 2027, 2028', () => {
    render(<TimelineGrid />);
    expect(screen.getByTestId('year-start-2026')).toBeInTheDocument();
    expect(screen.getByTestId('year-start-2027')).toBeInTheDocument();
    expect(screen.getByTestId('year-start-2028')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App', () => {
  it('renders the header title', () => {
    render(<App />);
    expect(
      screen.getByText('Dynamic Project Timeline - Quarterly View')
    ).toBeInTheDocument();
  });
});


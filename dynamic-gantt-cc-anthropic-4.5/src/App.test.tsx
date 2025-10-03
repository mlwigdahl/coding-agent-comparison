import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the title', () => {
    render(<App />)
    expect(
      screen.getByText(/Dynamic Project Timeline - Quarterly View/i)
    ).toBeInTheDocument()
  })

  it('renders the Timeline component', () => {
    render(<App />)
    expect(
      screen.getByText(/No teams configured. Click "\+ Add Team" to get started./i)
    ).toBeInTheDocument()
  })
})

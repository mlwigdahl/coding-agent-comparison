import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import Header from './Header'
import AppStateContext, {
  createInitialState,
  type AppStateContextValue,
} from '@/context/AppStateContext'

const renderHeader = (contextOverrides: Partial<AppStateContextValue> = {}) => {
  const state = createInitialState()
  const contextValue: AppStateContextValue = {
    state,
    addTimeline: vi.fn(),
    updateTimeline: vi.fn(),
    deleteTimeline: vi.fn(),
    setActiveTimeline: vi.fn(),
    addTeam: vi.fn(),
    updateTeam: vi.fn(),
    deleteTeam: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    replaceState: vi.fn(),
    resetState: vi.fn(),
    ...contextOverrides,
  }

  const handlers = {
    onAddTimeline: vi.fn(),
    onAddTeam: vi.fn(),
    onAddTask: vi.fn(),
    onImport: vi.fn(),
    onExport: vi.fn(),
  }

  render(
    <AppStateContext.Provider value={contextValue}>
      <Header {...handlers} />
    </AppStateContext.Provider>,
  )

  return {
    contextValue,
    handlers,
    state,
  }
}

describe('Header', () => {
  it('renders timelines in the dropdown and updates active timeline on change', () => {
    const { contextValue, state } = renderHeader()
    const select = screen.getByLabelText(/timeline/i) as HTMLSelectElement

    const [, secondId] = state.order.timelineIds
    expect(select.value).toBe(state.activeTimelineId)

    fireEvent.change(select, { target: { value: secondId } })

    expect(contextValue.setActiveTimeline).toHaveBeenCalledWith(secondId)
  })

  it('invokes callbacks when header actions are triggered', () => {
    const { handlers } = renderHeader()

    fireEvent.click(screen.getByRole('button', { name: /export/i }))
    fireEvent.click(screen.getByRole('button', { name: /import/i }))
    fireEvent.click(screen.getByRole('button', { name: /add timeline/i }))
    fireEvent.click(screen.getByRole('button', { name: /add team/i }))
    fireEvent.click(screen.getByRole('button', { name: /add task/i }))

    expect(handlers.onExport).toHaveBeenCalled()
    expect(handlers.onImport).toHaveBeenCalled()
    expect(handlers.onAddTimeline).toHaveBeenCalled()
    expect(handlers.onAddTeam).toHaveBeenCalled()
    expect(handlers.onAddTask).toHaveBeenCalled()
  })
})

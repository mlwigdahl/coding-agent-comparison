import { render, screen, within } from '@testing-library/react'

import TimelineGrid from './TimelineGrid'
import { AppStateProvider, createInitialState } from '@/context/AppStateContext'
import AppStateContext from '@/context/AppStateContext'

const noop = () => {}

const renderWithState = (state = createInitialState()) => {
  return render(
    <AppStateContext.Provider
      value={{
        state,
        addTimeline: noop,
        updateTimeline: noop,
        deleteTimeline: noop,
        setActiveTimeline: noop,
        addTeam: noop,
        updateTeam: noop,
        deleteTeam: noop,
        addTask: noop,
        updateTask: noop,
        deleteTask: noop,
        replaceState: noop,
        resetState: noop,
      }}
    >
      <TimelineGrid />
    </AppStateContext.Provider>,
  )
}

describe('TimelineGrid', () => {
  it('renders quarter headers for the default timeline range', () => {
    render(
      <AppStateProvider>
        <TimelineGrid />
      </AppStateProvider>,
    )

    expect(screen.getAllByText(/^Q[1-4]$/i)).toHaveLength(16)
    expect(screen.getAllByText('2025')).toHaveLength(4)
    expect(screen.getAllByText('2028')).toHaveLength(4)
  })

  it('renders team names and task counts', () => {
    const state = createInitialState()
    renderWithState(state)

    const activeTimeline = state.timelines[state.activeTimelineId]

    state.order.teamIds.forEach((teamId) => {
      const team = state.teams[teamId]
      if (!team) return

      const tasksForTeamInActiveTimeline = (activeTimeline?.taskIds ?? []).filter(
        (taskId) => state.tasks[taskId]?.teamId === teamId,
      )

      const heading = screen.getByRole('heading', { name: new RegExp(`^${team.name}`) })
      expect(heading).toBeInTheDocument()
      const countText = within(heading).getByText(`(${tasksForTeamInActiveTimeline.length})`)
      expect(countText).toBeInTheDocument()
    })

    expect(screen.getByText('Onboarding Flow')).toBeInTheDocument()
    expect(screen.getByText('Dispense Basic')).toBeInTheDocument()
    expect(screen.getByText('Signature Capture')).toBeInTheDocument()
  })
})

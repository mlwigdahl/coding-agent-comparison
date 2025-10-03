import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import TeamModal from './TeamModal'
import AppStateContext, {
  createInitialState,
  type AppStateContextValue,
} from '@/context/AppStateContext'
import { ValidationError } from '@/utils/validation'

const noop = () => {}

const renderModal = (
  props: Parameters<typeof TeamModal>[0],
  overrides: Partial<AppStateContextValue> = {},
) => {
  const contextValue: AppStateContextValue = {
    state: createInitialState(),
    addTimeline: noop,
    updateTimeline: noop,
    deleteTimeline: noop,
    setActiveTimeline: noop,
    addTeam: vi.fn(),
    updateTeam: noop,
    deleteTeam: noop,
    addTask: noop,
    updateTask: noop,
    deleteTask: noop,
    replaceState: noop,
    resetState: noop,
    ...overrides,
  }

  const user = userEvent.setup()

  render(
    <AppStateContext.Provider value={contextValue}>
      <TeamModal {...props} />
    </AppStateContext.Provider>,
  )

  return { contextValue, user }
}

describe('TeamModal', () => {
  it('creates a team when saved', async () => {
    const onClose = vi.fn()
    const { contextValue, user } = renderModal({ isOpen: true, onClose })

    await user.type(screen.getByLabelText(/team name/i), ' Growth ')
    await user.click(screen.getByRole('button', { name: /save team/i }))

    expect(contextValue.addTeam).toHaveBeenCalledWith(' Growth ')
    expect(onClose).toHaveBeenCalled()
  })

  it('shows error message when addTeam throws validation error', async () => {
    const addTeam = vi.fn(() => {
      throw new ValidationError('Team name must be unique', 'name')
    })
    const onClose = vi.fn()
    const { user } = renderModal(
      { isOpen: true, onClose },
      { addTeam },
    )

    await user.type(screen.getByLabelText(/team name/i), 'Pet Fish')
    await user.click(screen.getByRole('button', { name: /save team/i }))

    expect(await screen.findByText(/must be unique/i)).toBeInTheDocument()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when cancel is pressed', async () => {
    const onClose = vi.fn()
    const { user } = renderModal({ isOpen: true, onClose })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalled()
  })
})

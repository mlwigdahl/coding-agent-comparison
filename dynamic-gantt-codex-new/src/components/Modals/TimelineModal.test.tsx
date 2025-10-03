import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import TimelineModal from './TimelineModal'
import AppStateContext, {
  createInitialState,
  type AppStateContextValue,
} from '@/context/AppStateContext'
import { ValidationError } from '@/utils/validation'

const noop = () => {}

const renderModal = (
  props: Parameters<typeof TimelineModal>[0],
  overrides: Partial<AppStateContextValue> = {},
) => {
  const contextValue: AppStateContextValue = {
    state: createInitialState(),
    addTimeline: vi.fn(),
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
    ...overrides,
  }

  const user = userEvent.setup()

  render(
    <AppStateContext.Provider value={contextValue}>
      <TimelineModal {...props} />
    </AppStateContext.Provider>,
  )

  return { contextValue, user }
}

describe('TimelineModal', () => {
  it('creates a timeline when saved', async () => {
    const onClose = vi.fn()
    const { contextValue, user } = renderModal({ isOpen: true, onClose })

    await user.type(screen.getByLabelText(/timeline name/i), ' Strategic Bet ')
    await user.click(screen.getByRole('button', { name: /save timeline/i }))

    expect(contextValue.addTimeline).toHaveBeenCalledWith(' Strategic Bet ')
    expect(onClose).toHaveBeenCalled()
  })

  it('displays validation errors from addTimeline', async () => {
    const addTimeline = vi.fn(() => {
      throw new ValidationError('Timeline name must be unique', 'name')
    })
    const onClose = vi.fn()
    const { user } = renderModal(
      { isOpen: true, onClose },
      { addTimeline },
    )

    await user.type(screen.getByLabelText(/timeline name/i), 'Main Timeline')
    await user.click(screen.getByRole('button', { name: /save timeline/i }))

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

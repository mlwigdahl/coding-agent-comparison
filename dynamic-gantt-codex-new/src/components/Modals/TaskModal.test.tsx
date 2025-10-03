import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, type Mock } from 'vitest'

import TaskModal from './TaskModal'
import AppStateContext, {
  createInitialState,
  type AppStateContextValue,
} from '@/context/AppStateContext'

const noop = () => {}

const setup = (
  props: Parameters<typeof TaskModal>[0],
  overrides: Partial<AppStateContextValue> = {},
) => {
  const baseState = createInitialState()

  const contextValue: AppStateContextValue = {
    state: baseState,
    addTimeline: noop,
    updateTimeline: noop,
    deleteTimeline: noop,
    setActiveTimeline: noop,
    addTeam: vi.fn(),
    updateTeam: noop,
    deleteTeam: noop,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    replaceState: noop,
    resetState: noop,
    ...overrides,
  }

  render(
    <AppStateContext.Provider value={contextValue}>
      <TaskModal {...props} />
    </AppStateContext.Provider>,
  )

  const user = userEvent.setup()

  return { contextValue, user }
}

describe('TaskModal', () => {
  it('creates a new task with the provided details', async () => {
    const onClose = vi.fn()
    const { contextValue, user } = setup(
      {
        isOpen: true,
        mode: 'add',
        onClose,
      },
      {},
    )

    const nameInput = screen.getByLabelText(/task name/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Marketing Launch')

    const teamSelect = screen.getByLabelText(/team/i)
    const { state } = contextValue
    const secondTeamId = state.order.teamIds[1]
    await user.selectOptions(teamSelect, secondTeamId)

    await user.selectOptions(screen.getByLabelText(/start quarter/i), 'Q2 2025')
    await user.selectOptions(screen.getByLabelText(/end quarter/i), 'Q3 2025')

    const progressInput = screen.getByLabelText(/progress/i)
    await user.clear(progressInput)
    await user.type(progressInput, '75')

    await user.selectOptions(screen.getByLabelText(/color theme/i), 'indigo')

    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(contextValue.addTask).toHaveBeenCalledTimes(1)
    const payload = (contextValue.addTask as Mock).mock.calls[0][0]

    expect(payload).toMatchObject({
      timelineId: state.activeTimelineId,
      teamId: secondTeamId,
      name: 'Marketing Launch',
      progress: 75,
      color: 'indigo',
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('prefills existing task data and updates on save', async () => {
    const state = createInitialState()
    const taskId = state.order.teamIds
      .map((teamId) => state.teams[teamId]?.taskIds ?? [])
      .flat()[0]
    const onClose = vi.fn()

    const updateTask = vi.fn()

    const { user } = setup(
      {
        isOpen: true,
        mode: 'edit',
        taskId,
        onClose,
      },
      {
        state,
        updateTask,
      },
    )

    const nameInput = screen.getByLabelText(/task name/i)
    expect(nameInput).toHaveValue(state.tasks[taskId].name)

    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Task Name')

    const progressInput = screen.getByLabelText(/progress/i)
    await user.clear(progressInput)
    await user.type(progressInput, '80')

    await user.click(screen.getByRole('button', { name: /update task/i }))

    expect(updateTask).toHaveBeenCalled()
    const payload = updateTask.mock.calls[0][0]
    expect(payload).toMatchObject({
      id: taskId,
      name: 'Updated Task Name',
      progress: 80,
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('deletes the task when delete is pressed', async () => {
    const state = createInitialState()
    const taskId = Object.keys(state.tasks)[0]
    const deleteTask = vi.fn()
    const onClose = vi.fn()

    const { user } = setup(
      {
        isOpen: true,
        mode: 'edit',
        taskId,
        onClose,
      },
      {
        state,
        deleteTask,
      },
    )

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(deleteTask).toHaveBeenCalledWith(taskId)
    expect(onClose).toHaveBeenCalled()
  })

  it('traps focus within the dialog when tabbing', async () => {
    const onClose = vi.fn()
    const { user } = setup({ isOpen: true, mode: 'add', onClose })

    const dialog = screen.getByRole('dialog', { name: /add task/i })
    const nameInput = screen.getByLabelText(/task name/i)
    expect(nameInput).toHaveFocus()

    await user.tab({ shift: true })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)

    await user.tab()
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
  })
})

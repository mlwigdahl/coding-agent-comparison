import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskModal } from './TaskModal'
import { DataProvider } from '../../contexts/DataContext'
import type { AppData, Task } from '../../types'
import { STORAGE_KEY } from '../../constants'

// Helper to render TaskModal with custom data
function renderTaskModal(
  props: {
    isOpen: boolean
    onClose: () => void
    task?: Task
    scenarioName: string
  },
  data?: AppData
) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  return render(
    <DataProvider>
      <TaskModal {...props} />
    </DataProvider>
  )
}

describe('TaskModal', () => {
  const mockOnClose = vi.fn()

  const defaultData: AppData = {
    scenarios: [
      {
        name: 'Main Timeline',
        tasks: [
          {
            name: 'Existing Task',
            swimlane: 'Engineering',
            startQuarter: 'Q1 2025',
            endQuarter: 'Q2 2025',
            progress: 50,
            color: 'blue',
          },
        ],
      },
    ],
    activeScenario: 'Main Timeline',
    swimlanes: ['Engineering', 'Design'],
  }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Rendering - Add Mode', () => {
    it('renders with "Add Task" title when no task provided', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.getByRole('heading', { name: 'Add Task' })).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.getByLabelText('Task Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Team')).toBeInTheDocument()
      expect(screen.getByLabelText('Start Quarter')).toBeInTheDocument()
      expect(screen.getByLabelText('End Quarter')).toBeInTheDocument()
      expect(screen.getByLabelText('Progress (%)')).toBeInTheDocument()
      expect(screen.getByLabelText('Color Theme')).toBeInTheDocument()
    })

    it('renders Add Task button', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.getByRole('button', { name: 'Add Task' })).toBeInTheDocument()
    })

    it('does not render Delete button in add mode', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.queryByLabelText('Delete task')).not.toBeInTheDocument()
    })

    it('initializes with default values', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.getByLabelText('Task Name')).toHaveValue('')
      expect(screen.getByLabelText('Team')).toHaveValue('Engineering')
      expect(screen.getByLabelText('Start Quarter')).toHaveValue('Q1 2025')
      expect(screen.getByLabelText('End Quarter')).toHaveValue('Q1 2025')
      expect(screen.getByLabelText('Progress (%)')).toHaveValue(0)
      expect(screen.getByLabelText('Color Theme')).toHaveValue('blue')
    })
  })

  describe('Rendering - Edit Mode', () => {
    const existingTask: Task = {
      name: 'Existing Task',
      swimlane: 'Engineering',
      startQuarter: 'Q1 2025',
      endQuarter: 'Q2 2025',
      progress: 50,
      color: 'blue',
    }

    it('renders with "Edit Task" title when task provided', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          task: existingTask,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.getByRole('heading', { name: 'Edit Task' })).toBeInTheDocument()
    })

    it('renders Update Task button', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          task: existingTask,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.getByRole('button', { name: 'Update Task' })).toBeInTheDocument()
    })

    it('renders Delete button in edit mode', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          task: existingTask,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.getByLabelText('Delete task')).toBeInTheDocument()
    })

    it('populates form with task data', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          task: existingTask,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.getByLabelText('Task Name')).toHaveValue('Existing Task')
      expect(screen.getByLabelText('Team')).toHaveValue('Engineering')
      expect(screen.getByLabelText('Start Quarter')).toHaveValue('Q1 2025')
      expect(screen.getByLabelText('End Quarter')).toHaveValue('Q2 2025')
      expect(screen.getByLabelText('Progress (%)')).toHaveValue(50)
      expect(screen.getByLabelText('Color Theme')).toHaveValue('blue')
    })
  })

  describe('Form Interactions', () => {
    it('updates task name when typing', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      const input = screen.getByLabelText('Task Name') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'New Task Name' } })

      expect(input.value).toBe('New Task Name')
    })

    it('updates team when selecting', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      const select = screen.getByLabelText('Team') as HTMLSelectElement
      fireEvent.change(select, { target: { value: 'Design' } })

      expect(select.value).toBe('Design')
    })

    it('updates start quarter when selecting', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      const select = screen.getByLabelText('Start Quarter') as HTMLSelectElement
      fireEvent.change(select, { target: { value: 'Q3 2025' } })

      expect(select.value).toBe('Q3 2025')
    })

    it('updates end quarter when selecting', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      const select = screen.getByLabelText('End Quarter') as HTMLSelectElement
      fireEvent.change(select, { target: { value: 'Q4 2025' } })

      expect(select.value).toBe('Q4 2025')
    })

    it('updates progress when typing', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      const input = screen.getByLabelText('Progress (%)') as HTMLInputElement
      fireEvent.change(input, { target: { value: '75' } })

      expect(input.value).toBe('75')
    })

    it('updates color when selecting', () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      const select = screen.getByLabelText('Color Theme') as HTMLSelectElement
      fireEvent.change(select, { target: { value: 'indigo' } })

      expect(select.value).toBe('indigo')
    })
  })

  describe('Validation', () => {
    it('shows error when task name is empty', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

      await waitFor(() => {
        expect(screen.getByText('Task name is required')).toBeInTheDocument()
      })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('shows error when task name is only whitespace', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: '   ' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

      await waitFor(() => {
        expect(screen.getByText('Task name is required')).toBeInTheDocument()
      })
    })

    it('shows error when start quarter is after end quarter', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Test Task' } })
      fireEvent.change(screen.getByLabelText('Start Quarter'), { target: { value: 'Q4 2025' } })
      fireEvent.change(screen.getByLabelText('End Quarter'), { target: { value: 'Q1 2025' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

      await waitFor(() => {
        expect(screen.getByText('Start quarter must be before or equal to end quarter')).toBeInTheDocument()
      })
    })

    it('shows error for duplicate task name', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Existing Task' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('allows task name when editing same task', async () => {
      const existingTask: Task = {
        name: 'Existing Task',
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 50,
        color: 'blue',
      }

      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          task: existingTask,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      // Change progress but keep same name
      fireEvent.change(screen.getByLabelText('Progress (%)'), { target: { value: '75' } })
      fireEvent.click(screen.getByRole('button', { name: 'Update Task' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('Save - Add Mode', () => {
    it('adds new task and closes modal', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'New Task' } })
      fireEvent.change(screen.getByLabelText('Team'), { target: { value: 'Design' } })
      fireEvent.change(screen.getByLabelText('Start Quarter'), { target: { value: 'Q2 2025' } })
      fireEvent.change(screen.getByLabelText('End Quarter'), { target: { value: 'Q3 2025' } })
      fireEvent.change(screen.getByLabelText('Progress (%)'), { target: { value: '25' } })
      fireEvent.change(screen.getByLabelText('Color Theme'), { target: { value: 'indigo' } })

      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      // Verify task was added to localStorage
      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const scenario = storedData.scenarios.find((s: { name: string }) => s.name === 'Main Timeline')
      const addedTask = scenario?.tasks.find((t: { name: string }) => t.name === 'New Task')

      expect(addedTask).toBeDefined()
      expect(addedTask?.swimlane).toBe('Design')
      expect(addedTask?.progress).toBe(25)
      expect(addedTask?.color).toBe('indigo')
    })

    it('trims task name before saving', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: '  Trimmed Task  ' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const scenario = storedData.scenarios.find((s: { name: string }) => s.name === 'Main Timeline')
      const addedTask = scenario?.tasks.find((t: { name: string }) => t.name === 'Trimmed Task')

      expect(addedTask).toBeDefined()
    })
  })

  describe('Save - Edit Mode', () => {
    const existingTask: Task = {
      name: 'Existing Task',
      swimlane: 'Engineering',
      startQuarter: 'Q1 2025',
      endQuarter: 'Q2 2025',
      progress: 50,
      color: 'blue',
    }

    it('updates existing task and closes modal', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          task: existingTask,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Progress (%)'), { target: { value: '100' } })
      fireEvent.click(screen.getByRole('button', { name: 'Update Task' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const scenario = storedData.scenarios.find((s: { name: string }) => s.name === 'Main Timeline')
      const updatedTask = scenario?.tasks.find((t: { name: string }) => t.name === 'Existing Task')

      expect(updatedTask?.progress).toBe(100)
    })

    it('allows renaming task', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          task: existingTask,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Renamed Task' } })
      fireEvent.click(screen.getByRole('button', { name: 'Update Task' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const scenario = storedData.scenarios.find((s: { name: string }) => s.name === 'Main Timeline')

      expect(scenario?.tasks.find((t: { name: string }) => t.name === 'Existing Task')).toBeUndefined()
      expect(scenario?.tasks.find((t: { name: string }) => t.name === 'Renamed Task')).toBeDefined()
    })
  })

  describe('Delete', () => {
    const existingTask: Task = {
      name: 'Existing Task',
      swimlane: 'Engineering',
      startQuarter: 'Q1 2025',
      endQuarter: 'Q2 2025',
      progress: 50,
      color: 'blue',
    }

    it('deletes task and closes modal', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          task: existingTask,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.click(screen.getByLabelText('Delete task'))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const scenario = storedData.scenarios.find((s: { name: string }) => s.name === 'Main Timeline')

      expect(scenario?.tasks.find((t: { name: string }) => t.name === 'Existing Task')).toBeUndefined()
    })
  })

  describe('Cancel', () => {
    it('closes modal without saving changes', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Unsaved Task' } })
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const scenario = storedData.scenarios.find((s: { name: string }) => s.name === 'Main Timeline')

      expect(scenario?.tasks.find((t: { name: string }) => t.name === 'Unsaved Task')).toBeUndefined()
    })
  })

  describe('Modal State', () => {
    it('does not render when closed', () => {
      renderTaskModal(
        {
          isOpen: false,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      expect(screen.queryByRole('heading', { name: 'Add Task' })).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'Edit Task' })).not.toBeInTheDocument()
    })

    it('resets error when reopened', () => {
      const { rerender } = renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      // Trigger error
      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))
      expect(screen.getByText('Task name is required')).toBeInTheDocument()

      // Close modal
      rerender(
        <DataProvider>
          <TaskModal isOpen={false} onClose={mockOnClose} scenarioName="Main Timeline" />
        </DataProvider>
      )

      // Reopen modal
      rerender(
        <DataProvider>
          <TaskModal isOpen={true} onClose={mockOnClose} scenarioName="Main Timeline" />
        </DataProvider>
      )

      expect(screen.queryByText('Task name is required')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles no teams available', () => {
      const dataWithNoTeams: AppData = {
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: [],
      }

      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        dataWithNoTeams
      )

      expect(screen.getByText('No teams available')).toBeInTheDocument()
      expect(screen.getByLabelText('Team')).toBeDisabled()
    })

    it('handles progress with decimal input', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Test Task' } })
      fireEvent.change(screen.getByLabelText('Progress (%)'), { target: { value: '50.5' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('handles negative progress', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Test Task' } })
      fireEvent.change(screen.getByLabelText('Progress (%)'), { target: { value: '-10' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

      await waitFor(() => {
        expect(screen.getByText('Progress must be an integer between 0 and 100')).toBeInTheDocument()
      })
    })

    it('handles progress over 100', async () => {
      renderTaskModal(
        {
          isOpen: true,
          onClose: mockOnClose,
          scenarioName: 'Main Timeline',
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Task Name'), { target: { value: 'Test Task' } })
      fireEvent.change(screen.getByLabelText('Progress (%)'), { target: { value: '150' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Task' }))

      await waitFor(() => {
        expect(screen.getByText('Progress must be an integer between 0 and 100')).toBeInTheDocument()
      })
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TimelineModal } from './TimelineModal'
import { DataProvider } from '../../contexts/DataContext'
import type { AppData } from '../../types'
import { STORAGE_KEY } from '../../constants'

// Helper to render TimelineModal with custom data
function renderTimelineModal(
  props: {
    isOpen: boolean
    onClose: () => void
  },
  data?: AppData
) {
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  return render(
    <DataProvider>
      <TimelineModal {...props} />
    </DataProvider>
  )
}

describe('TimelineModal', () => {
  const mockOnClose = vi.fn()

  const defaultData: AppData = {
    scenarios: [
      {
        name: 'Main Timeline',
        tasks: [],
      },
    ],
    activeScenario: 'Main Timeline',
    swimlanes: ['Engineering'],
  }

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with "Add New Timeline" title', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      expect(screen.getByRole('heading', { name: 'Add New Timeline' })).toBeInTheDocument()
    })

    it('renders Clock icon', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      const icon = screen.getByRole('heading', { name: 'Add New Timeline' }).parentElement?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('renders timeline name input field', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      expect(screen.getByLabelText('Timeline Name')).toBeInTheDocument()
    })

    it('renders Save Timeline button', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      expect(screen.getByRole('button', { name: 'Save Timeline' })).toBeInTheDocument()
    })

    it('renders Cancel button', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('initializes with empty name', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      expect(screen.getByLabelText('Timeline Name')).toHaveValue('')
    })
  })

  describe('Form Interactions', () => {
    it('updates timeline name when typing', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      const input = screen.getByLabelText('Timeline Name') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'New Timeline Name' } })

      expect(input.value).toBe('New Timeline Name')
    })

    it('allows typing special characters', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      const input = screen.getByLabelText('Timeline Name') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Timeline 2024 - Q1' } })

      expect(input.value).toBe('Timeline 2024 - Q1')
    })
  })

  describe('Validation', () => {
    it('shows error when timeline name is empty', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(screen.getByText('Timeline name is required')).toBeInTheDocument()
      })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('shows error when timeline name is only whitespace', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: '   ' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(screen.getByText('Timeline name is required')).toBeInTheDocument()
      })
    })

    it('shows error for duplicate timeline name', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: 'Main Timeline' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('trims whitespace from timeline name', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: '  New Timeline  ' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const newTimeline = storedData.scenarios.find((s: { name: string }) => s.name === 'New Timeline')

      expect(newTimeline).toBeDefined()
    })
  })

  describe('Save', () => {
    it('adds new timeline and closes modal', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: 'Q2 Timeline' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      // Verify timeline was added to localStorage
      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const newTimeline = storedData.scenarios.find((s: { name: string }) => s.name === 'Q2 Timeline')

      expect(newTimeline).toBeDefined()
      expect(newTimeline?.tasks).toEqual([])
    })

    it('creates timeline with empty task list', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: 'Empty Timeline' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const newTimeline = storedData.scenarios.find((s: { name: string }) => s.name === 'Empty Timeline')

      expect(newTimeline?.tasks).toEqual([])
    })

    it('adds multiple timelines sequentially', async () => {
      const { rerender } = renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      // Add first timeline
      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: 'Timeline 1' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      // Reset and add second timeline
      vi.clearAllMocks()

      rerender(
        <DataProvider>
          <TimelineModal isOpen={true} onClose={mockOnClose} />
        </DataProvider>
      )

      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: 'Timeline 2' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const finalData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(finalData.scenarios.length).toBe(3) // Main Timeline + Timeline 1 + Timeline 2
    })
  })

  describe('Cancel', () => {
    it('closes modal without saving changes', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: 'Unsaved Timeline' } })
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const unsavedTimeline = storedData.scenarios.find((s: { name: string }) => s.name === 'Unsaved Timeline')

      expect(unsavedTimeline).toBeUndefined()
    })

    it('clears error when cancelled', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      // Trigger error
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))
      expect(screen.getByText('Timeline name is required')).toBeInTheDocument()

      // Cancel
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })
  })

  describe('Modal State', () => {
    it('does not render when closed', () => {
      renderTimelineModal(
        {
          isOpen: false,
          onClose: mockOnClose,
        },
        defaultData
      )

      expect(screen.queryByRole('heading', { name: 'Add New Timeline' })).not.toBeInTheDocument()
    })

    it('resets form when reopened', () => {
      const { rerender } = renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      // Type in name
      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: 'Test Timeline' } })
      expect(screen.getByLabelText('Timeline Name')).toHaveValue('Test Timeline')

      // Close modal
      rerender(
        <DataProvider>
          <TimelineModal isOpen={false} onClose={mockOnClose} />
        </DataProvider>
      )

      // Reopen modal
      rerender(
        <DataProvider>
          <TimelineModal isOpen={true} onClose={mockOnClose} />
        </DataProvider>
      )

      expect(screen.getByLabelText('Timeline Name')).toHaveValue('')
    })

    it('resets error when reopened', () => {
      const { rerender } = renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      // Trigger error
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))
      expect(screen.getByText('Timeline name is required')).toBeInTheDocument()

      // Close modal
      rerender(
        <DataProvider>
          <TimelineModal isOpen={false} onClose={mockOnClose} />
        </DataProvider>
      )

      // Reopen modal
      rerender(
        <DataProvider>
          <TimelineModal isOpen={true} onClose={mockOnClose} />
        </DataProvider>
      )

      expect(screen.queryByText('Timeline name is required')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles very long timeline names', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      const longName = 'A'.repeat(200)
      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: longName } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const newTimeline = storedData.scenarios.find((s: { name: string }) => s.name === longName)

      expect(newTimeline).toBeDefined()
    })

    it('handles timeline names with numbers', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: '2025 Q1 Timeline' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const newTimeline = storedData.scenarios.find((s: { name: string }) => s.name === '2025 Q1 Timeline')

      expect(newTimeline).toBeDefined()
    })

    it('handles timeline names with special characters', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.change(screen.getByLabelText('Timeline Name'), { target: { value: 'Timeline & Plan (2025)' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })

      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const newTimeline = storedData.scenarios.find((s: { name: string }) => s.name === 'Timeline & Plan (2025)')

      expect(newTimeline).toBeDefined()
    })
  })

  describe('Styling', () => {
    it('has blue Save Timeline button', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      const saveButton = screen.getByRole('button', { name: 'Save Timeline' })
      expect(saveButton).toHaveClass('bg-blue-600')
    })

    it('has white Cancel button', () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelButton).toHaveClass('bg-white')
    })

    it('displays error with alert role', async () => {
      renderTimelineModal(
        {
          isOpen: true,
          onClose: mockOnClose,
        },
        defaultData
      )

      fireEvent.click(screen.getByRole('button', { name: 'Save Timeline' }))

      await waitFor(() => {
        const alert = screen.getByRole('alert')
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveClass('bg-red-100')
      })
    })
  })
})

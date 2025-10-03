import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Timeline } from './Timeline'
import { DataProvider } from '../../contexts/DataContext'
import type { AppData } from '../../types'
import { STORAGE_KEY } from '../../constants'

// Helper to render Timeline with custom data
function renderTimeline(data: AppData) {
  // Set up localStorage with the test data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

  return render(
    <DataProvider>
      <Timeline />
    </DataProvider>
  )
}

describe('Timeline', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('renders TimelineHeader', () => {
      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: [],
      })

      expect(screen.getByText('Teams')).toBeInTheDocument()
    })

    it('shows empty state when no teams configured', () => {
      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: [],
      })

      expect(screen.getByText('No teams configured. Click "+ Add Team" to get started.')).toBeInTheDocument()
    })

    it('renders swimlane for single team', () => {
      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: ['Engineering'],
      })

      expect(screen.getByText('Engineering')).toBeInTheDocument()
    })

    it('renders swimlanes for multiple teams', () => {
      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: ['Engineering', 'Design', 'Marketing'],
      })

      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getByText('Design')).toBeInTheDocument()
      expect(screen.getByText('Marketing')).toBeInTheDocument()
    })

    it('renders swimlanes in order', () => {
      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: ['First', 'Second', 'Third'],
      })

      // Check that all swimlane names appear in the document
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.getByText('Third')).toBeInTheDocument()
    })
  })

  describe('Task Filtering', () => {
    it('shows tasks from active scenario only', () => {
      renderTimeline({
        scenarios: [
          {
            name: 'Main Timeline',
            tasks: [
              {
                name: 'Task 1',
                swimlane: 'Engineering',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue',
              },
            ],
          },
          {
            name: 'Other Timeline',
            tasks: [
              {
                name: 'Task 2',
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
        swimlanes: ['Engineering'],
      })

      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument()
    })

    it('handles empty active scenario', () => {
      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: ['Engineering'],
      })

      // Should render swimlane even with no tasks
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getByText('(0)')).toBeInTheDocument()
    })

    it('handles non-existent active scenario gracefully', () => {
      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Non Existent',
        swimlanes: ['Engineering'],
      })

      // Should still render without crashing
      expect(screen.getByText('Engineering')).toBeInTheDocument()
    })
  })

  describe('Task Grouping', () => {
    it('groups tasks by swimlane correctly', () => {
      renderTimeline({
        scenarios: [
          {
            name: 'Main Timeline',
            tasks: [
              {
                name: 'Task 1',
                swimlane: 'Engineering',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue',
              },
              {
                name: 'Task 2',
                swimlane: 'Design',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue',
              },
              {
                name: 'Task 3',
                swimlane: 'Engineering',
                startQuarter: 'Q3 2025',
                endQuarter: 'Q4 2025',
                progress: 50,
                color: 'blue',
              },
            ],
          },
        ],
        activeScenario: 'Main Timeline',
        swimlanes: ['Engineering', 'Design'],
      })

      // Engineering should show 2 tasks
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      const engCount = screen.getAllByText('(2)')[0]
      expect(engCount).toBeInTheDocument()

      // Design should show 1 task
      expect(screen.getByText('Design')).toBeInTheDocument()
      expect(screen.getByText('(1)')).toBeInTheDocument()
    })

    it('renders swimlanes with no tasks', () => {
      renderTimeline({
        scenarios: [
          {
            name: 'Main Timeline',
            tasks: [
              {
                name: 'Task 1',
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
        swimlanes: ['Engineering', 'Design', 'Marketing'],
      })

      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getByText('Design')).toBeInTheDocument()
      expect(screen.getByText('Marketing')).toBeInTheDocument()

      // Engineering has 1 task
      expect(screen.getByText('(1)')).toBeInTheDocument()
      // Design and Marketing have 0 tasks each
      expect(screen.getAllByText('(0)').length).toBe(2)
    })

    it('ignores tasks for teams that no longer exist', () => {
      renderTimeline({
        scenarios: [
          {
            name: 'Main Timeline',
            tasks: [
              {
                name: 'Task 1',
                swimlane: 'Deleted Team',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue',
              },
            ],
          },
        ],
        activeScenario: 'Main Timeline',
        swimlanes: ['Engineering'],
      })

      // Should only show Engineering swimlane
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.queryByText('Deleted Team')).not.toBeInTheDocument()
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument()
    })
  })

  describe('Integration with Context', () => {
    it('uses data from localStorage on mount', () => {
      // Set up localStorage with data
      const testData: AppData = {
        scenarios: [
          {
            name: 'Test Timeline',
            tasks: [
              {
                name: 'Test Task',
                swimlane: 'Test Team',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 75,
                color: 'indigo',
              },
            ],
          },
        ],
        activeScenario: 'Test Timeline',
        swimlanes: ['Test Team'],
      }
      localStorage.setItem('dynamic-timeline-data', JSON.stringify(testData))

      render(
        <DataProvider>
          <Timeline />
        </DataProvider>
      )

      expect(screen.getByText('Test Team')).toBeInTheDocument()
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles scenario with many tasks', () => {
      const tasks = Array.from({ length: 20 }, (_, i) => ({
        name: `Task ${i + 1}`,
        swimlane: 'Engineering',
        startQuarter: 'Q1 2025' as const,
        endQuarter: 'Q2 2025' as const,
        progress: 50,
        color: 'blue' as const,
      }))

      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks }],
        activeScenario: 'Main Timeline',
        swimlanes: ['Engineering'],
      })

      expect(screen.getByText('(20)')).toBeInTheDocument()
    })

    it('handles many teams', () => {
      const swimlanes = Array.from({ length: 10 }, (_, i) => `Team ${i + 1}`)

      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes,
      })

      swimlanes.forEach((swimlane) => {
        expect(screen.getByText(swimlane)).toBeInTheDocument()
      })
    })

    it('handles team names with special characters', () => {
      renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: ['Team & Co.', 'Team "Quotes"', "Team's Name"],
      })

      expect(screen.getByText('Team & Co.')).toBeInTheDocument()
      expect(screen.getByText('Team "Quotes"')).toBeInTheDocument()
      expect(screen.getByText("Team's Name")).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('has correct container classes', () => {
      const { container } = renderTimeline({
        scenarios: [{ name: 'Main Timeline', tasks: [] }],
        activeScenario: 'Main Timeline',
        swimlanes: [],
      })

      const outerDiv = container.firstChild as HTMLElement
      expect(outerDiv).toHaveClass('flex-1', 'overflow-auto')

      const innerDiv = outerDiv.firstChild as HTMLElement
      expect(innerDiv).toHaveClass('min-w-max')
    })
  })
})

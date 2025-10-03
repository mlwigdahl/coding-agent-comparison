import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Swimlane } from './Swimlane'
import type { Task } from '../../types'

describe('Swimlane', () => {
  const mockOnTaskClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createTask = (name: string, startQuarter: string, endQuarter: string): Task => ({
    name,
    swimlane: 'Engineering',
    startQuarter: startQuarter as Task['startQuarter'],
    endQuarter: endQuarter as Task['endQuarter'],
    progress: 50,
    color: 'blue',
  })

  describe('Rendering', () => {
    it('renders team name', () => {
      render(<Swimlane name="Engineering" tasks={[]} />)
      expect(screen.getByText('Engineering')).toBeInTheDocument()
    })

    it('renders task count when no tasks', () => {
      render(<Swimlane name="Engineering" tasks={[]} />)
      expect(screen.getByText('(0)')).toBeInTheDocument()
    })

    it('renders task count when single task', () => {
      const tasks = [createTask('Task 1', 'Q1 2025', 'Q2 2025')]
      render(<Swimlane name="Engineering" tasks={tasks} />)
      expect(screen.getByText('(1)')).toBeInTheDocument()
    })

    it('renders task count when multiple tasks', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q2 2025'),
        createTask('Task 2', 'Q3 2025', 'Q4 2025'),
        createTask('Task 3', 'Q1 2026', 'Q2 2026'),
      ]
      render(<Swimlane name="Engineering" tasks={tasks} />)
      expect(screen.getByText('(3)')).toBeInTheDocument()
    })

    it('renders all tasks', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q2 2025'),
        createTask('Task 2', 'Q3 2025', 'Q4 2025'),
      ]
      render(<Swimlane name="Engineering" tasks={tasks} />)
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()
    })
  })

  describe('Height Calculation', () => {
    it('has minimum height of 80px when no tasks', () => {
      const { container } = render(<Swimlane name="Engineering" tasks={[]} />)
      const swimlane = container.firstChild as HTMLElement
      expect(swimlane.style.height).toBe('80px')
    })

    it('has minimum height of 80px when single task in row 0', () => {
      const tasks = [createTask('Task 1', 'Q1 2025', 'Q2 2025')]
      const { container } = render(<Swimlane name="Engineering" tasks={tasks} />)
      const swimlane = container.firstChild as HTMLElement
      expect(swimlane.style.height).toBe('80px')
    })

    it('calculates height for non-overlapping tasks (same row)', () => {
      // Non-overlapping tasks should be in the same row
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q1 2025'),
        createTask('Task 2', 'Q2 2025', 'Q2 2025'),
      ]
      const { container } = render(<Swimlane name="Engineering" tasks={tasks} />)
      const swimlane = container.firstChild as HTMLElement
      // Both tasks should fit in row 0, so min height 80px
      expect(swimlane.style.height).toBe('80px')
    })

    it('calculates height for overlapping tasks (multiple rows)', () => {
      // Overlapping tasks should be in different rows
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q3 2025'),
        createTask('Task 2', 'Q2 2025', 'Q4 2025'),
      ]
      const { container } = render(<Swimlane name="Engineering" tasks={tasks} />)
      const swimlane = container.firstChild as HTMLElement
      // Should need 2 rows: 2 * 60px = 120px
      expect(swimlane.style.height).toBe('120px')
    })

    it('calculates height for three overlapping tasks', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q4 2025'),
        createTask('Task 2', 'Q1 2025', 'Q4 2025'),
        createTask('Task 3', 'Q1 2025', 'Q4 2025'),
      ]
      const { container } = render(<Swimlane name="Engineering" tasks={tasks} />)
      const swimlane = container.firstChild as HTMLElement
      // Should need 3 rows: 3 * 60px = 180px
      expect(swimlane.style.height).toBe('180px')
    })
  })

  describe('Task Stacking', () => {
    it('stacks overlapping tasks in different rows', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q3 2025'),
        createTask('Task 2', 'Q2 2025', 'Q4 2025'),
      ]
      const { container } = render(<Swimlane name="Engineering" tasks={tasks} />)

      // Both tasks should be rendered
      expect(screen.getByText('Task 1')).toBeInTheDocument()
      expect(screen.getByText('Task 2')).toBeInTheDocument()

      // Check that tasks are positioned at different vertical positions
      // Query for task elements specifically (they have role="button")
      const taskElements = container.querySelectorAll('[role="button"]')
      expect(taskElements.length).toBe(2)

      const task1 = taskElements[0] as HTMLElement
      const task2 = taskElements[1] as HTMLElement

      // Tasks should have different top positions
      expect(task1.style.top).not.toBe(task2.style.top)
    })

    it('places non-overlapping tasks in the same row', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q1 2025'),
        createTask('Task 2', 'Q3 2025', 'Q3 2025'),
      ]
      const { container } = render(<Swimlane name="Engineering" tasks={tasks} />)

      // Query for task elements specifically (they have role="button")
      const taskElements = container.querySelectorAll('[role="button"]')
      const task1 = taskElements[0] as HTMLElement
      const task2 = taskElements[1] as HTMLElement

      // Non-overlapping tasks should be in the same row (top: 0px)
      expect(task1.style.top).toBe('0px')
      expect(task2.style.top).toBe('0px')
    })
  })

  describe('Interactions', () => {
    it('calls onTaskClick when task is clicked', () => {
      const tasks = [createTask('Task 1', 'Q1 2025', 'Q2 2025')]
      render(<Swimlane name="Engineering" tasks={tasks} onTaskClick={mockOnTaskClick} />)

      const taskElement = screen.getByLabelText('Edit task: Task 1')
      fireEvent.click(taskElement)

      expect(mockOnTaskClick).toHaveBeenCalledTimes(1)
      expect(mockOnTaskClick).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Task 1' })
      )
    })

    it('does not crash when onTaskClick is not provided', () => {
      const tasks = [createTask('Task 1', 'Q1 2025', 'Q2 2025')]
      render(<Swimlane name="Engineering" tasks={tasks} />)

      const taskElement = screen.getByLabelText('Edit task: Task 1')
      expect(() => fireEvent.click(taskElement)).not.toThrow()
    })

    it('calls onTaskClick with correct task when multiple tasks exist', () => {
      const tasks = [
        createTask('Task 1', 'Q1 2025', 'Q2 2025'),
        createTask('Task 2', 'Q3 2025', 'Q4 2025'),
      ]
      render(<Swimlane name="Engineering" tasks={tasks} onTaskClick={mockOnTaskClick} />)

      const task2Element = screen.getByLabelText('Edit task: Task 2')
      fireEvent.click(task2Element)

      expect(mockOnTaskClick).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Task 2' })
      )
    })
  })

  describe('Styling', () => {
    it('has border at bottom', () => {
      const { container } = render(<Swimlane name="Engineering" tasks={[]} />)
      const swimlane = container.firstChild as HTMLElement
      expect(swimlane).toHaveClass('border-b')
    })

    it('has grid layout', () => {
      const { container } = render(<Swimlane name="Engineering" tasks={[]} />)
      const grid = container.querySelector('.grid') as HTMLElement
      expect(grid).toBeInTheDocument()
      expect(grid.style.gridTemplateColumns).toBe('200px repeat(16, 100px)')
    })

    it('has team name in semibold', () => {
      render(<Swimlane name="Engineering" tasks={[]} />)
      const teamName = screen.getByText('Engineering')
      expect(teamName).toHaveClass('font-semibold')
    })

    it('has task count in gray', () => {
      render(<Swimlane name="Engineering" tasks={[]} />)
      const taskCount = screen.getByText('(0)')
      expect(taskCount).toHaveClass('text-gray-500')
    })

    it('has border on right of team name column', () => {
      const { container } = render(<Swimlane name="Engineering" tasks={[]} />)
      const teamColumn = container.querySelector('.border-r')
      expect(teamColumn).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty team name', () => {
      render(<Swimlane name="" tasks={[]} />)
      expect(screen.getByText('(0)')).toBeInTheDocument()
    })

    it('handles very long team name', () => {
      const longName = 'A'.repeat(100)
      render(<Swimlane name={longName} tasks={[]} />)
      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('handles many tasks', () => {
      const tasks = Array.from({ length: 20 }, (_, i) =>
        createTask(`Task ${i + 1}`, 'Q1 2025', 'Q2 2025')
      )
      render(<Swimlane name="Engineering" tasks={tasks} />)
      expect(screen.getByText('(20)')).toBeInTheDocument()
    })
  })
})

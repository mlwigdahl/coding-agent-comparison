import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Task } from './Task'
import { COLOR_THEMES, PROGRESS_BAR_COLOR } from '../../constants'
import type { StackedTask } from '../../types'

// Helper to convert hex to rgb format for comparison
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  return `rgb(${parseInt(result[1] || '0', 16)}, ${parseInt(result[2] || '0', 16)}, ${parseInt(result[3] || '0', 16)})`
}

describe('Task', () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const baseTask: StackedTask = {
    name: 'Test Task',
    swimlane: 'Engineering',
    startQuarter: 'Q1 2025',
    endQuarter: 'Q2 2025',
    progress: 50,
    color: 'blue',
    row: 0,
  }

  describe('Rendering', () => {
    it('renders task name', () => {
      render(<Task task={baseTask} onClick={mockOnClick} />)
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })

    it('renders progress percentage', () => {
      render(<Task task={baseTask} onClick={mockOnClick} />)
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    it('renders with 0% progress', () => {
      const task = { ...baseTask, progress: 0 }
      render(<Task task={task} onClick={mockOnClick} />)
      expect(screen.getByText('0%')).toBeInTheDocument()
    })

    it('renders with 100% progress', () => {
      const task = { ...baseTask, progress: 100 }
      render(<Task task={task} onClick={mockOnClick} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  describe('Positioning', () => {
    it('calculates correct left position for Q1 2025', () => {
      const task = { ...baseTask, startQuarter: 'Q1 2025' as const }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement.style.left).toBe('0px') // Q1 2025 is index 0, 0 * 100px = 0px
    })

    it('calculates correct left position for Q3 2025', () => {
      const task = { ...baseTask, startQuarter: 'Q3 2025' as const }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement.style.left).toBe('200px') // Q3 2025 is index 2, 2 * 100px = 200px
    })

    it('calculates correct top position for row 0', () => {
      const task = { ...baseTask, row: 0 }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement.style.top).toBe('0px')
    })

    it('calculates correct top position for row 2', () => {
      const task = { ...baseTask, row: 2 }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement.style.top).toBe('120px') // 2 * 60px per row
    })

    it('has correct height', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement.style.height).toBe('50px')
    })
  })

  describe('Width Calculation', () => {
    it('calculates correct width for single quarter span', () => {
      const task = { ...baseTask, startQuarter: 'Q1 2025' as const, endQuarter: 'Q1 2025' as const }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement.style.width).toBe('100px')
    })

    it('calculates correct width for two quarter span', () => {
      const task = { ...baseTask, startQuarter: 'Q1 2025' as const, endQuarter: 'Q2 2025' as const }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement.style.width).toBe('200px')
    })

    it('calculates correct width for four quarter span', () => {
      const task = { ...baseTask, startQuarter: 'Q1 2025' as const, endQuarter: 'Q4 2025' as const }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement.style.width).toBe('400px')
    })

    it('calculates correct width for multi-year span', () => {
      const task = { ...baseTask, startQuarter: 'Q1 2025' as const, endQuarter: 'Q1 2026' as const }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement.style.width).toBe('500px') // 5 quarters * 100px
    })
  })

  describe('Colors', () => {
    it('uses uncompleted blue color when progress < 100', () => {
      const task = { ...baseTask, color: 'blue' as const, progress: 50 }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskContent = container.querySelector('.relative') as HTMLElement
      expect(taskContent.style.backgroundColor).toBe(hexToRgb(COLOR_THEMES.blue.uncompleted))
    })

    it('uses completed blue color when progress = 100', () => {
      const task = { ...baseTask, color: 'blue' as const, progress: 100 }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskContent = container.querySelector('.relative') as HTMLElement
      expect(taskContent.style.backgroundColor).toBe(hexToRgb(COLOR_THEMES.blue.completed))
    })

    it('uses uncompleted indigo color when progress < 100', () => {
      const task = { ...baseTask, color: 'indigo' as const, progress: 75 }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskContent = container.querySelector('.relative') as HTMLElement
      expect(taskContent.style.backgroundColor).toBe(hexToRgb(COLOR_THEMES.indigo.uncompleted))
    })

    it('uses completed indigo color when progress = 100', () => {
      const task = { ...baseTask, color: 'indigo' as const, progress: 100 }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskContent = container.querySelector('.relative') as HTMLElement
      expect(taskContent.style.backgroundColor).toBe(hexToRgb(COLOR_THEMES.indigo.completed))
    })

    it('uses darker border color', () => {
      const task = { ...baseTask, color: 'blue' as const }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const taskContent = container.querySelector('.relative') as HTMLElement
      expect(taskContent.style.border).toContain(hexToRgb(COLOR_THEMES.blue.completed))
    })
  })

  describe('Progress Bar', () => {
    it('renders progress bar with correct width', () => {
      const task = { ...baseTask, progress: 50 }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const progressBar = container.querySelector('.absolute.bottom-0') as HTMLElement
      expect(progressBar.style.width).toBe('50%')
    })

    it('renders progress bar with orange color', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const progressBar = container.querySelector('.absolute.bottom-0') as HTMLElement
      expect(progressBar.style.backgroundColor).toBe(hexToRgb(PROGRESS_BAR_COLOR))
    })

    it('renders progress bar at 0%', () => {
      const task = { ...baseTask, progress: 0 }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const progressBar = container.querySelector('.absolute.bottom-0') as HTMLElement
      expect(progressBar.style.width).toBe('0%')
    })

    it('renders progress bar at 100%', () => {
      const task = { ...baseTask, progress: 100 }
      const { container } = render(<Task task={task} onClick={mockOnClick} />)
      const progressBar = container.querySelector('.absolute.bottom-0') as HTMLElement
      expect(progressBar.style.width).toBe('100%')
    })

    it('has correct height for progress bar', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const progressBar = container.querySelector('.absolute.bottom-0') as HTMLElement
      expect(progressBar).toHaveClass('h-1')
    })
  })

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      fireEvent.click(taskElement)
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClick when Enter key is pressed', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      fireEvent.keyDown(taskElement, { key: 'Enter' })
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('calls onClick when Space key is pressed', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      fireEvent.keyDown(taskElement, { key: ' ' })
      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick for other keys', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      fireEvent.keyDown(taskElement, { key: 'a' })
      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('has cursor pointer style', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement).toHaveClass('cursor-pointer')
    })
  })

  describe('Accessibility', () => {
    it('has role button', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement).toHaveAttribute('role', 'button')
    })

    it('has tabIndex 0 for keyboard navigation', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement).toHaveAttribute('tabIndex', '0')
    })

    it('has aria-label with task name', () => {
      render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = screen.getByLabelText('Edit task: Test Task')
      expect(taskElement).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('has pill shape with rounded borders', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskContent = container.querySelector('.relative') as HTMLElement
      expect(taskContent.style.borderRadius).toBe('9999px')
    })

    it('has white text color', () => {
      render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskName = screen.getByText('Test Task')
      expect(taskName).toHaveClass('text-white')
    })

    it('truncates long task names', () => {
      render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskName = screen.getByText('Test Task')
      expect(taskName).toHaveClass('truncate')
    })

    it('has absolute positioning', () => {
      const { container } = render(<Task task={baseTask} onClick={mockOnClick} />)
      const taskElement = container.firstChild as HTMLElement
      expect(taskElement).toHaveClass('absolute')
    })
  })
})

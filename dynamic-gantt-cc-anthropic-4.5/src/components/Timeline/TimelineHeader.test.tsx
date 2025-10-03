import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimelineHeader } from './TimelineHeader'
import { QUARTERS } from '../../constants'

describe('TimelineHeader', () => {
  describe('Rendering', () => {
    it('renders the Teams header', () => {
      render(<TimelineHeader />)
      expect(screen.getByText('Teams')).toBeInTheDocument()
    })

    it('renders Teams icon', () => {
      const { container } = render(<TimelineHeader />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('renders all 16 quarters', () => {
      render(<TimelineHeader />)

      // Check that all quarters are present (each appears 4 times - once per year)
      const q1Elements = screen.getAllByText('Q1')
      expect(q1Elements.length).toBe(4) // Q1 appears in 2025, 2026, 2027, 2028

      const q2Elements = screen.getAllByText('Q2')
      expect(q2Elements.length).toBe(4)

      const q3Elements = screen.getAllByText('Q3')
      expect(q3Elements.length).toBe(4)

      const q4Elements = screen.getAllByText('Q4')
      expect(q4Elements.length).toBe(4)

      // Check for all years
      const yearElements = screen.getAllByText('2025')
      expect(yearElements.length).toBe(4) // Q1-Q4 2025

      const year2026Elements = screen.getAllByText('2026')
      expect(year2026Elements.length).toBe(4) // Q1-Q4 2026

      const year2027Elements = screen.getAllByText('2027')
      expect(year2027Elements.length).toBe(4) // Q1-Q4 2027

      const year2028Elements = screen.getAllByText('2028')
      expect(year2028Elements.length).toBe(4) // Q1-Q4 2028
    })

    it('renders quarters in correct order', () => {
      const { container } = render(<TimelineHeader />)
      const quarterHeaders = container.querySelectorAll('.grid > div')

      // First element should be Teams header
      expect(quarterHeaders[0]?.textContent).toContain('Teams')

      // Then Q1 2025, Q2 2025, etc.
      expect(quarterHeaders[1]?.textContent).toContain('Q1')
      expect(quarterHeaders[1]?.textContent).toContain('2025')

      expect(quarterHeaders[2]?.textContent).toContain('Q2')
      expect(quarterHeaders[2]?.textContent).toContain('2025')

      // Last should be Q4 2028
      expect(quarterHeaders[16]?.textContent).toContain('Q4')
      expect(quarterHeaders[16]?.textContent).toContain('2028')
    })
  })

  describe('Styling', () => {
    it('has sticky positioning', () => {
      const { container } = render(<TimelineHeader />)
      const header = container.querySelector('.sticky')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('top-0')
    })

    it('has correct background color', () => {
      const { container } = render(<TimelineHeader />)
      const header = container.querySelector('.bg-gray-50')
      expect(header).toBeInTheDocument()
    })

    it('has grid layout with correct columns', () => {
      const { container } = render(<TimelineHeader />)
      const grid = container.querySelector('.grid')
      expect(grid).toHaveStyle({ gridTemplateColumns: '200px repeat(16, 100px)' })
    })

    it('has bold quarter numbers', () => {
      const { container } = render(<TimelineHeader />)
      const boldElements = container.querySelectorAll('.font-bold')
      // Should have Q1, Q2, Q3, Q4 repeated 4 times each (16 total)
      const quarterElements = Array.from(boldElements).filter(
        (el) => el.textContent === 'Q1' ||
                el.textContent === 'Q2' ||
                el.textContent === 'Q3' ||
                el.textContent === 'Q4'
      )
      expect(quarterElements.length).toBe(16)
    })

    it('has gray years', () => {
      const { container } = render(<TimelineHeader />)
      const grayYears = container.querySelectorAll('.text-gray-500')
      // Should have 16 year labels
      expect(grayYears.length).toBeGreaterThanOrEqual(16)
    })
  })

  describe('Year Separators', () => {
    it('has year separator before Q1 2026', () => {
      const { container } = render(<TimelineHeader />)
      const quarterHeaders = Array.from(container.querySelectorAll('.grid > div'))

      // Find Q1 2026 (index 5: 0=Teams, 1-4=2025 quarters, 5=Q1 2026)
      const q1_2026_index = 5
      const q1_2026 = quarterHeaders[q1_2026_index]

      expect(q1_2026?.className).toContain('border-l-2')
    })

    it('has year separator before Q1 2027', () => {
      const { container } = render(<TimelineHeader />)
      const quarterHeaders = Array.from(container.querySelectorAll('.grid > div'))

      // Find Q1 2027 (index 9: 0=Teams, 1-4=2025, 5-8=2026, 9=Q1 2027)
      const q1_2027_index = 9
      const q1_2027 = quarterHeaders[q1_2027_index]

      expect(q1_2027?.className).toContain('border-l-2')
    })

    it('has year separator before Q1 2028', () => {
      const { container } = render(<TimelineHeader />)
      const quarterHeaders = Array.from(container.querySelectorAll('.grid > div'))

      // Find Q1 2028 (index 13: 0=Teams, 1-4=2025, 5-8=2026, 9-12=2027, 13=Q1 2028)
      const q1_2028_index = 13
      const q1_2028 = quarterHeaders[q1_2028_index]

      expect(q1_2028?.className).toContain('border-l-2')
    })

    it('does not have year separator before Q1 2025', () => {
      const { container } = render(<TimelineHeader />)
      const quarterHeaders = Array.from(container.querySelectorAll('.grid > div'))

      // Q1 2025 is at index 1
      const q1_2025 = quarterHeaders[1]

      expect(q1_2025?.className).not.toContain('border-l-2')
    })

    it('does not have year separator on non-Q1 quarters', () => {
      const { container } = render(<TimelineHeader />)
      const quarterHeaders = Array.from(container.querySelectorAll('.grid > div'))

      // Check Q2, Q3, Q4 of 2025
      const q2_2025 = quarterHeaders[2]
      const q3_2025 = quarterHeaders[3]
      const q4_2025 = quarterHeaders[4]

      expect(q2_2025?.className).not.toContain('border-l-2')
      expect(q3_2025?.className).not.toContain('border-l-2')
      expect(q4_2025?.className).not.toContain('border-l-2')
    })
  })

  describe('Accessibility', () => {
    it('has aria-hidden on icon', () => {
      const { container } = render(<TimelineHeader />)
      const icon = container.querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('Content', () => {
    it('displays all quarters from QUARTERS constant', () => {
      render(<TimelineHeader />)

      // Verify all quarters from the constant are displayed
      // Count unique quarters and years
      const quarterNums = new Set<string>()
      const years = new Set<string>()

      QUARTERS.forEach((quarter) => {
        const parts = quarter.split(' ')
        const quarterNum = parts[0]
        const year = parts[1]
        if (quarterNum && year) {
          quarterNums.add(quarterNum)
          years.add(year)
        }
      })

      // Check each unique quarter number appears 4 times (once per year)
      quarterNums.forEach((quarterNum) => {
        const elements = screen.getAllByText(quarterNum)
        expect(elements.length).toBe(4)
      })

      // Check each unique year appears 4 times (once per quarter)
      years.forEach((year) => {
        const elements = screen.getAllByText(year)
        expect(elements.length).toBe(4)
      })
    })

    it('has correct number of total columns (1 Teams + 16 quarters)', () => {
      const { container } = render(<TimelineHeader />)
      const columns = container.querySelectorAll('.grid > div')
      expect(columns.length).toBe(17) // 1 Teams + 16 quarters
    })
  })
})

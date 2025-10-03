import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from './Header'
import * as DataContext from '../../contexts/DataContext'
import * as FileImportExport from '../../hooks/useFileImportExport'
import type { AppData } from '../../types'

describe('Header', () => {
  const mockSetActiveScenario = vi.fn()
  const mockSetData = vi.fn()
  const mockAddTeam = vi.fn()
  const mockExportData = vi.fn()
  const mockImportData = vi.fn()

  const mockData: AppData = {
    scenarios: [
      { name: 'Main Timeline', tasks: [] },
      { name: 'Aggressive Timeline', tasks: [] },
    ],
    activeScenario: 'Main Timeline',
    swimlanes: ['Engineering', 'Design'],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock useData hook
    vi.spyOn(DataContext, 'useData').mockReturnValue({
      data: mockData,
      setData: mockSetData,
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      addScenario: vi.fn(),
      setActiveScenario: mockSetActiveScenario,
      addTeam: mockAddTeam,
      getAllTaskNames: vi.fn(() => []),
      getAllTeamNames: vi.fn(() => ['Engineering', 'Design']),
      getAllScenarioNames: vi.fn(() => ['Main Timeline', 'Aggressive Timeline']),
    })

    // Mock useFileImportExport hook
    vi.spyOn(FileImportExport, 'useFileImportExport').mockReturnValue({
      exportData: mockExportData,
      importData: mockImportData,
    })
  })

  describe('Rendering', () => {
    it('renders the title', () => {
      render(<Header />)
      expect(
        screen.getByText('Dynamic Project Timeline - Quarterly View')
      ).toBeInTheDocument()
    })

    it('renders the calendar icon', () => {
      render(<Header />)
      const icon = screen.getByRole('banner').querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('renders all buttons', () => {
      render(<Header />)
      expect(screen.getByLabelText('Add new timeline')).toBeInTheDocument()
      expect(screen.getByLabelText('Export data')).toBeInTheDocument()
      expect(screen.getByLabelText('Import data')).toBeInTheDocument()
      expect(screen.getByLabelText('Add new team')).toBeInTheDocument()
      expect(screen.getByLabelText('Add new task')).toBeInTheDocument()
    })

    it('renders timeline dropdown', () => {
      render(<Header />)
      const dropdown = screen.getByLabelText('Select timeline')
      expect(dropdown).toBeInTheDocument()
    })

    it('displays all scenarios in dropdown', () => {
      render(<Header />)
      const dropdown = screen.getByLabelText('Select timeline') as HTMLSelectElement
      const options = Array.from(dropdown.options).map((opt) => opt.value)
      expect(options).toEqual(['Main Timeline', 'Aggressive Timeline'])
    })

    it('shows active scenario as selected', () => {
      render(<Header />)
      const dropdown = screen.getByLabelText('Select timeline') as HTMLSelectElement
      expect(dropdown.value).toBe('Main Timeline')
    })
  })

  describe('Timeline Selection', () => {
    it('calls setActiveScenario when timeline is changed', () => {
      render(<Header />)
      const dropdown = screen.getByLabelText('Select timeline')
      fireEvent.change(dropdown, { target: { value: 'Aggressive Timeline' } })

      expect(mockSetActiveScenario).toHaveBeenCalledWith('Aggressive Timeline')
    })
  })

  describe('Button Interactions', () => {
    it('calls exportData when Export button is clicked', () => {
      render(<Header />)
      const exportButton = screen.getByLabelText('Export data')
      fireEvent.click(exportButton)

      expect(mockExportData).toHaveBeenCalledWith(mockData)
    })

    it('calls importData when Import button is clicked', () => {
      render(<Header />)
      const importButton = screen.getByLabelText('Import data')
      fireEvent.click(importButton)

      expect(mockImportData).toHaveBeenCalled()
    })

    it('calls importData with success and error callbacks', () => {
      render(<Header />)
      const importButton = screen.getByLabelText('Import data')
      fireEvent.click(importButton)

      expect(mockImportData).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      )
    })

    it('sets data when import succeeds', () => {
      render(<Header />)
      const importButton = screen.getByLabelText('Import data')
      fireEvent.click(importButton)

      // Get the success callback and call it
      const successCallback = mockImportData.mock.calls[0]?.[0]
      const importedData: AppData = {
        scenarios: [{ name: 'Imported', tasks: [] }],
        activeScenario: 'Imported',
        swimlanes: [],
      }
      successCallback(importedData)

      expect(mockSetData).toHaveBeenCalledWith(importedData)
    })

    it('shows alert when import fails', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

      render(<Header />)
      const importButton = screen.getByLabelText('Import data')
      fireEvent.click(importButton)

      // Get the error callback and call it
      const errorCallback = mockImportData.mock.calls[0]?.[1]
      errorCallback('Invalid file format')

      expect(alertSpy).toHaveBeenCalledWith('Import failed: Invalid file format')
      alertSpy.mockRestore()
    })

    it('shows prompt when Add Team button is clicked', () => {
      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('New Team')
      mockAddTeam.mockReturnValue({ success: true })

      render(<Header />)
      const addTeamButton = screen.getByLabelText('Add new team')
      fireEvent.click(addTeamButton)

      expect(promptSpy).toHaveBeenCalledWith('Enter team name:')
      expect(mockAddTeam).toHaveBeenCalledWith('New Team')
      promptSpy.mockRestore()
    })

    it('trims team name before adding', () => {
      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('  New Team  ')
      mockAddTeam.mockReturnValue({ success: true })

      render(<Header />)
      const addTeamButton = screen.getByLabelText('Add new team')
      fireEvent.click(addTeamButton)

      expect(mockAddTeam).toHaveBeenCalledWith('New Team')
      promptSpy.mockRestore()
    })

    it('does not add team when prompt is cancelled', () => {
      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null)

      render(<Header />)
      const addTeamButton = screen.getByLabelText('Add new team')
      fireEvent.click(addTeamButton)

      expect(mockAddTeam).not.toHaveBeenCalled()
      promptSpy.mockRestore()
    })

    it('does not add team when prompt is empty', () => {
      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('   ')

      render(<Header />)
      const addTeamButton = screen.getByLabelText('Add new team')
      fireEvent.click(addTeamButton)

      expect(mockAddTeam).not.toHaveBeenCalled()
      promptSpy.mockRestore()
    })

    it('shows alert when adding team fails', () => {
      const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('Duplicate Team')
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      mockAddTeam.mockReturnValue({
        success: false,
        error: 'Team name already exists',
      })

      render(<Header />)
      const addTeamButton = screen.getByLabelText('Add new team')
      fireEvent.click(addTeamButton)

      expect(alertSpy).toHaveBeenCalledWith('Error: Team name already exists')
      promptSpy.mockRestore()
      alertSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('has aria-label on timeline dropdown', () => {
      render(<Header />)
      const dropdown = screen.getByLabelText('Select timeline')
      expect(dropdown).toHaveAttribute('aria-label', 'Select timeline')
    })

    it('has aria-label on all buttons', () => {
      render(<Header />)
      expect(screen.getByLabelText('Add new timeline')).toHaveAttribute('aria-label')
      expect(screen.getByLabelText('Export data')).toHaveAttribute('aria-label')
      expect(screen.getByLabelText('Import data')).toHaveAttribute('aria-label')
      expect(screen.getByLabelText('Add new team')).toHaveAttribute('aria-label')
      expect(screen.getByLabelText('Add new task')).toHaveAttribute('aria-label')
    })

    it('has aria-hidden on decorative icons', () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      const icons = header.querySelectorAll('svg[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Styling', () => {
    it('has correct header background color', () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('bg-gray-900')
    })

    it('has correct text color', () => {
      render(<Header />)
      const header = screen.getByRole('banner')
      expect(header).toHaveClass('text-white')
    })
  })
})

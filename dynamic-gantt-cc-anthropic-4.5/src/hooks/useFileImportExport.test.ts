import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFileImportExport } from './useFileImportExport'
import type { AppData } from '../types'

describe('useFileImportExport', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock URL.createObjectURL and URL.revokeObjectURL
    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = vi.fn()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('exportData', () => {
    it('exports valid JSON data', () => {
      const { result } = renderHook(() => useFileImportExport())

      // Create a real anchor element with mock click
      const originalCreateElement = document.createElement.bind(document)
      const mockClick = vi.fn()

      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          const link = originalCreateElement('a')
          link.click = mockClick
          return link
        }
        return originalCreateElement(tagName as string)
      })

      const createObjectURLSpy = vi.fn(() => 'blob:mock-url')
      const revokeObjectURLSpy = vi.fn()

      URL.createObjectURL = createObjectURLSpy
      URL.revokeObjectURL = revokeObjectURLSpy

      const testData: AppData = {
        scenarios: [{ name: 'Test Scenario', tasks: [] }],
        activeScenario: 'Test Scenario',
        swimlanes: [],
      }

      result.current.exportData(testData)

      // Verify URL methods were called
      expect(createObjectURLSpy).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url')
    })

    it('adds exportDate to data', () => {
      const { result } = renderHook(() => useFileImportExport())

      let capturedBlob: Blob | null = null

      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          const link = originalCreateElement('a')
          link.click = vi.fn()
          return link
        }
        return originalCreateElement(tagName as string)
      })

      URL.createObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob
        return 'blob:mock-url'
      })
      URL.revokeObjectURL = vi.fn()

      const testData: AppData = {
        scenarios: [{ name: 'Test', tasks: [] }],
        activeScenario: 'Test',
        swimlanes: [],
      }

      result.current.exportData(testData)

      expect(capturedBlob).toBeDefined()
      expect(capturedBlob).toBeInstanceOf(Blob)
    })

    it('sets correct filename format', () => {
      const { result } = renderHook(() => useFileImportExport())

      let capturedLink: HTMLAnchorElement | null = null

      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          const link = originalCreateElement('a')
          link.click = vi.fn()
          capturedLink = link as HTMLAnchorElement
          return link
        }
        return originalCreateElement(tagName as string)
      })

      URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      URL.revokeObjectURL = vi.fn()

      const testData: AppData = {
        scenarios: [{ name: 'Test', tasks: [] }],
        activeScenario: 'Test',
        swimlanes: [],
      }

      result.current.exportData(testData)

      expect(capturedLink).toBeDefined()
      expect(capturedLink!.download).toMatch(/^timeline-data-\d{4}-\d{2}-\d{2}\.json$/)
    })

    it('throws error when export fails', () => {
      const { result } = renderHook(() => useFileImportExport())

      // Mock createElement to throw error
      vi.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('Mock error')
      })

      URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      URL.revokeObjectURL = vi.fn()

      const testData: AppData = {
        scenarios: [],
        activeScenario: 'Test',
        swimlanes: [],
      }

      expect(() => result.current.exportData(testData)).toThrow('Failed to export data')
    })
  })

  describe('importData', () => {
    it('successfully imports valid JSON data', async () => {
      const { result } = renderHook(() => useFileImportExport())

      const validData: AppData = {
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
        swimlanes: ['Engineering'],
      }

      const onSuccess = vi.fn()
      const onError = vi.fn()

      // Mock file input
      const mockInput = document.createElement('input')
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockInput)
      const appendChildSpy = vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      result.current.importData(onSuccess, onError)

      // Simulate file selection
      const mockFile = new File([JSON.stringify(validData)], 'test.json', {
        type: 'application/json',
      })

      const event = new Event('change')
      Object.defineProperty(mockInput, 'files', {
        value: [mockFile],
        writable: false,
      })

      mockInput.dispatchEvent(event)

      // Wait for FileReader to complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(onSuccess).toHaveBeenCalledWith(validData)
      expect(onError).not.toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalledWith(mockInput)
      expect(removeChildSpy).toHaveBeenCalledWith(mockInput)
      expect(createElementSpy).toHaveBeenCalledWith('input')
    })

    it('rejects invalid JSON format', async () => {
      const { result } = renderHook(() => useFileImportExport())

      const onSuccess = vi.fn()
      const onError = vi.fn()

      const mockInput = document.createElement('input')
      vi.spyOn(document, 'createElement').mockReturnValue(mockInput)
      vi.spyOn(document.body, 'appendChild')
      vi.spyOn(document.body, 'removeChild')

      result.current.importData(onSuccess, onError)

      // Simulate file with invalid JSON
      const mockFile = new File(['invalid json{{{'], 'test.json', {
        type: 'application/json',
      })

      const event = new Event('change')
      Object.defineProperty(mockInput, 'files', {
        value: [mockFile],
        writable: false,
      })

      mockInput.dispatchEvent(event)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith('Invalid JSON format')
    })

    it('rejects data with missing required fields', async () => {
      const { result } = renderHook(() => useFileImportExport())

      const invalidData = {
        scenarios: [],
        // Missing activeScenario and swimlanes
      }

      const onSuccess = vi.fn()
      const onError = vi.fn()

      const mockInput = document.createElement('input')
      vi.spyOn(document, 'createElement').mockReturnValue(mockInput)
      vi.spyOn(document.body, 'appendChild')
      vi.spyOn(document.body, 'removeChild')

      result.current.importData(onSuccess, onError)

      const mockFile = new File([JSON.stringify(invalidData)], 'test.json', {
        type: 'application/json',
      })

      const event = new Event('change')
      Object.defineProperty(mockInput, 'files', {
        value: [mockFile],
        writable: false,
      })

      mockInput.dispatchEvent(event)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalled()
      expect(onError.mock.calls[0]?.[0]).toContain('Missing or invalid')
    })

    it('rejects data with non-existent activeScenario', async () => {
      const { result } = renderHook(() => useFileImportExport())

      const invalidData: AppData = {
        scenarios: [{ name: 'Scenario 1', tasks: [] }],
        activeScenario: 'Non-existent',
        swimlanes: [],
      }

      const onSuccess = vi.fn()
      const onError = vi.fn()

      const mockInput = document.createElement('input')
      vi.spyOn(document, 'createElement').mockReturnValue(mockInput)
      vi.spyOn(document.body, 'appendChild')
      vi.spyOn(document.body, 'removeChild')

      result.current.importData(onSuccess, onError)

      const mockFile = new File([JSON.stringify(invalidData)], 'test.json', {
        type: 'application/json',
      })

      const event = new Event('change')
      Object.defineProperty(mockInput, 'files', {
        value: [mockFile],
        writable: false,
      })

      mockInput.dispatchEvent(event)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith(
        'Active scenario does not exist in scenarios list'
      )
    })

    it('rejects empty file', async () => {
      const { result } = renderHook(() => useFileImportExport())

      const onSuccess = vi.fn()
      const onError = vi.fn()

      const mockInput = document.createElement('input')
      vi.spyOn(document, 'createElement').mockReturnValue(mockInput)
      vi.spyOn(document.body, 'appendChild')
      vi.spyOn(document.body, 'removeChild')

      result.current.importData(onSuccess, onError)

      const mockFile = new File([''], 'test.json', {
        type: 'application/json',
      })

      const event = new Event('change')
      Object.defineProperty(mockInput, 'files', {
        value: [mockFile],
        writable: false,
      })

      mockInput.dispatchEvent(event)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith('File is empty')
    })

    it('handles no file selected', async () => {
      const { result } = renderHook(() => useFileImportExport())

      const onSuccess = vi.fn()
      const onError = vi.fn()

      const mockInput = document.createElement('input')
      vi.spyOn(document, 'createElement').mockReturnValue(mockInput)
      vi.spyOn(document.body, 'appendChild')
      vi.spyOn(document.body, 'removeChild')

      result.current.importData(onSuccess, onError)

      const event = new Event('change')
      Object.defineProperty(mockInput, 'files', {
        value: [],
        writable: false,
      })

      mockInput.dispatchEvent(event)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith('No file selected')
    })

    it('handles FileReader error', async () => {
      const { result } = renderHook(() => useFileImportExport())

      const onSuccess = vi.fn()
      const onError = vi.fn()

      const mockInput = document.createElement('input')
      vi.spyOn(document, 'createElement').mockReturnValue(mockInput)
      vi.spyOn(document.body, 'appendChild')
      const removeChildSpy = vi.spyOn(document.body, 'removeChild')

      result.current.importData(onSuccess, onError)

      const mockFile = new File(['test'], 'test.json', {
        type: 'application/json',
      })

      // Mock FileReader to trigger error
      const originalFileReader = globalThis.FileReader
      globalThis.FileReader = class MockFileReader {
        onload: ((event: ProgressEvent<FileReader>) => void) | null = null
        onerror: (() => void) | null = null
        readAsText() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror()
            }
          }, 0)
        }
      } as unknown as typeof FileReader

      const event = new Event('change')
      Object.defineProperty(mockInput, 'files', {
        value: [mockFile],
        writable: false,
      })

      mockInput.dispatchEvent(event)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith('Failed to read file')
      expect(removeChildSpy).toHaveBeenCalledWith(mockInput)

      // Restore FileReader
      globalThis.FileReader = originalFileReader
    })

    it('sets correct file input attributes', () => {
      const { result } = renderHook(() => useFileImportExport())

      const mockInput = document.createElement('input')
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(mockInput)
      const clickSpy = vi.spyOn(mockInput, 'click')
      vi.spyOn(document.body, 'appendChild')

      const onSuccess = vi.fn()
      const onError = vi.fn()

      result.current.importData(onSuccess, onError)

      expect(createElementSpy).toHaveBeenCalledWith('input')
      expect(mockInput.type).toBe('file')
      expect(mockInput.accept).toBe('.json,application/json')
      expect(mockInput.style.display).toBe('none')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('validates task references to swimlanes', async () => {
      const { result } = renderHook(() => useFileImportExport())

      const invalidData: AppData = {
        scenarios: [
          {
            name: 'Main',
            tasks: [
              {
                name: 'Task 1',
                swimlane: 'Non-existent Team',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue',
              },
            ],
          },
        ],
        activeScenario: 'Main',
        swimlanes: ['Engineering'],
      }

      const onSuccess = vi.fn()
      const onError = vi.fn()

      const mockInput = document.createElement('input')
      vi.spyOn(document, 'createElement').mockReturnValue(mockInput)
      vi.spyOn(document.body, 'appendChild')
      vi.spyOn(document.body, 'removeChild')

      result.current.importData(onSuccess, onError)

      const mockFile = new File([JSON.stringify(invalidData)], 'test.json', {
        type: 'application/json',
      })

      const event = new Event('change')
      Object.defineProperty(mockInput, 'files', {
        value: [mockFile],
        writable: false,
      })

      mockInput.dispatchEvent(event)

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalled()
      expect(onError.mock.calls[0]?.[0]).toContain('references non-existent swimlane')
    })
  })
})

import type { AppData } from '../types'
import { validateAppData } from '../utils/validation'

/**
 * Custom hook for file import/export functionality
 */
export function useFileImportExport() {
  /**
   * Exports app data to a JSON file
   * @param data - The app data to export
   */
  const exportData = (data: AppData): void => {
    try {
      // Add export date
      const dataWithDate: AppData = {
        ...data,
        exportDate: new Date().toISOString(),
      }

      // Serialize to JSON with 2-space indentation
      const jsonString = JSON.stringify(dataWithDate, null, 2)

      // Create Blob with JSON MIME type
      const blob = new Blob([jsonString], { type: 'application/json' })

      // Create temporary download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      link.download = `timeline-data-${date}.json`

      // Programmatically click to trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
      throw new Error('Failed to export data')
    }
  }

  /**
   * Imports app data from a JSON file
   * @param onSuccess - Callback function called with valid data
   * @param onError - Callback function called with error message
   */
  const importData = (
    onSuccess: (data: AppData) => void,
    onError: (error: string) => void
  ): void => {
    try {
      // Create hidden file input element
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,application/json'
      input.style.display = 'none'

      // Attach change handler
      input.onchange = (event: Event) => {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]

        if (!file) {
          onError('No file selected')
          return
        }

        // Read file using FileReader API
        const reader = new FileReader()

        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const content = e.target?.result as string

            if (!content) {
              onError('File is empty')
              return
            }

            // Parse JSON
            let parsedData: unknown
            try {
              parsedData = JSON.parse(content)
            } catch (parseError) {
              onError('Invalid JSON format')
              return
            }

            // Validate structure and business rules
            const validationError = validateAppData(parsedData)
            if (validationError) {
              onError(validationError)
              return
            }

            // Call success callback with validated data
            onSuccess(parsedData as AppData)
          } catch (error) {
            onError(
              error instanceof Error
                ? error.message
                : 'Unknown error occurred while processing file'
            )
          } finally {
            // Clean up input element
            document.body.removeChild(input)
          }
        }

        reader.onerror = () => {
          onError('Failed to read file')
          document.body.removeChild(input)
        }

        reader.readAsText(file)
      }

      // Add to DOM and trigger click
      document.body.appendChild(input)
      input.click()
    } catch (error) {
      console.error('Error importing data:', error)
      onError('Failed to open file picker')
    }
  }

  return {
    exportData,
    importData,
  }
}

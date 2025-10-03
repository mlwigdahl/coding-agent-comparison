import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { Modal } from './Modal'
import { useData } from '../../contexts/DataContext'

export interface TimelineModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * TimelineModal component - Modal for adding new timelines (scenarios)
 * Includes form validation and integration with DataContext
 */
export function TimelineModal({ isOpen, onClose }: TimelineModalProps) {
  const { addScenario } = useData()

  // Form state
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setError('')
    }
  }, [isOpen])

  const handleSave = () => {
    // Clear previous error
    setError('')

    // Validate name
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Timeline name is required')
      return
    }

    // Add scenario
    const result = addScenario(trimmedName)
    if (!result.success) {
      setError(result.error || 'Failed to save timeline')
      return
    }

    // Close modal on success
    onClose()
  }

  const handleCancel = () => {
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Clock size={24} className="text-gray-700" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">Add New Timeline</h2>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Timeline Name */}
          <div>
            <label htmlFor="timeline-name" className="block text-sm font-medium text-gray-700 mb-1">
              Timeline Name
            </label>
            <input
              id="timeline-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Enter timeline name"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end mt-6 gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Timeline
          </button>
        </div>
      </div>
    </Modal>
  )
}

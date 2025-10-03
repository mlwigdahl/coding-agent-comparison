import { useState, useEffect } from 'react'
import { Pen, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { useData } from '../../contexts/DataContext'
import { QUARTERS } from '../../constants'
import { compareQuarters } from '../../utils/quarters'
import type { Task, Quarter, ColorTheme } from '../../types'

export interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: Task // undefined = adding new task
  scenarioName: string
}

/**
 * TaskModal component - Modal for adding or editing tasks
 * Includes form validation and integration with DataContext
 */
export function TaskModal({ isOpen, onClose, task, scenarioName }: TaskModalProps) {
  const { addTask, updateTask, deleteTask, getAllTeamNames } = useData()

  // Form state
  const [name, setName] = useState('')
  const [swimlane, setSwimlane] = useState('')
  const [startQuarter, setStartQuarter] = useState<Quarter>('Q1 2025')
  const [endQuarter, setEndQuarter] = useState<Quarter>('Q1 2025')
  const [progress, setProgress] = useState(0)
  const [color, setColor] = useState<ColorTheme>('blue')
  const [error, setError] = useState('')

  const isEditing = task !== undefined
  const teams = getAllTeamNames()

  // Initialize form when modal opens or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Editing existing task
        setName(task.name)
        setSwimlane(task.swimlane)
        setStartQuarter(task.startQuarter)
        setEndQuarter(task.endQuarter)
        setProgress(task.progress)
        setColor(task.color)
      } else {
        // Adding new task - reset to defaults
        const currentTeams = getAllTeamNames()
        setName('')
        setSwimlane(currentTeams[0] || '')
        setStartQuarter('Q1 2025')
        setEndQuarter('Q1 2025')
        setProgress(0)
        setColor('blue')
      }
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task])

  const handleSave = () => {
    // Clear previous error
    setError('')

    // Validate name
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Task name is required')
      return
    }

    // Validate team
    if (!swimlane) {
      setError('Team is required')
      return
    }

    if (!teams.includes(swimlane)) {
      setError('Selected team does not exist')
      return
    }

    // Validate quarter range
    if (compareQuarters(startQuarter, endQuarter) > 0) {
      setError('Start quarter must be before or equal to end quarter')
      return
    }

    // Validate progress
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      setError('Progress must be an integer between 0 and 100')
      return
    }

    // Create task object
    const taskData: Task = {
      name: trimmedName,
      swimlane,
      startQuarter,
      endQuarter,
      progress,
      color,
    }

    // Save task
    let result
    if (isEditing && task) {
      result = updateTask(scenarioName, task.name, task.swimlane, taskData)
    } else {
      result = addTask(scenarioName, taskData)
    }

    if (!result.success) {
      setError(result.error || 'Failed to save task')
      return
    }

    // Close modal on success
    onClose()
  }

  const handleDelete = () => {
    if (!isEditing || !task) return

    const result = deleteTask(scenarioName, task.name, task.swimlane)
    if (!result.success) {
      setError(result.error || 'Failed to delete task')
      return
    }

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
          <Pen size={24} className="text-gray-700" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Task' : 'Add Task'}
          </h2>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Task Name */}
          <div>
            <label htmlFor="task-name" className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              id="task-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Enter task name"
            />
          </div>

          {/* Team */}
          <div>
            <label htmlFor="task-team" className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              id="task-team"
              value={swimlane}
              onChange={(e) => setSwimlane(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              disabled={teams.length === 0}
            >
              {teams.length === 0 ? (
                <option value="">No teams available</option>
              ) : (
                teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Start Quarter */}
          <div>
            <label htmlFor="task-start-quarter" className="block text-sm font-medium text-gray-700 mb-1">
              Start Quarter
            </label>
            <select
              id="task-start-quarter"
              value={startQuarter}
              onChange={(e) => setStartQuarter(e.target.value as Quarter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {QUARTERS.map((quarter) => (
                <option key={quarter} value={quarter}>
                  {quarter}
                </option>
              ))}
            </select>
          </div>

          {/* End Quarter */}
          <div>
            <label htmlFor="task-end-quarter" className="block text-sm font-medium text-gray-700 mb-1">
              End Quarter
            </label>
            <select
              id="task-end-quarter"
              value={endQuarter}
              onChange={(e) => setEndQuarter(e.target.value as Quarter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              {QUARTERS.map((quarter) => (
                <option key={quarter} value={quarter}>
                  {quarter}
                </option>
              ))}
            </select>
          </div>

          {/* Progress */}
          <div>
            <label htmlFor="task-progress" className="block text-sm font-medium text-gray-700 mb-1">
              Progress (%)
            </label>
            <input
              id="task-progress"
              type="number"
              min="0"
              max="100"
              step="1"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          {/* Color Theme */}
          <div>
            <label htmlFor="task-color" className="block text-sm font-medium text-gray-700 mb-1">
              Color Theme
            </label>
            <select
              id="task-color"
              value={color}
              onChange={(e) => setColor(e.target.value as ColorTheme)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="blue">Blue</option>
              <option value="indigo">Indigo</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <div>
            {isEditing && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Delete task"
              >
                <Trash2 size={18} aria-hidden="true" />
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
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
              {isEditing ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

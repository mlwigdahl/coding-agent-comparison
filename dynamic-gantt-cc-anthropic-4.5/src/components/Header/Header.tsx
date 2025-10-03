import { useState } from 'react'
import { Calendar, Download, Upload } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useFileImportExport } from '../../hooks/useFileImportExport'
import { TaskModal } from '../Modals/TaskModal'
import { TimelineModal } from '../Modals/TimelineModal'

/**
 * Header component - Top navigation bar with controls
 * Displays timeline selector, import/export buttons, and action buttons
 */
export function Header() {
  const { data, setActiveScenario, setData, addTeam } = useData()
  const { exportData, importData } = useFileImportExport()

  // Modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)

  const handleTimelineChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarioName = event.target.value
    setActiveScenario(scenarioName)
  }

  const handleNewTimeline = () => {
    setTimelineModalOpen(true)
  }

  const handleAddTask = () => {
    setTaskModalOpen(true)
  }

  const handleAddTeam = () => {
    const teamName = prompt('Enter team name:')
    if (teamName && teamName.trim()) {
      const trimmedName = teamName.trim()
      // Validation will be done in DataContext
      const result = addTeam(trimmedName)
      if (!result.success && result.error) {
        alert(`Error: ${result.error}`)
      }
    }
  }

  const handleExport = () => {
    exportData(data)
  }

  const handleImport = () => {
    importData(
      (importedData) => {
        setData(importedData)
      },
      (error) => {
        alert(`Import failed: ${error}`)
      }
    )
  }

  return (
    <header className="bg-gray-900 text-white py-4 px-6">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Calendar className="text-blue-500" size={24} aria-hidden="true" />
          <h1 className="text-xl font-bold whitespace-nowrap">
            Dynamic Project Timeline - Quarterly View
          </h1>
          <select
            value={data.activeScenario}
            onChange={handleTimelineChange}
            className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select timeline"
          >
            {data.scenarios.map((scenario) => (
              <option key={scenario.name} value={scenario.name}>
                {scenario.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleNewTimeline}
            className="text-blue-500 hover:text-blue-400 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            aria-label="Add new timeline"
            title="Add new timeline"
          >
            +
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm flex items-center gap-2 transition-colors"
            aria-label="Export data"
          >
            <Download size={16} aria-hidden="true" />
            Export
          </button>
          <button
            onClick={handleImport}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm flex items-center gap-2 transition-colors"
            aria-label="Import data"
          >
            <Upload size={16} aria-hidden="true" />
            Import
          </button>
          <button
            onClick={handleAddTeam}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
            aria-label="Add new team"
          >
            + Add Team
          </button>
          <button
            onClick={handleAddTask}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
            aria-label="Add new task"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Modals */}
      <TimelineModal
        isOpen={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
      />
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        scenarioName={data.activeScenario}
      />
    </header>
  )
}

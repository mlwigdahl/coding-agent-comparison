import { useState } from 'react'
import { TimelineHeader } from './TimelineHeader'
import { Swimlane } from '../Swimlane'
import { TaskModal } from '../Modals/TaskModal'
import { useData } from '../../contexts/DataContext'
import type { Task } from '../../types'

/**
 * Timeline component - Displays quarterly grid and swimlanes
 * Shows TimelineHeader and swimlanes for each team with tasks from active scenario
 */
export function Timeline() {
  const { data } = useData()
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  // Get active scenario
  const activeScenario = data.scenarios.find((s) => s.name === data.activeScenario)
  const tasks = activeScenario?.tasks || []

  // Group tasks by swimlane
  const tasksBySwimlane = new Map<string, Task[]>()
  for (const task of tasks) {
    const swimlaneTasks = tasksBySwimlane.get(task.swimlane) || []
    swimlaneTasks.push(task)
    tasksBySwimlane.set(task.swimlane, swimlaneTasks)
  }

  // Handle task click - open modal for editing
  const handleTaskClick = (task: Task) => {
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const handleCloseTaskModal = () => {
    setTaskModalOpen(false)
    setEditingTask(undefined)
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="min-w-max">
        <TimelineHeader />
        {data.swimlanes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No teams configured. Click "+ Add Team" to get started.
          </div>
        ) : (
          data.swimlanes.map((swimlane) => (
            <Swimlane
              key={swimlane}
              name={swimlane}
              tasks={tasksBySwimlane.get(swimlane) || []}
              onTaskClick={handleTaskClick}
            />
          ))
        )}
      </div>

      {/* Task Modal for editing */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={handleCloseTaskModal}
        task={editingTask}
        scenarioName={data.activeScenario}
      />
    </div>
  )
}

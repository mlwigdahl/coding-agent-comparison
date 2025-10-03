import { Task } from './Task'
import { stackTasks } from '../../utils/taskStacking'
import type { Task as TaskType } from '../../types'

export interface SwimlaneProps {
  name: string
  tasks: TaskType[]
  onTaskClick?: (task: TaskType) => void
}

/**
 * Swimlane component - Displays team name and all tasks for that team
 * Tasks are stacked vertically to avoid overlaps using the stackTasks algorithm
 */
export function Swimlane({ name, tasks, onTaskClick }: SwimlaneProps) {
  // Use stacking algorithm to assign rows to tasks
  const stackedTasks = stackTasks(tasks)

  // Calculate height based on maximum row count
  // Min height: 80px, each additional row adds 60px
  const maxRow = stackedTasks.reduce((max, task) => Math.max(max, task.row), -1)
  const rowCount = maxRow + 1
  const height = Math.max(80, rowCount * 60)

  const handleTaskClick = (task: TaskType) => {
    if (onTaskClick) {
      onTaskClick(task)
    }
  }

  return (
    <div
      className="border-b border-gray-200 relative"
      style={{ height: `${height}px` }}
    >
      <div className="grid" style={{ gridTemplateColumns: '200px repeat(16, 100px)' }}>
        {/* Team name column */}
        <div className="flex items-center p-4 border-r border-gray-300">
          <div>
            <span className="font-semibold text-gray-700">{name}</span>
            <span className="ml-1 text-gray-500">({tasks.length})</span>
          </div>
        </div>

        {/* Task area - spans all quarter columns */}
        <div className="relative col-span-16" style={{ height: `${height}px` }}>
          {stackedTasks.map((task) => (
            <Task
              key={task.name}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

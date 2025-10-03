import { getQuarterIndex } from '../../utils/quarters'
import { COLOR_THEMES, PROGRESS_BAR_COLOR } from '../../constants'
import type { StackedTask } from '../../types'

export interface TaskProps {
  task: StackedTask
  onClick: () => void
}

/**
 * Task component - Renders individual task graphic
 * Displays task as a pill-shaped element with name, progress, and progress bar
 */
export function Task({ task, onClick }: TaskProps) {
  // Calculate positioning based on quarters
  const startIndex = getQuarterIndex(task.startQuarter)
  const endIndex = getQuarterIndex(task.endQuarter)
  const quarterSpan = endIndex - startIndex + 1

  // Calculate position and width
  // Each quarter is 100px wide
  // Note: Task is positioned within the task container, which is already after the Teams column
  const left = startIndex * 100
  const width = quarterSpan * 100

  // Calculate vertical position based on row
  // Each row is 60px tall (50px task height + 10px gap)
  const top = task.row * 60

  // Determine color based on completion status
  const isCompleted = task.progress === 100
  const backgroundColor = isCompleted
    ? COLOR_THEMES[task.color].completed
    : COLOR_THEMES[task.color].uncompleted

  // Border color is darker shade
  const borderColor = COLOR_THEMES[task.color].completed

  return (
    <div
      className="absolute cursor-pointer transition-all hover:opacity-90"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: '50px',
        transitionDuration: '2s',
        transitionTimingFunction: 'ease-in-out',
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`Edit task: ${task.name}`}
    >
      <div
        className="relative h-full px-4 flex items-center justify-between overflow-hidden"
        style={{
          backgroundColor,
          borderRadius: '9999px',
          border: `2px solid ${borderColor}`,
        }}
      >
        {/* Task name - left-justified, truncate with ellipsis */}
        <span className="text-white font-medium truncate mr-2">{task.name}</span>

        {/* Progress percentage - right-justified */}
        <span className="text-white font-medium whitespace-nowrap">{task.progress}%</span>

        {/* Progress bar at bottom */}
        <div
          className="absolute bottom-0 left-0 h-1"
          style={{
            width: `${task.progress}%`,
            backgroundColor: PROGRESS_BAR_COLOR,
            borderBottomLeftRadius: '9999px',
            borderBottomRightRadius: task.progress === 100 ? '9999px' : '0',
          }}
        />
      </div>
    </div>
  )
}

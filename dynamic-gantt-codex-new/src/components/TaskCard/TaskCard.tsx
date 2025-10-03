import clsx from 'clsx'
import { forwardRef, type CSSProperties, type KeyboardEvent } from 'react'
import type { TaskColor } from '@/models/task'
import styles from './TaskCard.module.css'

type TaskCardProps = {
  name: string
  progress: number
  color: TaskColor
  style?: CSSProperties
  className?: string
  onClick?: () => void
}

const TASK_THEME: Record<
  TaskColor,
  { base: string; border: string; complete: string; borderComplete: string }
> = {
  blue: {
    base: '#3b82f6',
    border: '#1d4ed8',
    complete: '#1e40af',
    borderComplete: '#1e3a8a',
  },
  indigo: {
    base: '#6366f1',
    border: '#4f46e5',
    complete: '#3730a3',
    borderComplete: '#312e81',
  },
}

const clampProgress = (value: number) => Math.min(100, Math.max(0, Math.round(value)))

const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ name, progress, color, style, className, onClick }, ref) => {
    const normalizedProgress = clampProgress(progress)
    const theme = TASK_THEME[color]
    const isComplete = normalizedProgress >= 100

    const cardStyle = {
      ...style,
      '--task-background': isComplete ? theme.complete : theme.base,
      '--task-border': isComplete ? theme.borderComplete : theme.border,
    } as CSSProperties

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) {
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onClick()
      }
    }

    return (
      <div
        className={clsx(styles.card, className)}
        style={cardStyle}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        ref={ref}
      >
        <div className={styles.content}>
          <span className={styles.name}>{name}</span>
          <span className={styles.progress}>{normalizedProgress}%</span>
        </div>
        <div className={styles.progressBar} aria-hidden="true">
        <div
          className={styles.progressIndicator}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  )
  },
)

TaskCard.displayName = 'TaskCard'

export default TaskCard

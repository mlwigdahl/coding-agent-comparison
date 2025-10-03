import { type CSSProperties, useLayoutEffect, useRef } from 'react'
import type { Task } from '@/models/task'
import { DEFAULT_TIMELINE_QUARTERS, DEFAULT_TIMELINE_RANGE, quarterToIndex } from '@/utils/quarter'
import useTaskStacking, { type StackedTask } from '@/hooks/useTaskStacking'
import useFlipAnimation from '@/hooks/useFlipAnimation'
import TaskCard from '@/components/TaskCard/TaskCard'
import styles from './TaskLane.module.css'

const TIMELINE_START_INDEX = quarterToIndex(DEFAULT_TIMELINE_RANGE.start)
const QUARTER_COUNT = DEFAULT_TIMELINE_QUARTERS.length

const clampColumn = (value: number) => {
  if (value < 1) return 1
  if (value > QUARTER_COUNT) return QUARTER_COUNT
  return value
}

const BASE_LANE_HEIGHT = 72
const ROW_PADDING = 16 * 2 // padding top+bottom (1rem each)
const LANE_GAP = 12 // 0.75rem

const calculateRowHeight = (stacked: StackedTask[]): number => {
  const laneCount = stacked.length > 0 ? Math.max(...stacked.map((item) => item.laneIndex)) + 1 : 1
  const gapTotal = Math.max(0, laneCount - 1) * LANE_GAP
  return laneCount * BASE_LANE_HEIGHT + gapTotal + ROW_PADDING
}

type TaskLaneProps = {
  tasks: Task[]
  onTaskClick?: (taskId: string) => void
  stackedTasksOverride?: StackedTask[]
  minHeight?: number
}

const TaskLane = ({ tasks, onTaskClick, stackedTasksOverride, minHeight }: TaskLaneProps) => {
  const computedStack = useTaskStacking(tasks)
  const stackedTasks = stackedTasksOverride ?? computedStack
  const { register, recordPositions, play } = useFlipAnimation()
  const hasRenderedRef = useRef(false)

  const effectiveMinHeight = minHeight ?? calculateRowHeight(stackedTasks)

  const laneStyle = {
    '--quarter-count': QUARTER_COUNT,
    minHeight: `${effectiveMinHeight}px`,
  } as CSSProperties

  useLayoutEffect(() => {
    if (hasRenderedRef.current) {
      play()
    }
  }, [stackedTasks, play])

  useLayoutEffect(() => {
    recordPositions()
    hasRenderedRef.current = true
  }, [stackedTasks, recordPositions])

  return (
    <div className={styles.laneGrid} style={laneStyle}>
      {DEFAULT_TIMELINE_QUARTERS.map((_, index) => {
        if (index % 4 !== 0 || index === 0) {
          return null
        }
        const dividerStyle: CSSProperties = {
          left: `calc(${(index / QUARTER_COUNT) * 100}% - 0.5px)`,
        }
        return <span key={`divider-${index}`} className={styles.yearDivider} style={dividerStyle} />
      })}

      {stackedTasks.map(({ task, laneIndex, startIndex, endIndex }) => {
        const columnStartRaw = startIndex - TIMELINE_START_INDEX + 1
        const columnEndRaw = endIndex - TIMELINE_START_INDEX + 1

        const columnStart = clampColumn(columnStartRaw)
        const columnEnd = clampColumn(columnEndRaw)
        const span = Math.max(1, columnEnd - columnStart + 1)

        const wrapperStyle: CSSProperties = {
          gridColumn: `${columnStart} / span ${span}`,
          gridRow: laneIndex + 1,
        }

        return (
          <div
            key={task.id}
            className={styles.taskWrapper}
            style={wrapperStyle}
            ref={register(task.name)}
          >
            <TaskCard
              name={task.name}
              progress={task.progress}
              color={task.color}
              onClick={onTaskClick ? () => onTaskClick(task.id) : undefined}
            />
          </div>
        )
      })}
    </div>
  )
}

export default TaskLane

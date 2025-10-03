import { createPortal } from 'react-dom'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ChangeEvent,
} from 'react'
import clsx from 'clsx'

import Icon from '@/components/Icons/Icon'
import { useAppState } from '@/context/AppStateContext'
import type { TaskColor } from '@/models/task'
import {
  DEFAULT_TIMELINE_QUARTERS,
  DEFAULT_TIMELINE_RANGE,
  formatQuarterLabel,
  parseQuarterLabel,
} from '@/utils/quarter'
import { ValidationError } from '@/utils/validation'
import { logError } from '@/utils/logger'
import useFocusTrap from '@/hooks/useFocusTrap'
import styles from './TaskModal.module.css'

const quarterLabels = DEFAULT_TIMELINE_QUARTERS.map(formatQuarterLabel)
const defaultQuarterLabel = formatQuarterLabel(DEFAULT_TIMELINE_RANGE.start)

const colorOptions: Array<{ value: TaskColor; label: string }> = [
  { value: 'blue', label: 'Blue' },
  { value: 'indigo', label: 'Indigo' },
]

type TaskModalMode = 'add' | 'edit'

type TaskModalProps = {
  isOpen: boolean
  mode: TaskModalMode
  taskId?: string
  onClose: () => void
}

const getQuarterIndex = (label: string) => quarterLabels.findIndex((candidate) => candidate === label)

const TaskModal = ({ isOpen, mode, taskId, onClose }: TaskModalProps) => {
  const {
    state: { teams, order, activeTimelineId, tasks },
    addTask,
    updateTask,
    deleteTask,
  } = useAppState()

  const task = mode === 'edit' && taskId ? tasks[taskId] : undefined

  const defaultTeamId = useMemo(() => order.teamIds[0] ?? '', [order.teamIds])

  const [name, setName] = useState('')
  const [teamId, setTeamId] = useState(defaultTeamId)
  const [startQuarter, setStartQuarter] = useState(defaultQuarterLabel)
  const [endQuarter, setEndQuarter] = useState(defaultQuarterLabel)
  const [progress, setProgress] = useState('0')
  const [color, setColor] = useState<TaskColor>('blue')
  const [errorMessage, setErrorMessage] = useState('')

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const firstFieldRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (mode === 'edit' && task) {
      setName(task.name)
      setTeamId(task.teamId)
      setStartQuarter(formatQuarterLabel(task.startQuarter))
      setEndQuarter(formatQuarterLabel(task.endQuarter))
      setProgress(String(task.progress))
      setColor(task.color)
    } else {
      setName('')
      setTeamId(defaultTeamId)
      setStartQuarter(defaultQuarterLabel)
      setEndQuarter(defaultQuarterLabel)
      setProgress('0')
      setColor('blue')
    }

    setErrorMessage('')
  }, [isOpen, mode, task, defaultTeamId])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const timeout = window.setTimeout(() => {
      firstFieldRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useFocusTrap(dialogRef, isOpen)

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose()
      }
    },
    [onClose],
  )

  const handleStartQuarterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value
    setStartQuarter(nextValue)

    const startIndex = getQuarterIndex(nextValue)
    const endIndex = getQuarterIndex(endQuarter)

    if (startIndex !== -1 && endIndex !== -1 && startIndex > endIndex) {
      setEndQuarter(nextValue)
    }
  }

  const handleEndQuarterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setEndQuarter(event.target.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isOpen) {
      return
    }

    setErrorMessage('')

    if (!teamId) {
      setErrorMessage('Please select a team for this task.')
      return
    }

    if (!activeTimelineId) {
      setErrorMessage('No active timeline selected. Please create or choose a timeline first.')
      return
    }

    const trimmedName = name.trim()
    const progressValue = Number.parseInt(progress, 10)

    try {
      if (mode === 'add') {
        addTask({
          timelineId: activeTimelineId,
          teamId,
          name: trimmedName,
          progress: Number.isNaN(progressValue) ? 0 : progressValue,
          startQuarter: parseQuarterLabel(startQuarter),
          endQuarter: parseQuarterLabel(endQuarter),
          color,
        })
      } else if (task) {
        updateTask({
          id: task.id,
          teamId,
          name: trimmedName,
          progress: Number.isNaN(progressValue) ? task.progress : progressValue,
          startQuarter: parseQuarterLabel(startQuarter),
          endQuarter: parseQuarterLabel(endQuarter),
          color,
        })
      }

      onClose()
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Something went wrong while saving the task.')
        logError('Task save failed', error)
      }
    }
  }

  const handleDelete = () => {
    if (!task) {
      return
    }

    try {
      deleteTask(task.id)
      onClose()
    } catch (error) {
      setErrorMessage('Unable to delete task. Please try again.')
      logError('Task delete failed', error)
    }
  }

  const isSaveDisabled = !teamId || !name.trim()

  if (!isOpen) {
    return null
  }

  const headingId = 'task-modal-heading'
  const descriptionId = 'task-modal-description'

  return createPortal(
    <div className={styles.backdrop} role="presentation" onClick={handleBackdropClick}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <Icon
            name={mode === 'edit' ? 'pen' : 'plus'}
            variant="solid"
            className={styles.headerIcon}
          />
          <div>
            <h2 id={headingId} className={styles.title}>
              {mode === 'edit' ? 'Edit Task' : 'Add Task'}
            </h2>
            <p id={descriptionId} className={styles.description}>
              {mode === 'edit'
                ? 'Update the details of this task or remove it from the timeline.'
                : 'Fill out the details below to add a new task to the active timeline.'}
            </p>
          </div>
        </div>

        {order.teamIds.length === 0 ? (
          <>
            <p className={styles.emptyState}>
              Create a team before adding tasks so you can assign ownership and track progress.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                className={clsx(styles.button, styles.secondaryButton)}
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {errorMessage ? (
              <div role="alert" className={styles.error}>
                {errorMessage}
              </div>
            ) : null}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="task-name">
                Task Name
              </label>
              <input
                id="task-name"
                ref={firstFieldRef}
                className={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter task name"
              />
            </div>

            <div className={clsx(styles.field)}>
              <label className={styles.label} htmlFor="task-team">
                Team
              </label>
              <select
                id="task-team"
                className={styles.select}
                value={teamId}
                onChange={(event) => setTeamId(event.target.value)}
              >
                <option value="" disabled>
                  Select a team
                </option>
                {order.teamIds.map((id) => {
                  const team = teams[id]
                  if (!team) {
                    return null
                  }
                  return (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className={clsx(styles.row, styles.rowTwo)}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="task-start">
                  Start Quarter
                </label>
                <select
                  id="task-start"
                  className={styles.select}
                  value={startQuarter}
                  onChange={handleStartQuarterChange}
                >
                  {quarterLabels.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="task-end">
                  End Quarter
                </label>
                <select
                  id="task-end"
                  className={styles.select}
                  value={endQuarter}
                  onChange={handleEndQuarterChange}
                >
                  {quarterLabels.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className={styles.helperText}>
                  Tasks must finish on or after the selected start quarter.
                </span>
              </div>
            </div>

            <div className={clsx(styles.row, styles.rowTwo)}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="task-progress">
                  Progress (%)
                </label>
                <input
                  id="task-progress"
                  className={styles.input}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(event) => setProgress(event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="task-color">
                  Color Theme
                </label>
                <select
                  id="task-color"
                  className={styles.select}
                  value={color}
                  onChange={(event) => setColor(event.target.value as TaskColor)}
                >
                  {colorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.actions}>
              {mode === 'edit' ? (
                <button
                  type="button"
                  className={clsx(styles.button, styles.dangerButton)}
                  onClick={handleDelete}
                >
                  <Icon name="trash" className={styles.iconButton} />
                  Delete
                </button>
              ) : null}
              <button type="button" className={clsx(styles.button, styles.secondaryButton)} onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={clsx(styles.button, styles.primaryButton)}
                disabled={isSaveDisabled}
              >
                {mode === 'edit' ? 'Update Task' : 'Add Task'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default TaskModal

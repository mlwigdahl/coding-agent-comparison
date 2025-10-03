import { useCallback, useRef, useState } from 'react'
import Header from '@/components/Header/Header'
import TimelineGrid from '@/components/TimelineGrid/TimelineGrid'
import TaskModal from '@/components/Modals/TaskModal'
import TeamModal from '@/components/Modals/TeamModal'
import TimelineModal from '@/components/Modals/TimelineModal'
import { logError, logInfo } from '@/utils/logger'
import { useAppState } from '@/context/AppStateContext'
import { normalizeImportedData, parseImportedData, serializeAppState } from '@/utils/file'
import { ValidationError } from '@/utils/validation'
import styles from './App.module.css'

type TaskModalState = {
  mode: 'add' | 'edit'
  taskId?: string
} | null

const App = () => {
  const { state, replaceState } = useAppState()
  const [taskModalState, setTaskModalState] = useState<TaskModalState>(null)
  const [isTeamModalOpen, setTeamModalOpen] = useState(false)
  const [isTimelineModalOpen, setTimelineModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleAddTimeline = useCallback(() => {
    logInfo('Requested to add a new timeline')
    setTimelineModalOpen(true)
  }, [])

  const handleAddTeam = useCallback(() => {
    logInfo('Requested to add a new team')
    setTeamModalOpen(true)
  }, [])

  const handleAddTask = useCallback(() => {
    logInfo('Requested to add a new task')
    setTaskModalState({ mode: 'add' })
  }, [])

  const handleImport = useCallback(() => {
    logInfo('Requested to import timeline data')
    fileInputRef.current?.click()
  }, [])

  const handleExport = useCallback(() => {
    const data = serializeAppState(state)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dynamic-project-timeline-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [state])

  const handleTaskClick = useCallback((taskId: string) => {
    setTaskModalState({ mode: 'edit', taskId })
  }, [])

  const handleCloseTaskModal = useCallback(() => {
    setTaskModalState(null)
  }, [])

  const handleCloseTeamModal = useCallback(() => {
    setTeamModalOpen(false)
  }, [])

  const handleCloseTimelineModal = useCallback(() => {
    setTimelineModalOpen(false)
  }, [])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) {
        return
      }

      try {
        const text = await file.text()
        const raw = JSON.parse(text)
        const parsed = parseImportedData(raw)
        const { state: normalized } = normalizeImportedData(parsed)
        replaceState(normalized)
        setImportError(null)
      } catch (error) {
        if (error instanceof ValidationError) {
          setImportError(error.message)
        } else if (error instanceof SyntaxError) {
          setImportError('Unable to parse the selected file. Please provide a valid export JSON file.')
        } else {
          setImportError('Unable to import timeline data.')
          logError('Import failed', error)
        }
      }
    },
    [replaceState],
  )

  return (
    <div>
      <Header
        onAddTimeline={handleAddTimeline}
        onAddTeam={handleAddTeam}
        onAddTask={handleAddTask}
        onImport={handleImport}
        onExport={handleExport}
      />
      <main>
        <TimelineGrid onTaskClick={handleTaskClick} />
      </main>
      <TaskModal
        isOpen={taskModalState !== null}
        mode={taskModalState?.mode ?? 'add'}
        taskId={taskModalState?.taskId}
        onClose={handleCloseTaskModal}
      />
      <TeamModal isOpen={isTeamModalOpen} onClose={handleCloseTeamModal} />
      <TimelineModal isOpen={isTimelineModalOpen} onClose={handleCloseTimelineModal} />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {importError ? (
        <div role="alert" className={styles.importAlert}>
          {importError}
        </div>
      ) : null}
    </div>
  )
}

export default App

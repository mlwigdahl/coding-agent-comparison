import { Fragment, type ChangeEvent } from 'react'
import Icon from '@/components/Icons/Icon'
import { useAppState } from '@/context/AppStateContext'
import styles from './Header.module.css'

export type HeaderProps = {
  onAddTimeline: () => void
  onAddTeam: () => void
  onAddTask: () => void
  onImport: () => void
  onExport: () => void
}

const Header = ({ onAddTimeline, onAddTeam, onAddTask, onImport, onExport }: HeaderProps) => {
  const {
    state: { timelines, order, activeTimelineId },
    setActiveTimeline,
  } = useAppState()

  const handleTimelineChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value
    if (nextId && nextId !== activeTimelineId) {
      setActiveTimeline(nextId)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.leftGroup}>
        <div className={styles.brand}>
          <Icon name="calendar" variant="solid" className={styles.brandIcon} />
          <h1 className={styles.title}>Dynamic Project Timeline - Quarterly View</h1>
        </div>
        <div className={styles.timelineControls}>
          <label className={styles.visuallyHidden} htmlFor="timeline-select">
            Timeline
          </label>
          <div className={styles.timelineSelectWrapper}>
            <select
              id="timeline-select"
              className={styles.timelineSelect}
              value={activeTimelineId}
              onChange={handleTimelineChange}
            >
              {order.timelineIds.length === 0 ? (
                <option value="" disabled>
                  No timelines available
                </option>
              ) : (
                order.timelineIds.map((timelineId) => {
                  const timeline = timelines[timelineId]
                  if (!timeline) {
                    return <Fragment key={timelineId} />
                  }

                  return (
                    <option key={timeline.id} value={timeline.id}>
                      {timeline.name}
                    </option>
                  )
                })
              )}
            </select>
            <Icon name="clock" className={styles.timelineCaret} />
          </div>
          <button type="button" className={styles.addTimelineButton} onClick={onAddTimeline}>
            <Icon name="plus" variant="solid" className={styles.actionIcon} />
            <span className={styles.visuallyHidden}>Add timeline</span>
          </button>
        </div>
      </div>
      <div className={styles.actionGroup}>
        <button type="button" className={styles.actionButton} onClick={onExport}>
          <Icon name="download" className={styles.actionIcon} />
          Export
        </button>
        <button type="button" className={styles.actionButton} onClick={onImport}>
          <Icon name="download" className={styles.actionIcon} />
          Import
        </button>
        <button
          type="button"
          className={`${styles.actionButton} ${styles.primaryAction}`}
          onClick={onAddTeam}
        >
          <Icon name="plus" variant="solid" className={styles.actionIcon} />
          + Add Team
        </button>
        <button
          type="button"
          className={`${styles.actionButton} ${styles.primaryAction}`}
          onClick={onAddTask}
        >
          <Icon name="plus" variant="solid" className={styles.actionIcon} />
          + Add Task
        </button>
      </div>
    </header>
  )
}

export default Header

import QuarterHeader from './QuarterHeader'
import TeamLanes from './TeamLanes'
import styles from './TimelineGrid.module.css'

type TimelineGridProps = {
  onTaskClick?: (taskId: string) => void
}

const TimelineGrid = ({ onTaskClick }: TimelineGridProps = {}) => {
  return (
    <section className={styles.grid} aria-label="Project timeline grid">
      <QuarterHeader />
      <TeamLanes onTaskClick={onTaskClick} />
    </section>
  )
}

export default TimelineGrid

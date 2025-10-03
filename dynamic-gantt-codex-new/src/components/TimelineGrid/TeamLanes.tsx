import { Fragment, useMemo } from 'react'
import { useAppState } from '@/context/AppStateContext'
import TaskLane from '@/components/TaskLane/TaskLane'
import styles from './TimelineGrid.module.css'

type TeamLanesProps = {
  onTaskClick?: (taskId: string) => void
}

const TeamLanes = ({ onTaskClick }: TeamLanesProps) => {
  const {
    state: { teams, order, activeTimelineId, timelines, tasks },
  } = useAppState()

  const teamRows = useMemo(() => {
    const activeTimeline = timelines[activeTimelineId]
    const tasksInActiveTimeline = (activeTimeline?.taskIds ?? [])
      .map((taskId) => tasks[taskId])
      .filter((task): task is NonNullable<typeof task> => Boolean(task))

    return order.teamIds
      .map((teamId) => {
        const team = teams[teamId]
        if (!team) {
          return null
        }

        const teamTasks = tasksInActiveTimeline.filter((task) => task.teamId === team.id)

        return {
          id: team.id,
          name: team.name,
          tasks: teamTasks,
        }
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
  }, [teams, order.teamIds, timelines, activeTimelineId, tasks])

  return (
    <div className={styles.body}>
      {teamRows.map((team) => (
        <Fragment key={team.id}>
          <div className={styles.teamCell}>
            <h2>
              {team.name}
              <span>({team.tasks.length})</span>
            </h2>
          </div>
          <div className={styles.laneCell}>
            <TaskLane tasks={team.tasks} onTaskClick={onTaskClick} />
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export default TeamLanes

import { v4 as uuidv4 } from 'uuid'

import type { AppState } from '@/context/AppStateContext'
import type { Task } from '@/models/task'
import type { Team } from '@/models/team'
import type { Timeline } from '@/models/timeline'
import { formatQuarterLabel, parseQuarterLabel } from '@/utils/quarter'
import { ValidationError } from '@/utils/validation'

export type ExportedTask = {
  name: string
  swimlane: string
  startQuarter: string
  endQuarter: string
  progress: number
  color: Task['color']
}

export type ExportedTimeline = {
  name: string
  tasks: ExportedTask[]
}

export type ExportedData = {
  scenarios: ExportedTimeline[]
  activeScenario: string
  swimlanes: string[]
  exportDate: string
}

type ImportPayload = ExportedData

const mapTasksForTimeline = (
  timeline: Timeline,
  tasks: Record<string, Task>,
  teams: Record<string, Team>,
): ExportedTask[] => {
  return timeline.taskIds
    .map((taskId) => tasks[taskId])
    .filter((task): task is Task => Boolean(task))
    .map((task) => {
      const team = teams[task.teamId]

      return {
        name: task.name,
        swimlane: team?.name ?? 'Unassigned',
        startQuarter: formatQuarterLabel(task.startQuarter),
        endQuarter: formatQuarterLabel(task.endQuarter),
        progress: task.progress,
        color: task.color,
      }
    })
}

export const serializeAppState = (state: AppState): ExportedData => {
  const scenarios: ExportedTimeline[] = state.order.timelineIds
    .map((timelineId) => state.timelines[timelineId])
    .filter((timeline): timeline is Timeline => Boolean(timeline))
    .map((timeline) => ({
      name: timeline.name,
      tasks: mapTasksForTimeline(timeline, state.tasks, state.teams),
    }))

  const swimlanes = state.order.teamIds
    .map((teamId) => state.teams[teamId]?.name)
    .filter((name): name is string => Boolean(name))

  const activeTimelineName = state.timelines[state.activeTimelineId]?.name ?? ''

  return {
    scenarios,
    activeScenario: activeTimelineName,
    swimlanes,
    exportDate: new Date().toISOString(),
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const assertString = (value: unknown, message: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(message)
  }
  return value
}

const assertNumber = (value: unknown, message: string): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new ValidationError(message)
  }
  return parsed
}

const validateExportedTask = (rawTask: unknown): ExportedTask => {
  if (!isRecord(rawTask)) {
    throw new ValidationError('Invalid task entry in import file')
  }

  const name = assertString(rawTask.name, 'Task name must be a non-empty string')
  const swimlane = assertString(rawTask.swimlane, 'Task swimlane must be a non-empty string')
  const startQuarter = assertString(
    rawTask.startQuarter,
    'Task startQuarter must be a valid quarter string',
  )
  const endQuarter = assertString(rawTask.endQuarter, 'Task endQuarter must be a valid quarter string')
  const progress = assertNumber(rawTask.progress, 'Task progress must be a number between 0 and 100')
  const color = assertString(rawTask.color, 'Task color is required')

  if (progress < 0 || progress > 100) {
    throw new ValidationError('Task progress must be between 0 and 100')
  }

  if (color !== 'blue' && color !== 'indigo') {
    throw new ValidationError('Task color must be "blue" or "indigo"')
  }

  parseQuarterLabel(startQuarter)
  parseQuarterLabel(endQuarter)

  return {
    name,
    swimlane,
    startQuarter,
    endQuarter,
    progress,
    color,
  }
}

const validateExportedTimeline = (rawTimeline: unknown): ExportedTimeline => {
  if (!isRecord(rawTimeline)) {
    throw new ValidationError('Invalid timeline entry in import file')
  }

  const name = assertString(rawTimeline.name, 'Timeline name must be a non-empty string')

  const rawTasks = Array.isArray(rawTimeline.tasks)
    ? rawTimeline.tasks
    : (() => {
        throw new ValidationError('Timeline tasks must be an array')
      })()

  const tasks = rawTasks.map(validateExportedTask)

  return { name, tasks }
}

export const parseImportedData = (raw: unknown): ImportPayload => {
  if (!isRecord(raw)) {
    throw new ValidationError('Import file is not in the expected format')
  }

  const scenarios = Array.isArray(raw.scenarios)
    ? raw.scenarios.map(validateExportedTimeline)
    : (() => {
        throw new ValidationError('Import file must include scenarios array')
      })()

  const activeScenario = assertString(raw.activeScenario, 'Import file missing active scenario name')

  const swimlanes = Array.isArray(raw.swimlanes)
    ? raw.swimlanes.map((value) => assertString(value, 'Swimlane names must be strings'))
    : (() => {
        throw new ValidationError('Import file must include swimlanes array')
      })()

  const exportDate = assertString(raw.exportDate, 'Import file missing export date')

  return {
    scenarios,
    activeScenario,
    swimlanes,
    exportDate,
  }
}

type NormalizedState = {
  state: AppState
}

export const normalizeImportedData = (data: ImportPayload): NormalizedState => {
  const timelineIdByName = new Map<string, string>()
  const teamIdByName = new Map<string, string>()
  const taskIdByName = new Map<string, string>()

  const timelines: Record<string, Timeline> = {}
  const teams: Record<string, Team> = {}
  const tasks: Record<string, Task> = {}

  const order = {
    timelineIds: [] as string[],
    teamIds: [] as string[],
  }

  data.swimlanes.forEach((swimlane) => {
    const id = `team-${uuidv4()}`
    teamIdByName.set(swimlane, id)
    teams[id] = {
      id,
      name: swimlane,
      color: '#3b82f6',
      taskIds: [],
    }
    order.teamIds.push(id)
  })

  data.scenarios.forEach((scenario) => {
    const timelineId = `timeline-${uuidv4()}`
    timelineIdByName.set(scenario.name, timelineId)

    const timelineTasks: string[] = []

    scenario.tasks.forEach((task) => {
      const taskId = `task-${uuidv4()}`
      taskIdByName.set(task.name, taskId)

      const teamId = teamIdByName.get(task.swimlane) ?? teamIdByName.get(data.swimlanes[0] ?? '')
      if (!teamId) {
        throw new ValidationError(`Swimlane ${task.swimlane} not found in import data`)
      }

      const normalizedTask: Task = {
        id: taskId,
        name: task.name,
        teamId,
        progress: task.progress,
        startQuarter: parseQuarterLabel(task.startQuarter),
        endQuarter: parseQuarterLabel(task.endQuarter),
        color: task.color,
      }

      tasks[taskId] = normalizedTask
      timelineTasks.push(taskId)
      teams[teamId] = {
        ...teams[teamId],
        taskIds: [...teams[teamId].taskIds, taskId],
      }
    })

    timelines[timelineId] = {
      id: timelineId,
      name: scenario.name,
      taskIds: timelineTasks,
    }

    order.timelineIds.push(timelineId)
  })

  const activeTimelineName = data.activeScenario
  const activeTimelineId = timelineIdByName.get(activeTimelineName) ?? order.timelineIds[0] ?? ''

  return {
    state: {
      timelines,
      tasks,
      teams,
      activeTimelineId,
      order,
    },
  }
}

/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { Task, TaskColor, TaskMap } from '@/models/task'
import type { Team, TeamMap } from '@/models/team'
import type { Timeline, TimelineMap } from '@/models/timeline'
import type { Quarter } from '@/utils/quarter'
import {
  validateTeamName,
  validateTimelineName,
  validateTaskPayload,
} from '@/utils/validation'
import useLocalStorage from '@/hooks/useLocalStorage'
import { seedState } from '@/data/seed'

const APP_STORAGE_KEY = 'dynamic-project-timeline-state-v1'

type OrderState = {
  timelineIds: string[]
  teamIds: string[]
}

export interface AppState {
  timelines: TimelineMap
  tasks: TaskMap
  teams: TeamMap
  activeTimelineId: string
  order: OrderState
}

type AddTaskPayload = {
  timelineId: string
  teamId: string
  name: string
  progress: number
  startQuarter: Quarter
  endQuarter: Quarter
  color: TaskColor
}

type UpdateTaskPayload = {
  id: string
  timelineId?: string
  teamId?: string
  name?: string
  progress?: number
  startQuarter?: Quarter
  endQuarter?: Quarter
  color?: TaskColor
}

type AppAction =
  | { type: 'ADD_TIMELINE'; payload: { name: string } }
  | { type: 'UPDATE_TIMELINE'; payload: { id: string; name: string } }
  | { type: 'DELETE_TIMELINE'; payload: { id: string } }
  | { type: 'SET_ACTIVE_TIMELINE'; payload: { id: string } }
  | { type: 'ADD_TEAM'; payload: { name: string } }
  | { type: 'UPDATE_TEAM'; payload: { id: string; name: string } }
  | { type: 'DELETE_TEAM'; payload: { id: string } }
  | { type: 'ADD_TASK'; payload: AddTaskPayload }
  | { type: 'UPDATE_TASK'; payload: UpdateTaskPayload }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'REPLACE_STATE'; payload: AppState }

type AppStateContextValue = {
  state: AppState
  addTimeline: (name: string) => void
  updateTimeline: (id: string, name: string) => void
  deleteTimeline: (id: string) => void
  setActiveTimeline: (id: string) => void
  addTeam: (name: string) => void
  updateTeam: (id: string, name: string) => void
  deleteTeam: (id: string) => void
  addTask: (payload: AddTaskPayload) => void
  updateTask: (payload: UpdateTaskPayload) => void
  deleteTask: (id: string) => void
  replaceState: (state: AppState) => void
  resetState: () => void
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

const cloneState = (state: AppState): AppState =>
  JSON.parse(JSON.stringify(state)) as AppState

export const createInitialState = (): AppState => cloneState(seedState as AppState)

const removeFromArray = <T,>(items: T[], target: T): T[] => items.filter((item) => item !== target)

const addToArray = <T,>(items: T[], target: T): T[] =>
  (items.includes(target) ? [...items] : [...items, target])

const collectTimelineNames = (state: AppState, excludeId?: string): string[] =>
  state.order.timelineIds
    .filter((id) => id !== excludeId)
    .map((id) => state.timelines[id]?.name)
    .filter((name): name is string => Boolean(name))

const collectTeamNames = (state: AppState, excludeId?: string): string[] =>
  state.order.teamIds
    .filter((id) => id !== excludeId)
    .map((id) => state.teams[id]?.name)
    .filter((name): name is string => Boolean(name))

const collectTaskNamesForContext = (
  state: AppState,
  timelineId: string,
  teamId: string,
  excludeId?: string,
): string[] => {
  const timeline = state.timelines[timelineId]
  if (!timeline) {
    return []
  }

  return timeline.taskIds
    .map((taskId) => state.tasks[taskId])
    .filter((task): task is Task => Boolean(task) && task.teamId === teamId && task.id !== excludeId)
    .map((task) => task.name)
}

const findTimelineIdsForTask = (timelines: TimelineMap, taskId: string): string[] =>
  Object.values(timelines)
    .filter((timeline) => timeline.taskIds.includes(taskId))
    .map((timeline) => timeline.id)

const removeTaskFromAllTimelines = (timelines: TimelineMap, taskId: string): TimelineMap => {
  let result: TimelineMap | null = null

  for (const timeline of Object.values(timelines)) {
    if (!timeline.taskIds.includes(taskId)) {
      continue
    }

    if (result === null) {
      result = { ...timelines }
    }

    result[timeline.id] = {
      ...timeline,
      taskIds: timeline.taskIds.filter((id) => id !== taskId),
    }
  }

  return result ?? timelines
}

const deleteTasks = (state: AppState, taskIds: string[]): Pick<AppState, 'tasks' | 'timelines' | 'teams'> => {
  let tasks: TaskMap | null = null
  let timelines: TimelineMap | null = null
  let teams: TeamMap | null = null

  for (const taskId of taskIds) {
    const task = state.tasks[taskId]
    if (!task) {
      continue
    }

    if (tasks === null) {
      tasks = { ...state.tasks }
    }
    delete tasks[taskId]

    if (timelines === null) {
      timelines = { ...state.timelines }
    }
    timelines = removeTaskFromAllTimelines(timelines, taskId)

    if (teams === null) {
      teams = { ...state.teams }
    }

    const team = teams[task.teamId]
    if (team) {
      teams[task.teamId] = {
        ...team,
        taskIds: team.taskIds.filter((id) => id !== taskId),
      }
    }
  }

  return {
    tasks: tasks ?? state.tasks,
    timelines: timelines ?? state.timelines,
    teams: teams ?? state.teams,
  }
}

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TIMELINE': {
      const name = validateTimelineName(action.payload.name, collectTimelineNames(state))
      const id = uuidv4()
      const timeline: Timeline = {
        id,
        name,
        taskIds: [],
      }

      const timelines = { ...state.timelines, [id]: timeline }
      const order: OrderState = {
        ...state.order,
        timelineIds: [...state.order.timelineIds, id],
      }
      return {
        ...state,
        timelines,
        order,
        activeTimelineId: id,
      }
    }

    case 'UPDATE_TIMELINE': {
      const { id, name } = action.payload
      const timeline = state.timelines[id]
      if (!timeline) {
        throw new Error('Timeline not found')
      }

      const validatedName = validateTimelineName(name, collectTimelineNames(state, id))

      return {
        ...state,
        timelines: {
          ...state.timelines,
          [id]: {
            ...timeline,
            name: validatedName,
          },
        },
      }
    }

    case 'DELETE_TIMELINE': {
      const { id } = action.payload
      const timeline = state.timelines[id]
      if (!timeline) {
        throw new Error('Timeline not found')
      }

      const order: OrderState = {
        ...state.order,
        timelineIds: state.order.timelineIds.filter((timelineId) => timelineId !== id),
      }

      const tasksCleanup = deleteTasks(state, timeline.taskIds)
      const timelines = { ...tasksCleanup.timelines }
      delete timelines[id]

      const activeTimelineId =
        state.activeTimelineId === id ? order.timelineIds[0] ?? '' : state.activeTimelineId

      return {
        ...state,
        timelines,
        tasks: tasksCleanup.tasks,
        teams: tasksCleanup.teams,
        order,
        activeTimelineId,
      }
    }

    case 'SET_ACTIVE_TIMELINE': {
      const { id } = action.payload
      if (!state.timelines[id]) {
        throw new Error('Timeline not found')
      }

      return {
        ...state,
        activeTimelineId: id,
      }
    }

    case 'ADD_TEAM': {
      const name = validateTeamName(action.payload.name, collectTeamNames(state))
      const id = uuidv4()
      const team: Team = {
        id,
        name,
        color: '#1f2937',
        taskIds: [],
      }

      return {
        ...state,
        teams: {
          ...state.teams,
          [id]: team,
        },
        order: {
          ...state.order,
          teamIds: [...state.order.teamIds, id],
        },
      }
    }

    case 'UPDATE_TEAM': {
      const { id, name } = action.payload
      const team = state.teams[id]
      if (!team) {
        throw new Error('Team not found')
      }

      const validatedName = validateTeamName(name, collectTeamNames(state, id))

      return {
        ...state,
        teams: {
          ...state.teams,
          [id]: {
            ...team,
            name: validatedName,
          },
        },
      }
    }

    case 'DELETE_TEAM': {
      const { id } = action.payload
      const team = state.teams[id]
      if (!team) {
        throw new Error('Team not found')
      }

      const { tasks, timelines, teams } = deleteTasks(state, team.taskIds)
      const remainingTeams = { ...teams }
      delete remainingTeams[id]

      return {
        ...state,
        tasks,
        timelines,
        teams: remainingTeams,
        order: {
          ...state.order,
          teamIds: state.order.teamIds.filter((teamId) => teamId !== id),
        },
      }
    }

    case 'ADD_TASK': {
      const { timelineId, teamId, name, progress, startQuarter, endQuarter, color } = action.payload

      const timeline = state.timelines[timelineId]
      if (!timeline) {
        throw new Error('Timeline not found')
      }

      const team = state.teams[teamId]
      if (!team) {
        throw new Error('Team not found')
      }

      const { name: validatedName } = validateTaskPayload({
        name,
        existingTaskNames: collectTaskNamesForContext(state, timelineId, teamId),
        progress,
        startQuarter,
        endQuarter,
      })

      const id = uuidv4()
      const task: Task = {
        id,
        teamId,
        name: validatedName,
        progress,
        startQuarter,
        endQuarter,
        color,
      }

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [id]: task,
        },
        timelines: {
          ...state.timelines,
          [timelineId]: {
            ...timeline,
            taskIds: addToArray(timeline.taskIds, id),
          },
        },
        teams: {
          ...state.teams,
          [teamId]: {
            ...team,
            taskIds: addToArray(team.taskIds, id),
          },
        },
      }
    }

    case 'UPDATE_TASK': {
      const { id } = action.payload
      const task = state.tasks[id]
      if (!task) {
        throw new Error('Task not found')
      }

      const nextTimelineId = action.payload.timelineId ?? findTimelineIdsForTask(state.timelines, id)[0]
      if (!nextTimelineId) {
        throw new Error('Task is not assigned to a timeline')
      }

      const timeline = state.timelines[nextTimelineId]
      if (!timeline) {
        throw new Error('Timeline not found')
      }

      const nextTeamId = action.payload.teamId ?? task.teamId
      const nextTeam = state.teams[nextTeamId]
      if (!nextTeam) {
        throw new Error('Team not found')
      }

      const nextName = action.payload.name ?? task.name
      const nextProgress = action.payload.progress ?? task.progress
      const nextStart = action.payload.startQuarter ?? task.startQuarter
      const nextEnd = action.payload.endQuarter ?? task.endQuarter
      const nextColor = action.payload.color ?? task.color

      const { name: validatedName } = validateTaskPayload({
        name: nextName,
        existingTaskNames: collectTaskNamesForContext(state, nextTimelineId, nextTeamId, id),
        progress: nextProgress,
        startQuarter: nextStart,
        endQuarter: nextEnd,
      })

      const updatedTask: Task = {
        ...task,
        name: validatedName,
        progress: nextProgress,
        startQuarter: nextStart,
        endQuarter: nextEnd,
        color: nextColor,
        teamId: nextTeamId,
      }

      const currentTimelineIds = findTimelineIdsForTask(state.timelines, id)
      const currentTimelineId = currentTimelineIds[0]

      let timelines = state.timelines
      if (currentTimelineId && currentTimelineId !== nextTimelineId) {
        const sourceTimeline = state.timelines[currentTimelineId]
        const destinationTimeline = state.timelines[nextTimelineId]

        timelines = {
          ...state.timelines,
          [currentTimelineId]: {
            ...sourceTimeline,
            taskIds: removeFromArray(sourceTimeline.taskIds, id),
          },
          [nextTimelineId]: {
            ...destinationTimeline,
            taskIds: addToArray(destinationTimeline.taskIds, id),
          },
        }
      } else if (currentTimelineId) {
        timelines = {
          ...state.timelines,
          [currentTimelineId]: {
            ...state.timelines[currentTimelineId],
          },
        }
      }

      const teams = (() => {
        if (task.teamId === nextTeamId) {
          return {
            ...state.teams,
            [nextTeamId]: {
              ...nextTeam,
              taskIds: addToArray(nextTeam.taskIds, id),
            },
          }
        }

        const previousTeam = state.teams[task.teamId]
        return {
          ...state.teams,
          [task.teamId]: {
            ...previousTeam,
            taskIds: removeFromArray(previousTeam.taskIds, id),
          },
          [nextTeamId]: {
            ...nextTeam,
            taskIds: addToArray(nextTeam.taskIds, id),
          },
        }
      })()

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [id]: updatedTask,
        },
        timelines,
        teams,
      }
    }

    case 'DELETE_TASK': {
      const { id } = action.payload
      if (!state.tasks[id]) {
        return state
      }

      const { tasks, timelines, teams } = deleteTasks(state, [id])

      return {
        ...state,
        tasks,
        timelines,
        teams,
      }
    }

    case 'REPLACE_STATE': {
      return cloneState(action.payload)
    }

    default:
      return state
  }
}

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const { read, write } = useLocalStorage<AppState>(APP_STORAGE_KEY, createInitialState)

  const initialStateRef = useRef<AppState | null>(null)
  if (initialStateRef.current === null) {
    initialStateRef.current = read()
  }

  const [state, dispatch] = useReducer(appReducer, initialStateRef.current as AppState)

  useEffect(() => {
    write(state)
  }, [state, write])

  const actions = useMemo(
    () => ({
      addTimeline: (name: string) => dispatch({ type: 'ADD_TIMELINE', payload: { name } }),
      updateTimeline: (id: string, name: string) =>
        dispatch({ type: 'UPDATE_TIMELINE', payload: { id, name } }),
      deleteTimeline: (id: string) => dispatch({ type: 'DELETE_TIMELINE', payload: { id } }),
      setActiveTimeline: (id: string) =>
        dispatch({ type: 'SET_ACTIVE_TIMELINE', payload: { id } }),
      addTeam: (name: string) => dispatch({ type: 'ADD_TEAM', payload: { name } }),
      updateTeam: (id: string, name: string) => dispatch({ type: 'UPDATE_TEAM', payload: { id, name } }),
      deleteTeam: (id: string) => dispatch({ type: 'DELETE_TEAM', payload: { id } }),
      addTask: (payload: AddTaskPayload) => dispatch({ type: 'ADD_TASK', payload }),
      updateTask: (payload: UpdateTaskPayload) => dispatch({ type: 'UPDATE_TASK', payload }),
      deleteTask: (id: string) => dispatch({ type: 'DELETE_TASK', payload: { id } }),
      replaceState: (newState: AppState) => dispatch({ type: 'REPLACE_STATE', payload: newState }),
      resetState: () => dispatch({ type: 'REPLACE_STATE', payload: createInitialState() }),
    }),
    [dispatch],
  )

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      ...actions,
    }),
    [state, actions],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}

export default AppStateContext

export type { AppStateContextValue, AddTaskPayload, UpdateTaskPayload }

import { describe, expect, it } from 'vitest'

import { appReducer, createInitialState, type AppState } from './AppStateContext'
import { ValidationError } from '@/utils/validation'

describe('AppState reducer', () => {
  const pickQuarterRange = (state: AppState) => {
    const [firstTimelineId] = state.order.timelineIds
    const firstTaskId = state.timelines[firstTimelineId]?.taskIds[0]
    const task = firstTaskId ? state.tasks[firstTaskId] : undefined

    if (!task) {
      throw new Error('Seed data must include at least one task')
    }

    return {
      start: task.startQuarter,
      end: task.endQuarter,
    }
  }

  it('adds a new timeline with a unique name', () => {
    const initialState = createInitialState()
    const nextState = appReducer(initialState, {
      type: 'ADD_TIMELINE',
      payload: { name: 'Product Launch' },
    })

    expect(nextState.order.timelineIds).toHaveLength(initialState.order.timelineIds.length + 1)
    const addedTimelineId = nextState.order.timelineIds.at(-1)
    expect(addedTimelineId).toBeDefined()
    expect(nextState.timelines[addedTimelineId!]?.name).toBe('Product Launch')
    expect(nextState.activeTimelineId).toBe(addedTimelineId)
  })

  it('prevents duplicate timeline names', () => {
    const initialState = createInitialState()

    expect(() =>
      appReducer(initialState, {
        type: 'ADD_TIMELINE',
        payload: { name: 'Main Timeline' },
      }),
    ).toThrow(ValidationError)
  })

  it('rejects tasks with progress outside of the allowed range', () => {
    const initialState = createInitialState()
    const [timelineId] = initialState.order.timelineIds
    const [teamId] = initialState.order.teamIds
    const { start, end } = pickQuarterRange(initialState)

    expect(() =>
      appReducer(initialState, {
        type: 'ADD_TASK',
        payload: {
          timelineId,
          teamId,
          name: 'Invalid Progress Task',
          progress: 150,
          startQuarter: start,
          endQuarter: end,
          color: 'blue',
        },
      }),
    ).toThrow('Progress must be between 0 and 100')
  })

  it('removes a team and associated tasks', () => {
    const initialState = createInitialState()
    const [teamId] = initialState.order.teamIds
    const teamTaskIds = initialState.teams[teamId].taskIds

    const nextState = appReducer(initialState, {
      type: 'DELETE_TEAM',
      payload: { id: teamId },
    })

    expect(nextState.teams[teamId]).toBeUndefined()
    expect(nextState.order.teamIds).not.toContain(teamId)
    teamTaskIds.forEach((taskId) => {
      expect(nextState.tasks[taskId]).toBeUndefined()
    })
  })
})

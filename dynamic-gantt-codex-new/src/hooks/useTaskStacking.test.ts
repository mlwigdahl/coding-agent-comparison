import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { parseQuarterLabel } from '@/utils/quarter'
import useTaskStacking from './useTaskStacking'

const createTask = (id: string, start: string, end: string) => ({
  id,
  name: `Task ${id}`,
  teamId: 'team-1',
  progress: 0,
  startQuarter: parseQuarterLabel(start),
  endQuarter: parseQuarterLabel(end),
  color: 'blue' as const,
})

describe('useTaskStacking', () => {
  it('assigns tasks to the same lane when there is no overlap', () => {
    const tasks = [
      createTask('1', 'Q1 2025', 'Q1 2025'),
      createTask('2', 'Q2 2025', 'Q2 2025'),
    ]

    const { result } = renderHook(() => useTaskStacking(tasks))

    expect(result.current).toHaveLength(2)
    result.current.forEach((stacked) => {
      expect(stacked.laneIndex).toBe(0)
    })
  })

  it('stacks overlapping tasks into additional lanes', () => {
    const tasks = [
      createTask('a', 'Q1 2025', 'Q2 2025'),
      createTask('b', 'Q2 2025', 'Q3 2025'),
      createTask('c', 'Q3 2025', 'Q4 2025'),
    ]

    const { result } = renderHook(() => useTaskStacking(tasks))

    const lanes = result.current.map((stacked) => ({ id: stacked.task.id, lane: stacked.laneIndex }))

    expect(lanes).toEqual([
      { id: 'a', lane: 0 },
      { id: 'b', lane: 1 },
      { id: 'c', lane: 0 },
    ])
  })
})

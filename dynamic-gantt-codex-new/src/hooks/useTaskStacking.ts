import { useMemo } from 'react'
import type { Task } from '@/models/task'
import { quarterToIndex } from '@/utils/quarter'

export type StackedTask = {
  task: Task
  laneIndex: number
  startIndex: number
  endIndex: number
}

export const stackTasks = (tasks: Task[]): StackedTask[] => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const startDiff = quarterToIndex(a.startQuarter) - quarterToIndex(b.startQuarter)
    if (startDiff !== 0) {
      return startDiff
    }
    return quarterToIndex(a.endQuarter) - quarterToIndex(b.endQuarter)
  })

  const laneEndIndexes: number[] = []

  return sortedTasks.map((task) => {
    const startIndex = quarterToIndex(task.startQuarter)
    const endIndex = quarterToIndex(task.endQuarter)

    const laneIndex = (() => {
      for (let lane = 0; lane < laneEndIndexes.length; lane += 1) {
        if (startIndex > laneEndIndexes[lane]) {
          laneEndIndexes[lane] = endIndex
          return lane
        }
      }

      laneEndIndexes.push(endIndex)
      return laneEndIndexes.length - 1
    })()

    return {
      task,
      laneIndex,
      startIndex,
      endIndex,
    }
  })
}

const useTaskStacking = (tasks: Task[]): StackedTask[] => {
  return useMemo(() => stackTasks(tasks), [tasks])
}

export default useTaskStacking

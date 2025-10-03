import type { Task, StackedTask } from '../types'
import { getQuarterIndex, compareQuarters } from './quarters'

/**
 * Stacks tasks within a swimlane to avoid overlaps
 * Uses a greedy algorithm to minimize the number of rows needed
 *
 * @param tasks - Array of tasks to stack
 * @returns Array of tasks with row assignments
 */
export function stackTasks(tasks: Task[]): StackedTask[] {
  if (tasks.length === 0) {
    return []
  }

  // Sort tasks: by start quarter first, then by duration (longer first)
  // This greedy approach helps minimize the number of rows
  const sortedTasks = [...tasks].sort((a, b) => {
    const startComparison = compareQuarters(a.startQuarter, b.startQuarter)
    if (startComparison !== 0) {
      return startComparison
    }
    // If same start, put longer tasks first to optimize packing
    const aDuration =
      getQuarterIndex(a.endQuarter) - getQuarterIndex(a.startQuarter)
    const bDuration =
      getQuarterIndex(b.endQuarter) - getQuarterIndex(b.startQuarter)
    return bDuration - aDuration
  })

  // Track occupied ranges for each row
  // Each row stores an array of [startIndex, endIndex] ranges
  const rows: Array<Array<[number, number]>> = []
  const stackedTasks: StackedTask[] = []

  for (const task of sortedTasks) {
    const startIndex = getQuarterIndex(task.startQuarter)
    const endIndex = getQuarterIndex(task.endQuarter)

    // Find first available row where task doesn't overlap
    let assignedRow = -1
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const rowRanges = rows[rowIndex]
      if (!rowRanges) continue // Should never happen, but TypeScript needs this

      let hasOverlap = false

      for (const [rangeStart, rangeEnd] of rowRanges) {
        // Two ranges overlap if: start1 <= end2 AND start2 <= end1
        if (startIndex <= rangeEnd && rangeStart <= endIndex) {
          hasOverlap = true
          break
        }
      }

      if (!hasOverlap) {
        assignedRow = rowIndex
        break
      }
    }

    // If no available row found, create new row
    if (assignedRow === -1) {
      assignedRow = rows.length
      rows.push([])
    }

    // Record occupied range in assigned row
    rows[assignedRow]!.push([startIndex, endIndex])

    // Add task with row assignment
    stackedTasks.push({
      ...task,
      row: assignedRow,
    })
  }

  return stackedTasks
}

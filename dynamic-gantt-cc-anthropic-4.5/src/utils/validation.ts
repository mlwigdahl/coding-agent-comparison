import type { Quarter, Task, Scenario } from '../types'
import { QUARTERS } from '../constants'
import { compareQuarters } from './quarters'

/**
 * Validates a task name
 * @param name - The task name to validate
 * @param existingNames - Array of existing task names to check for duplicates
 * @returns Error message if invalid, null if valid
 */
export function validateTaskName(
  name: string,
  existingNames: string[] = []
): string | null {
  if (!name || name.trim().length === 0) {
    return 'Task name is required'
  }

  if (name !== name.trim()) {
    return 'Task name must not have leading or trailing whitespace'
  }

  if (existingNames.includes(name)) {
    return 'Task name must be unique'
  }

  return null
}

/**
 * Validates a team name
 * @param name - The team name to validate
 * @param existingNames - Array of existing team names to check for duplicates
 * @returns Error message if invalid, null if valid
 */
export function validateTeamName(
  name: string,
  existingNames: string[] = []
): string | null {
  if (!name || name.trim().length === 0) {
    return 'Team name is required'
  }

  if (name !== name.trim()) {
    return 'Team name must not have leading or trailing whitespace'
  }

  if (existingNames.includes(name)) {
    return 'Team name must be unique'
  }

  return null
}

/**
 * Validates a scenario/timeline name
 * @param name - The scenario name to validate
 * @param existingNames - Array of existing scenario names to check for duplicates
 * @returns Error message if invalid, null if valid
 */
export function validateScenarioName(
  name: string,
  existingNames: string[] = []
): string | null {
  if (!name || name.trim().length === 0) {
    return 'Timeline name is required'
  }

  if (name !== name.trim()) {
    return 'Timeline name must not have leading or trailing whitespace'
  }

  if (existingNames.includes(name)) {
    return 'Timeline name must be unique'
  }

  return null
}

/**
 * Validates a task progress percentage
 * @param progress - The progress value to validate
 * @returns Error message if invalid, null if valid
 */
export function validateProgress(progress: number): string | null {
  if (typeof progress !== 'number' || isNaN(progress)) {
    return 'Progress must be a number'
  }

  if (!Number.isInteger(progress)) {
    return 'Progress must be an integer'
  }

  if (progress < 0 || progress > 100) {
    return 'Progress must be between 0 and 100'
  }

  return null
}

/**
 * Validates a quarter range (start must be <= end)
 * @param start - Starting quarter
 * @param end - Ending quarter
 * @returns Error message if invalid, null if valid
 */
export function validateQuarterRange(
  start: Quarter,
  end: Quarter
): string | null {
  if (!QUARTERS.includes(start)) {
    return 'Start quarter is invalid'
  }

  if (!QUARTERS.includes(end)) {
    return 'End quarter is invalid'
  }

  if (compareQuarters(start, end) > 0) {
    return 'Start quarter must be before or equal to end quarter'
  }

  return null
}

/**
 * Type guard to check if a value is a valid Quarter
 */
function isValidQuarter(value: unknown): value is Quarter {
  return typeof value === 'string' && QUARTERS.includes(value as Quarter)
}

/**
 * Type guard to check if a value is a valid Task
 */
function isValidTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const task = value as Record<string, unknown>

  return (
    typeof task.name === 'string' &&
    typeof task.swimlane === 'string' &&
    isValidQuarter(task.startQuarter) &&
    isValidQuarter(task.endQuarter) &&
    typeof task.progress === 'number' &&
    (task.color === 'blue' || task.color === 'indigo')
  )
}

/**
 * Type guard to check if a value is a valid Scenario
 */
function isValidScenario(value: unknown): value is Scenario {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const scenario = value as Record<string, unknown>

  return (
    typeof scenario.name === 'string' &&
    Array.isArray(scenario.tasks) &&
    scenario.tasks.every(isValidTask)
  )
}

/**
 * Validates complete AppData structure (for import validation)
 * @param data - The data to validate
 * @returns Error message if invalid, null if valid
 */
export function validateAppData(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return 'Data must be an object'
  }

  const appData = data as Record<string, unknown>

  // Check required fields exist
  if (!Array.isArray(appData.scenarios)) {
    return 'Missing or invalid scenarios array'
  }

  if (typeof appData.activeScenario !== 'string') {
    return 'Missing or invalid activeScenario'
  }

  if (!Array.isArray(appData.swimlanes)) {
    return 'Missing or invalid swimlanes array'
  }

  // Validate scenarios
  if (!appData.scenarios.every(isValidScenario)) {
    return 'One or more scenarios are invalid'
  }

  const scenarios = appData.scenarios as Scenario[]
  const swimlanes = appData.swimlanes as string[]

  // Check activeScenario exists
  if (!scenarios.some((s) => s.name === appData.activeScenario)) {
    return 'Active scenario does not exist in scenarios list'
  }

  // Validate scenario names are unique
  const scenarioNames = scenarios.map((s) => s.name)
  if (new Set(scenarioNames).size !== scenarioNames.length) {
    return 'Scenario names must be unique'
  }

  // Validate swimlanes are unique
  if (new Set(swimlanes).size !== swimlanes.length) {
    return 'Swimlane names must be unique'
  }

  // Collect all unique task names across all scenarios
  const allTaskNames = new Set<string>()
  for (const scenario of scenarios) {
    for (const task of scenario.tasks) {
      // Validate task swimlane exists
      if (!swimlanes.includes(task.swimlane)) {
        return `Task "${task.name}" references non-existent swimlane "${task.swimlane}"`
      }

      // Validate task name has no leading/trailing whitespace
      if (task.name !== task.name.trim()) {
        return `Task name "${task.name}" has leading or trailing whitespace`
      }

      // Track task names
      allTaskNames.add(task.name)

      // Validate progress
      const progressError = validateProgress(task.progress)
      if (progressError) {
        return `Task "${task.name}": ${progressError}`
      }

      // Validate quarter range
      const quarterError = validateQuarterRange(
        task.startQuarter,
        task.endQuarter
      )
      if (quarterError) {
        return `Task "${task.name}": ${quarterError}`
      }
    }
  }

  // Validate task names are unique within (scenario, team) pairs
  for (const scenario of scenarios) {
    // Group tasks by swimlane
    const tasksByTeam = new Map<string, string[]>()
    for (const task of scenario.tasks) {
      if (!tasksByTeam.has(task.swimlane)) {
        tasksByTeam.set(task.swimlane, [])
      }
      tasksByTeam.get(task.swimlane)!.push(task.name)
    }

    // Check for duplicate names within each team
    for (const [_team, names] of tasksByTeam) {
      if (new Set(names).size !== names.length) {
        return `Task names must be unique within each team in scenario "${scenario.name}"`
      }
    }
  }

  // Validate swimlane names have no leading/trailing whitespace
  for (const swimlane of swimlanes) {
    if (swimlane !== swimlane.trim()) {
      return `Swimlane name "${swimlane}" has leading or trailing whitespace`
    }
  }

  // Validate scenario names have no leading/trailing whitespace
  for (const scenario of scenarios) {
    if (scenario.name !== scenario.name.trim()) {
      return `Scenario name "${scenario.name}" has leading or trailing whitespace`
    }
  }

  return null
}

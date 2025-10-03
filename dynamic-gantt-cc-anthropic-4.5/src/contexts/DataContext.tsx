import React, { createContext, useContext, useCallback } from 'react'
import type { AppData, Task, Scenario } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEY, DEFAULT_APP_DATA } from '../constants'
import {
  validateTaskName,
  validateTeamName,
  validateScenarioName,
} from '../utils/validation'

interface DataContextValue {
  data: AppData
  setData: (data: AppData) => void
  addTask: (scenarioName: string, task: Task) => { success: boolean; error?: string }
  updateTask: (scenarioName: string, oldName: string, oldSwimlane: string, newTask: Task) => { success: boolean; error?: string }
  deleteTask: (scenarioName: string, taskName: string, swimlane: string) => { success: boolean; error?: string }
  addScenario: (name: string) => { success: boolean; error?: string }
  setActiveScenario: (name: string) => { success: boolean; error?: string }
  addTeam: (name: string) => { success: boolean; error?: string }
  getAllTaskNames: () => string[]
  getAllTeamNames: () => string[]
  getAllScenarioNames: () => string[]
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

interface DataProviderProps {
  children: React.ReactNode
}

export function DataProvider({ children }: DataProviderProps): JSX.Element {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, DEFAULT_APP_DATA)

  const getAllTaskNames = useCallback((): string[] => {
    const taskNames = new Set<string>()
    for (const scenario of data.scenarios) {
      for (const task of scenario.tasks) {
        taskNames.add(task.name)
      }
    }
    return Array.from(taskNames)
  }, [data])

  const getAllTeamNames = useCallback((): string[] => {
    return [...data.swimlanes]
  }, [data])

  const getAllScenarioNames = useCallback((): string[] => {
    return data.scenarios.map((s) => s.name)
  }, [data])

  const addTask = useCallback(
    (scenarioName: string, task: Task): { success: boolean; error?: string } => {
      // Find scenario
      const scenarioIndex = data.scenarios.findIndex((s) => s.name === scenarioName)
      if (scenarioIndex === -1) {
        return { success: false, error: `Scenario "${scenarioName}" not found` }
      }

      const scenario = data.scenarios[scenarioIndex]
      if (!scenario) {
        return { success: false, error: 'Scenario not found' }
      }

      // Validate team exists
      if (!data.swimlanes.includes(task.swimlane)) {
        return { success: false, error: `Team "${task.swimlane}" does not exist` }
      }

      // Validate task name is unique within this scenario AND team
      const existingTaskNamesInTeam = scenario.tasks
        .filter((t) => t.swimlane === task.swimlane)
        .map((t) => t.name)
      const nameError = validateTaskName(task.name, existingTaskNamesInTeam)
      if (nameError) {
        return { success: false, error: nameError }
      }

      // Add task to scenario
      const newScenarios = [...data.scenarios]
      newScenarios[scenarioIndex] = {
        ...scenario,
        tasks: [...scenario.tasks, task],
      }

      setData({
        ...data,
        scenarios: newScenarios,
      })

      return { success: true }
    },
    [data, setData]
  )

  const updateTask = useCallback(
    (scenarioName: string, oldName: string, oldSwimlane: string, newTask: Task): { success: boolean; error?: string } => {
      // Find scenario
      const scenarioIndex = data.scenarios.findIndex((s) => s.name === scenarioName)
      if (scenarioIndex === -1) {
        return { success: false, error: `Scenario "${scenarioName}" not found` }
      }

      const scenario = data.scenarios[scenarioIndex]
      if (!scenario) {
        return { success: false, error: 'Scenario not found' }
      }

      // Find task in scenario by name AND swimlane
      const taskIndex = scenario.tasks.findIndex((t) => t.name === oldName && t.swimlane === oldSwimlane)
      if (taskIndex === -1) {
        return { success: false, error: `Task "${oldName}" not found in team "${oldSwimlane}"` }
      }

      // Validate team exists
      if (!data.swimlanes.includes(newTask.swimlane)) {
        return { success: false, error: `Team "${newTask.swimlane}" does not exist` }
      }

      // Validate new task name is unique within the new team (excluding the old task)
      const existingTaskNamesInTeam = scenario.tasks
        .filter((t) => t.swimlane === newTask.swimlane)
        .filter((t) => !(t.name === oldName && t.swimlane === oldSwimlane))
        .map((t) => t.name)
      const nameError = validateTaskName(newTask.name, existingTaskNamesInTeam)
      if (nameError) {
        return { success: false, error: nameError }
      }

      // Update task in this scenario only
      const newScenarios = [...data.scenarios]
      newScenarios[scenarioIndex] = {
        ...scenario,
        tasks: scenario.tasks.map((t) =>
          (t.name === oldName && t.swimlane === oldSwimlane) ? newTask : t
        ),
      }

      setData({
        ...data,
        scenarios: newScenarios,
      })

      return { success: true }
    },
    [data, setData]
  )

  const deleteTask = useCallback(
    (scenarioName: string, taskName: string, swimlane: string): { success: boolean; error?: string } => {
      // Find scenario
      const scenarioIndex = data.scenarios.findIndex((s) => s.name === scenarioName)
      if (scenarioIndex === -1) {
        return { success: false, error: `Scenario "${scenarioName}" not found` }
      }

      const scenario = data.scenarios[scenarioIndex]
      if (!scenario) {
        return { success: false, error: 'Scenario not found' }
      }

      // Remove task from this scenario only (identified by name AND swimlane)
      const newScenarios = [...data.scenarios]
      newScenarios[scenarioIndex] = {
        ...scenario,
        tasks: scenario.tasks.filter((t) => !(t.name === taskName && t.swimlane === swimlane)),
      }

      setData({
        ...data,
        scenarios: newScenarios,
      })

      return { success: true }
    },
    [data, setData]
  )

  const addScenario = useCallback(
    (name: string): { success: boolean; error?: string } => {
      const existingNames = getAllScenarioNames()
      const nameError = validateScenarioName(name, existingNames)
      if (nameError) {
        return { success: false, error: nameError }
      }

      const newScenario: Scenario = {
        name,
        tasks: [],
      }

      setData({
        ...data,
        scenarios: [...data.scenarios, newScenario],
      })

      return { success: true }
    },
    [data, setData, getAllScenarioNames]
  )

  const setActiveScenario = useCallback(
    (name: string): { success: boolean; error?: string } => {
      const exists = data.scenarios.some((s) => s.name === name)
      if (!exists) {
        return { success: false, error: `Scenario "${name}" not found` }
      }

      setData({
        ...data,
        activeScenario: name,
      })

      return { success: true }
    },
    [data, setData]
  )

  const addTeam = useCallback(
    (name: string): { success: boolean; error?: string } => {
      const existingNames = getAllTeamNames()
      const nameError = validateTeamName(name, existingNames)
      if (nameError) {
        return { success: false, error: nameError }
      }

      setData({
        ...data,
        swimlanes: [...data.swimlanes, name],
      })

      return { success: true }
    },
    [data, setData, getAllTeamNames]
  )

  const value: DataContextValue = {
    data,
    setData,
    addTask,
    updateTask,
    deleteTask,
    addScenario,
    setActiveScenario,
    addTeam,
    getAllTaskNames,
    getAllTeamNames,
    getAllScenarioNames,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

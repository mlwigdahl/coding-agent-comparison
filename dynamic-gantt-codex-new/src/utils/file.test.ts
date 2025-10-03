import { describe, expect, it } from 'vitest'

import { createInitialState } from '@/context/AppStateContext'
import { formatQuarterLabel } from '@/utils/quarter'
import {
  normalizeImportedData,
  parseImportedData,
  serializeAppState,
  type ExportedData,
} from './file'
import { ValidationError } from '@/utils/validation'

describe('file utilities', () => {
  it('serializes the app state into the expected export format', () => {
    const state = createInitialState()
    const exportData = serializeAppState(state)

    expect(exportData.scenarios).toHaveLength(state.order.timelineIds.length)
    expect(exportData.swimlanes).toEqual(state.order.teamIds.map((id) => state.teams[id].name))
    expect(exportData.activeScenario).toBe(state.timelines[state.activeTimelineId].name)
    expect(exportData.scenarios[0]?.tasks[0]?.startQuarter).toBe(
      formatQuarterLabel(state.tasks[state.timelines[state.order.timelineIds[0]].taskIds[0]].startQuarter),
    )
  })

  it('parses exported data and normalizes it into app state', () => {
    const state = createInitialState()
    const exportData = serializeAppState(state)
    const parsed = parseImportedData(exportData)
    const { state: normalized } = normalizeImportedData(parsed)

    expect(normalized.order.timelineIds.length).toBe(exportData.scenarios.length)
    expect(Object.keys(normalized.tasks).length).toBeGreaterThan(0)
    expect(normalized.activeTimelineId).toBeTruthy()
  })

  it('throws validation error for malformed import data', () => {
    expect(() => parseImportedData({})).toThrow(ValidationError)
  })

  it('ensures active timeline matches imported activeScenario when present', () => {
    const exportData: ExportedData = {
      scenarios: [
        {
          name: 'Roadmap',
          tasks: [
            {
              name: 'Define Goals',
              swimlane: 'Strategy',
              startQuarter: 'Q1 2025',
              endQuarter: 'Q2 2025',
              progress: 50,
              color: 'blue',
            },
          ],
        },
      ],
      activeScenario: 'Roadmap',
      swimlanes: ['Strategy'],
      exportDate: new Date().toISOString(),
    }

    const parsed = parseImportedData(exportData)
    const { state } = normalizeImportedData(parsed)

    expect(state.activeTimelineId).toBeTruthy()
    const activeTimeline = state.timelines[state.activeTimelineId]
    expect(activeTimeline?.name).toBe('Roadmap')
  })
})

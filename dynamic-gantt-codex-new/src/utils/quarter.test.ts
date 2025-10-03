import {
  DEFAULT_TIMELINE_QUARTERS,
  DEFAULT_TIMELINE_RANGE,
  compareQuarters,
  formatQuarterLabel,
  generateQuarters,
  indexToQuarter,
  parseQuarterLabel,
  quarterToIndex,
  type Quarter,
} from './quarter'

describe('quarter utilities', () => {
  it('parses valid quarter labels', () => {
    expect(parseQuarterLabel('Q2 2026')).toEqual({ year: 2026, quarter: 2 })
  })

  it('rejects malformed labels', () => {
    expect(() => parseQuarterLabel('Quarter 1 2025')).toThrow('Invalid quarter label')
  })

  it('formats quarter labels consistently', () => {
    const quarter: Quarter = { year: 2027, quarter: 3 }
    expect(formatQuarterLabel(quarter)).toBe('Q3 2027')
  })

  it('converts between quarter and index', () => {
    const quarter: Quarter = { year: 2025, quarter: 1 }
    const index = quarterToIndex(quarter)

    expect(index).toBe(0)
    expect(indexToQuarter(index)).toEqual(quarter)
  })

  it('generates inclusive quarter ranges', () => {
    const quarters = generateQuarters(
      { year: 2025, quarter: 4 },
      { year: 2026, quarter: 2 },
    )

    expect(quarters).toHaveLength(3)
    expect(quarters[0]).toEqual({ year: 2025, quarter: 4 })
    expect(quarters.at(-1)).toEqual({ year: 2026, quarter: 2 })
  })

  it('compares quarters chronologically', () => {
    const a: Quarter = { year: 2025, quarter: 2 }
    const b: Quarter = { year: 2025, quarter: 4 }

    expect(compareQuarters(a, b)).toBeLessThan(0)
    expect(compareQuarters(b, a)).toBeGreaterThan(0)
    expect(compareQuarters(a, { year: 2025, quarter: 2 })).toBe(0)
  })

  it('exposes default range constants', () => {
    expect(DEFAULT_TIMELINE_QUARTERS[0]).toEqual(DEFAULT_TIMELINE_RANGE.start)
    expect(DEFAULT_TIMELINE_QUARTERS.at(-1)).toEqual(DEFAULT_TIMELINE_RANGE.end)
  })
})

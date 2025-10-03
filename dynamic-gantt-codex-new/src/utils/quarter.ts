export type QuarterNumber = 1 | 2 | 3 | 4

export interface Quarter {
  year: number
  quarter: QuarterNumber
}

const BASE_YEAR = 2025
const QUARTERS_PER_YEAR = 4
const QUARTER_LABEL_PATTERN = /^Q([1-4])\s+(\d{4})$/i

export const formatQuarterLabel = ({ quarter, year }: Quarter): string => `Q${quarter} ${year}`

export const parseQuarterLabel = (label: string): Quarter => {
  const normalized = label.trim()
  const match = QUARTER_LABEL_PATTERN.exec(normalized)

  if (!match) {
    throw new Error(`Invalid quarter label: "${label}"`)
  }

  const [, rawQuarter, rawYear] = match
  const parsedQuarter = Number.parseInt(rawQuarter, 10) as QuarterNumber
  const parsedYear = Number.parseInt(rawYear, 10)

  return { year: parsedYear, quarter: parsedQuarter }
}

export const quarterToIndex = (quarter: Quarter, baseYear: number = BASE_YEAR): number => {
  return (quarter.year - baseYear) * QUARTERS_PER_YEAR + (quarter.quarter - 1)
}

export const indexToQuarter = (index: number, baseYear: number = BASE_YEAR): Quarter => {
  if (!Number.isInteger(index)) {
    throw new Error('Quarter index must be an integer')
  }

  const yearOffset = Math.floor(index / QUARTERS_PER_YEAR)
  const quarterNumber = ((index % QUARTERS_PER_YEAR) + QUARTERS_PER_YEAR) % QUARTERS_PER_YEAR

  return {
    year: baseYear + yearOffset,
    quarter: (quarterNumber + 1) as QuarterNumber,
  }
}

export const compareQuarters = (a: Quarter, b: Quarter): number => {
  if (a.year === b.year) {
    return a.quarter - b.quarter
  }
  return a.year - b.year
}

export const isQuarterOrderValid = (start: Quarter, end: Quarter): boolean => {
  return quarterToIndex(start) <= quarterToIndex(end)
}

export const generateQuarters = (start: Quarter, end: Quarter): Quarter[] => {
  if (!isQuarterOrderValid(start, end)) {
    throw new Error('Start quarter must be before or equal to end quarter')
  }

  const quarters: Quarter[] = []
  const startIndex = quarterToIndex(start)
  const endIndex = quarterToIndex(end)

  for (let index = startIndex; index <= endIndex; index += 1) {
    quarters.push(indexToQuarter(index))
  }

  return quarters
}

export const DEFAULT_TIMELINE_RANGE = {
  start: { year: 2025, quarter: 1 as QuarterNumber },
  end: { year: 2028, quarter: 4 as QuarterNumber },
}

export const DEFAULT_TIMELINE_QUARTERS = generateQuarters(
  DEFAULT_TIMELINE_RANGE.start,
  DEFAULT_TIMELINE_RANGE.end,
)

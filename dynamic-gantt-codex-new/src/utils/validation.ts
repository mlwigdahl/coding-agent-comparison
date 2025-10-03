import { quarterToIndex, type Quarter } from './quarter'

export class ValidationError extends Error {
  field?: string

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export const normalizeName = (value: string): string => value.trim().replace(/\s+/g, ' ')

const ensureNameCriteria = (name: string, entityLabel: string): string => {
  const normalized = normalizeName(name)

  if (!normalized) {
    throw new ValidationError(`${entityLabel} name is required`, 'name')
  }

  return normalized
}

export const ensureNameIsPresent = ensureNameCriteria

export const ensureUniqueName = (
  candidateName: string,
  existingNames: Iterable<string>,
  entityLabel: string,
): void => {
  const normalizedCandidate = candidateName.toLowerCase()

  for (const name of existingNames) {
    if (name.toLowerCase() === normalizedCandidate) {
      throw new ValidationError(`${entityLabel} name must be unique`, 'name')
    }
  }
}

export const validateTeamName = (
  name: string,
  existingNames: Iterable<string>,
): string => {
  const normalized = ensureNameCriteria(name, 'Team')
  ensureUniqueName(normalized, existingNames, 'Team')
  return normalized
}

export const validateTimelineName = (
  name: string,
  existingNames: Iterable<string>,
): string => {
  const normalized = ensureNameCriteria(name, 'Timeline')
  ensureUniqueName(normalized, existingNames, 'Timeline')
  return normalized
}

export const validateTaskName = (
  name: string,
  existingNames: Iterable<string>,
): string => {
  const normalized = ensureNameCriteria(name, 'Task')
  ensureUniqueName(normalized, existingNames, 'Task')
  return normalized
}

export const ensureProgressWithinRange = (progress: number): void => {
  if (!Number.isInteger(progress)) {
    throw new ValidationError('Progress must be an integer between 0 and 100', 'progress')
  }

  if (progress < 0 || progress > 100) {
    throw new ValidationError('Progress must be between 0 and 100', 'progress')
  }
}

export const ensureQuarterRangeIsValid = (start: Quarter, end: Quarter): void => {
  if (quarterToIndex(start) > quarterToIndex(end)) {
    throw new ValidationError('End quarter must be on or after start quarter', 'quarterRange')
  }
}

export const validateTaskPayload = (payload: {
  name: string
  existingTaskNames: Iterable<string>
  progress: number
  startQuarter: Quarter
  endQuarter: Quarter
}): { name: string } => {
  const { name, existingTaskNames, progress, startQuarter, endQuarter } = payload
  const normalizedName = validateTaskName(name, existingTaskNames)

  ensureProgressWithinRange(progress)
  ensureQuarterRangeIsValid(startQuarter, endQuarter)

  return { name: normalizedName }
}

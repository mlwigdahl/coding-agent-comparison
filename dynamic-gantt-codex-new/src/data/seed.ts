import type { AppState } from '@/context/AppStateContext'
import { parseQuarterLabel } from '@/utils/quarter'

const timelineMainId = 'timeline-main'
const timelineAggressiveId = 'timeline-aggressive'
const teamPetFishId = 'team-pet-fish'
const teamInfrastructureId = 'team-infrastructure'

const taskOnboardingFlowId = 'task-onboarding-flow'
const taskDispenseBasicId = 'task-dispense-basic'
const taskSignatureCaptureId = 'task-signature-capture'
const taskOnboardingFastTrackId = 'task-onboarding-fast-track'
const taskInfrastructureHardeningId = 'task-infrastructure-hardening'

const quarter = (label: string) => parseQuarterLabel(label)

const baseState: AppState = {
  timelines: {
    [timelineMainId]: {
      id: timelineMainId,
      name: 'Main Timeline',
      taskIds: [taskOnboardingFlowId, taskDispenseBasicId, taskSignatureCaptureId],
    },
    [timelineAggressiveId]: {
      id: timelineAggressiveId,
      name: 'Aggressive Timeline',
      taskIds: [taskOnboardingFastTrackId, taskInfrastructureHardeningId],
    },
  },
  tasks: {
    [taskOnboardingFlowId]: {
      id: taskOnboardingFlowId,
      name: 'Onboarding Flow',
      teamId: teamPetFishId,
      progress: 90,
      startQuarter: quarter('Q1 2025'),
      endQuarter: quarter('Q3 2025'),
      color: 'blue',
    },
    [taskDispenseBasicId]: {
      id: taskDispenseBasicId,
      name: 'Dispense Basic',
      teamId: teamPetFishId,
      progress: 15,
      startQuarter: quarter('Q3 2025'),
      endQuarter: quarter('Q4 2025'),
      color: 'indigo',
    },
    [taskSignatureCaptureId]: {
      id: taskSignatureCaptureId,
      name: 'Signature Capture',
      teamId: teamInfrastructureId,
      progress: 40,
      startQuarter: quarter('Q2 2025'),
      endQuarter: quarter('Q4 2025'),
      color: 'blue',
    },
    [taskOnboardingFastTrackId]: {
      id: taskOnboardingFastTrackId,
      name: 'Onboarding Fast Track',
      teamId: teamPetFishId,
      progress: 100,
      startQuarter: quarter('Q1 2025'),
      endQuarter: quarter('Q2 2025'),
      color: 'blue',
    },
    [taskInfrastructureHardeningId]: {
      id: taskInfrastructureHardeningId,
      name: 'Infrastructure Hardening',
      teamId: teamInfrastructureId,
      progress: 20,
      startQuarter: quarter('Q2 2025'),
      endQuarter: quarter('Q4 2025'),
      color: 'indigo',
    },
  },
  teams: {
    [teamPetFishId]: {
      id: teamPetFishId,
      name: 'Pet Fish',
      color: '#3b82f6',
      taskIds: [taskOnboardingFlowId, taskDispenseBasicId, taskOnboardingFastTrackId],
    },
    [teamInfrastructureId]: {
      id: teamInfrastructureId,
      name: 'Infrastructure',
      color: '#6366f1',
      taskIds: [taskSignatureCaptureId, taskInfrastructureHardeningId],
    },
  },
  activeTimelineId: timelineMainId,
  order: {
    timelineIds: [timelineMainId, timelineAggressiveId],
    teamIds: [teamPetFishId, teamInfrastructureId],
  },
}

export const seedState = Object.freeze(baseState)


import { z } from 'zod';
import { QUARTERS, COLOR_THEMES } from './constants';

// Quarter schema from constants
const QuarterSchema = z.enum(QUARTERS);

// Color theme schema from constants
const ColorThemeSchema = z.enum(COLOR_THEMES);

// Task validation schema based on SPEC.md constraints
export const TaskSchema = z.object({
  name: z.string()
    .min(1, 'Task name is required')
    .transform(str => str.trim())
    .refine(str => str.length > 0, 'Task name cannot be empty after trimming'),
  
  swimlane: z.string()
    .min(1, 'Team/swimlane is required')
    .transform(str => str.trim())
    .refine(str => str.length > 0, 'Team name cannot be empty after trimming'),
  
  startQuarter: QuarterSchema,
  
  endQuarter: QuarterSchema,
  
  progress: z.number()
    .int('Progress must be an integer')
    .min(0, 'Progress cannot be less than 0')
    .max(100, 'Progress cannot be more than 100'),
  
  color: ColorThemeSchema
}).refine(
  (data) => {
    // Validate that end quarter is not before start quarter
    const startIndex = QUARTERS.indexOf(data.startQuarter);
    const endIndex = QUARTERS.indexOf(data.endQuarter);
    return endIndex >= startIndex;
  },
  {
    message: 'End quarter must be the same as or after start quarter',
    path: ['endQuarter']
  }
);

// Timeline validation schema
export const TimelineSchema = z.object({
  name: z.string()
    .min(1, 'Timeline name is required')
    .transform(str => str.trim())
    .refine(str => str.length > 0, 'Timeline name cannot be empty after trimming'),
  
  tasks: z.array(TaskSchema).default([])
});

// Team validation schema  
export const TeamSchema = z.object({
  name: z.string()
    .min(1, 'Team name is required')
    .transform(str => str.trim())
    .refine(str => str.length > 0, 'Team name cannot be empty after trimming')
});

// Import/Export data validation schema based on SPEC.md JSON example
export const ImportSchema = z.object({
  scenarios: z.array(TimelineSchema)
    .min(1, 'At least one timeline/scenario is required'),
  
  activeScenario: z.string()
    .min(1, 'Active scenario name is required'),
  
  swimlanes: z.array(z.string().min(1))
    .default([]),
  
  exportDate: z.string()
    .datetime('Export date must be a valid ISO datetime string')
}).refine(
  (data) => {
    // Validate that activeScenario exists in scenarios
    return data.scenarios.some(scenario => scenario.name === data.activeScenario);
  },
  {
    message: 'Active scenario must match one of the scenario names',
    path: ['activeScenario']
  }
).refine(
  (data) => {
    // Validate that task names are unique within each timeline
    for (const scenario of data.scenarios) {
      const taskNamesInScenario = new Set<string>();
      for (const task of scenario.tasks) {
        if (taskNamesInScenario.has(task.name)) {
          return false;
        }
        taskNamesInScenario.add(task.name);
      }
    }
    return true;
  },
  {
    message: 'Task names must be unique within each timeline',
    path: ['scenarios']
  }
).refine(
  (data) => {
    // Validate that all timeline names are unique
    const timelineNames = new Set<string>();
    for (const scenario of data.scenarios) {
      if (timelineNames.has(scenario.name)) {
        return false;
      }
      timelineNames.add(scenario.name);
    }
    return true;
  },
  {
    message: 'All timeline names must be unique',
    path: ['scenarios']
  }
).refine(
  (data) => {
    // Validate that all swimlanes are unique
    const swimlaneSet = new Set(data.swimlanes);
    return swimlaneSet.size === data.swimlanes.length;
  },
  {
    message: 'All team/swimlane names must be unique',
    path: ['swimlanes']
  }
);

// Validation helper functions
export function validateTask(data: unknown) {
  return TaskSchema.safeParse(data);
}

export function validateTimeline(data: unknown) {
  return TimelineSchema.safeParse(data);
}

export function validateTeam(data: unknown) {
  return TeamSchema.safeParse(data);
}

export function validateImportData(data: unknown) {
  return ImportSchema.safeParse(data);
}

// Type inference helpers
export type ValidatedTask = z.infer<typeof TaskSchema>;
export type ValidatedTimeline = z.infer<typeof TimelineSchema>;
export type ValidatedTeam = z.infer<typeof TeamSchema>;
export type ValidatedImportData = z.infer<typeof ImportSchema>;
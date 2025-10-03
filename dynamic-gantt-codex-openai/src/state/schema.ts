import { z } from 'zod';
import { ALL_QUARTERS, quarterIndex } from './quarters';

const QuarterEnum = z.enum(ALL_QUARTERS as unknown as [string, ...string[]]);

const trimmedNonEmpty = z
  .string()
  .min(1, 'Required')
  .refine((v) => v === v.trim(), { message: 'No leading or trailing whitespace' });

export const ColorThemeSchema = z.enum(['blue', 'indigo']);

export const TaskSchema = z
  .object({
    name: trimmedNonEmpty,
    swimlane: trimmedNonEmpty,
    startQuarter: QuarterEnum,
    endQuarter: QuarterEnum,
    progress: z.number().int().min(0).max(100),
    color: ColorThemeSchema,
  })
  .superRefine((val, ctx) => {
    // start <= end
    const s = quarterIndex(val.startQuarter as any);
    const e = quarterIndex(val.endQuarter as any);
    if (e < s) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endQuarter must be >= startQuarter',
        path: ['endQuarter'],
      });
    }
  });

export const ScenarioSchema = z
  .object({
    name: trimmedNonEmpty,
    tasks: z.array(TaskSchema),
  })
  .superRefine((val, ctx) => {
    // Unique task identity within the scenario: (name, swimlane)
    const seen = new Set<string>();
    for (let i = 0; i < val.tasks.length; i++) {
      const t = val.tasks[i];
      const key = `${t.name}::${t.swimlane}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate task in same team: ${t.name}`,
          path: ['tasks', i, 'name'],
        });
      }
      seen.add(key);
    }
  });

export const AppDataSchema = z
  .object({
    scenarios: z.array(ScenarioSchema),
    activeScenario: trimmedNonEmpty,
    swimlanes: z.array(trimmedNonEmpty),
    exportDate: z.string().datetime().optional(),
  })
  .superRefine((val, ctx) => {
    // Unique scenario names
    const scenNames = val.scenarios.map((s) => s.name);
    const scenSet = new Set(scenNames);
    if (scenSet.size !== scenNames.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate scenario names' });
    }

    // activeScenario exists
    if (!scenSet.has(val.activeScenario)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'activeScenario must match an existing scenario name',
        path: ['activeScenario'],
      });
    }

    // Unique swimlanes (teams)
    const lanesSet = new Set(val.swimlanes);
    if (lanesSet.size !== val.swimlanes.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Duplicate swimlane names', path: ['swimlanes'] });
    }

    // Every task.swimlane exists in swimlanes
    const lanes = new Set(val.swimlanes);
    val.scenarios.forEach((scen, si) => {
      scen.tasks.forEach((t, ti) => {
        if (!lanes.has(t.swimlane)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Task references unknown swimlane: ${t.swimlane}`,
            path: ['scenarios', si, 'tasks', ti, 'swimlane'],
          });
        }
      });
    });
  });

export type TaskInput = z.infer<typeof TaskSchema>;
export type ScenarioInput = z.infer<typeof ScenarioSchema>;
export type AppDataInput = z.infer<typeof AppDataSchema>;

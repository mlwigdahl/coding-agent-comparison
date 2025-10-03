import { describe, it, expect } from 'vitest';
import {
  TaskSchema,
  TimelineSchema,
  TeamSchema,
  ImportSchema,
  validateTask,
  validateTimeline,
  validateTeam,
  validateImportData,
  ValidatedTask,
  ValidatedTimeline,
  ValidatedTeam,
  ValidatedImportData
} from '../../../src/utils/dataValidation';

describe('dataValidation', () => {
  describe('TaskSchema', () => {
    const validTask = {
      name: 'Valid Task',
      swimlane: 'Team A',
      startQuarter: 'Q1 2025',
      endQuarter: 'Q2 2025',
      progress: 50,
      color: 'blue'
    };

    describe('valid tasks', () => {
      it('should validate a complete valid task', () => {
        const result = TaskSchema.safeParse(validTask);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validTask);
        }
      });

      it('should trim whitespace from name and swimlane', () => {
        const taskWithWhitespace = {
          ...validTask,
          name: '  Task With Spaces  ',
          swimlane: '  Team B  '
        };
        
        const result = TaskSchema.safeParse(taskWithWhitespace);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe('Task With Spaces');
          expect(result.data.swimlane).toBe('Team B');
        }
      });

      it('should accept progress values 0 to 100', () => {
        const testCases = [0, 1, 50, 99, 100];
        
        testCases.forEach(progress => {
          const result = TaskSchema.safeParse({
            ...validTask,
            progress
          });
          expect(result.success).toBe(true);
        });
      });

      it('should accept both color themes', () => {
        ['blue', 'indigo'].forEach(color => {
          const result = TaskSchema.safeParse({
            ...validTask,
            color
          });
          expect(result.success).toBe(true);
        });
      });

      it('should accept all valid quarters', () => {
        const quarters = [
          'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025',
          'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026',
          'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027',
          'Q1 2028', 'Q2 2028', 'Q3 2028', 'Q4 2028'
        ];

        quarters.forEach(quarter => {
          const result = TaskSchema.safeParse({
            ...validTask,
            startQuarter: quarter,
            endQuarter: quarter
          });
          expect(result.success).toBe(true);
        });
      });

      it('should accept same start and end quarter', () => {
        const result = TaskSchema.safeParse({
          ...validTask,
          startQuarter: 'Q1 2025',
          endQuarter: 'Q1 2025'
        });
        expect(result.success).toBe(true);
      });

      it('should accept valid quarter ranges', () => {
        const testCases = [
          { start: 'Q1 2025', end: 'Q4 2028' }, // Full range
          { start: 'Q1 2025', end: 'Q4 2025' }, // Same year
          { start: 'Q4 2025', end: 'Q1 2026' }, // Across years
        ];

        testCases.forEach(({ start, end }) => {
          const result = TaskSchema.safeParse({
            ...validTask,
            startQuarter: start,
            endQuarter: end
          });
          expect(result.success).toBe(true);
        });
      });
    });

    describe('invalid tasks', () => {
      it('should reject missing name', () => {
        const task = { ...validTask };
        delete (task as any).name;
        
        const result = TaskSchema.safeParse(task);
        expect(result.success).toBe(false);
      });

      it('should reject empty name', () => {
        const result = TaskSchema.safeParse({
          ...validTask,
          name: ''
        });
        expect(result.success).toBe(false);
      });

      it('should reject name with only whitespace', () => {
        const result = TaskSchema.safeParse({
          ...validTask,
          name: '   '
        });
        expect(result.success).toBe(false);
      });

      it('should reject missing swimlane', () => {
        const task = { ...validTask };
        delete (task as any).swimlane;
        
        const result = TaskSchema.safeParse(task);
        expect(result.success).toBe(false);
      });

      it('should reject empty swimlane', () => {
        const result = TaskSchema.safeParse({
          ...validTask,
          swimlane: ''
        });
        expect(result.success).toBe(false);
      });

      it('should reject swimlane with only whitespace', () => {
        const result = TaskSchema.safeParse({
          ...validTask,
          swimlane: '   '
        });
        expect(result.success).toBe(false);
      });

      it('should reject invalid quarters', () => {
        const invalidQuarters = [
          'Q5 2025',     // Invalid quarter number
          'Q1 2024',     // Year too early
          'Q1 2029',     // Year too late
          'Q1-2025',     // Wrong format
          '2025 Q1',     // Wrong order
          'Quarter 1 2025' // Wrong format
        ];

        invalidQuarters.forEach(quarter => {
          const result = TaskSchema.safeParse({
            ...validTask,
            startQuarter: quarter
          });
          expect(result.success).toBe(false);
        });
      });

      it('should reject progress values outside 0-100 range', () => {
        const invalidProgress = [-1, -10, 101, 150, 200];
        
        invalidProgress.forEach(progress => {
          const result = TaskSchema.safeParse({
            ...validTask,
            progress
          });
          expect(result.success).toBe(false);
        });
      });

      it('should reject non-integer progress values', () => {
        const nonIntegerProgress = [50.5, 75.25, 99.99];
        
        nonIntegerProgress.forEach(progress => {
          const result = TaskSchema.safeParse({
            ...validTask,
            progress
          });
          expect(result.success).toBe(false);
        });
      });

      it('should reject invalid color themes', () => {
        const invalidColors = ['red', 'green', 'yellow', 'purple', 'Blue', 'BLUE'];
        
        invalidColors.forEach(color => {
          const result = TaskSchema.safeParse({
            ...validTask,
            color
          });
          expect(result.success).toBe(false);
        });
      });

      it('should reject when end quarter is before start quarter', () => {
        const result = TaskSchema.safeParse({
          ...validTask,
          startQuarter: 'Q3 2025',
          endQuarter: 'Q1 2025'
        });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toEqual(['endQuarter']);
          expect(result.error.issues[0].message).toContain('End quarter must be the same as or after start quarter');
        }
      });

      it('should reject when start quarter is in later year than end quarter', () => {
        const result = TaskSchema.safeParse({
          ...validTask,
          startQuarter: 'Q1 2026',
          endQuarter: 'Q4 2025'
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('TimelineSchema', () => {
    const validTimeline = {
      name: 'Valid Timeline',
      tasks: [
        {
          name: 'Task 1',
          swimlane: 'Team A',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue'
        }
      ]
    };

    describe('valid timelines', () => {
      it('should validate a timeline with tasks', () => {
        const result = TimelineSchema.safeParse(validTimeline);
        expect(result.success).toBe(true);
      });

      it('should validate a timeline without tasks (empty array)', () => {
        const result = TimelineSchema.safeParse({
          name: 'Empty Timeline',
          tasks: []
        });
        expect(result.success).toBe(true);
      });

      it('should default to empty tasks array when tasks not provided', () => {
        const result = TimelineSchema.safeParse({
          name: 'Timeline No Tasks'
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.tasks).toEqual([]);
        }
      });

      it('should trim whitespace from timeline name', () => {
        const result = TimelineSchema.safeParse({
          name: '  Timeline With Spaces  ',
          tasks: []
        });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe('Timeline With Spaces');
        }
      });
    });

    describe('invalid timelines', () => {
      it('should reject missing name', () => {
        const timeline = { tasks: [] };
        const result = TimelineSchema.safeParse(timeline);
        expect(result.success).toBe(false);
      });

      it('should reject empty name', () => {
        const result = TimelineSchema.safeParse({
          name: '',
          tasks: []
        });
        expect(result.success).toBe(false);
      });

      it('should reject name with only whitespace', () => {
        const result = TimelineSchema.safeParse({
          name: '   ',
          tasks: []
        });
        expect(result.success).toBe(false);
      });

      it('should reject invalid tasks in the tasks array', () => {
        const result = TimelineSchema.safeParse({
          name: 'Timeline with Invalid Task',
          tasks: [
            {
              name: 'Invalid Task',
              // Missing required fields
            }
          ]
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('TeamSchema', () => {
    describe('valid teams', () => {
      it('should validate a team with valid name', () => {
        const result = TeamSchema.safeParse({ name: 'Team Alpha' });
        expect(result.success).toBe(true);
      });

      it('should trim whitespace from team name', () => {
        const result = TeamSchema.safeParse({ name: '  Team Beta  ' });
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe('Team Beta');
        }
      });
    });

    describe('invalid teams', () => {
      it('should reject missing name', () => {
        const result = TeamSchema.safeParse({});
        expect(result.success).toBe(false);
      });

      it('should reject empty name', () => {
        const result = TeamSchema.safeParse({ name: '' });
        expect(result.success).toBe(false);
      });

      it('should reject name with only whitespace', () => {
        const result = TeamSchema.safeParse({ name: '   ' });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('ImportSchema', () => {
    const validImportData = {
      scenarios: [
        {
          name: 'Timeline 1',
          tasks: [
            {
              name: 'Task 1',
              swimlane: 'Team A',
              startQuarter: 'Q1 2025',
              endQuarter: 'Q2 2025',
              progress: 50,
              color: 'blue'
            }
          ]
        }
      ],
      activeScenario: 'Timeline 1',
      swimlanes: ['Team A'],
      exportDate: '2025-08-26T17:25:25.117Z'
    };

    describe('valid import data', () => {
      it('should validate complete valid import data', () => {
        const result = ImportSchema.safeParse(validImportData);
        expect(result.success).toBe(true);
      });

      it('should default to empty swimlanes array when not provided', () => {
        const data = { ...validImportData };
        delete (data as any).swimlanes;
        
        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.swimlanes).toEqual([]);
        }
      });

      it('should validate multiple scenarios', () => {
        const data = {
          scenarios: [
            {
              name: 'Timeline 1',
              tasks: [
                {
                  name: 'Task 1',
                  swimlane: 'Team A',
                  startQuarter: 'Q1 2025',
                  endQuarter: 'Q2 2025',
                  progress: 50,
                  color: 'blue'
                }
              ]
            },
            {
              name: 'Timeline 2',
              tasks: [
                {
                  name: 'Task 2',
                  swimlane: 'Team B',
                  startQuarter: 'Q3 2025',
                  endQuarter: 'Q4 2025',
                  progress: 75,
                  color: 'indigo'
                }
              ]
            }
          ],
          activeScenario: 'Timeline 2',
          swimlanes: ['Team A', 'Team B'],
          exportDate: '2025-08-26T17:25:25.117Z'
        };

        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe('invalid import data', () => {
      it('should reject empty scenarios array', () => {
        const data = {
          ...validImportData,
          scenarios: []
        };
        
        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should reject missing scenarios', () => {
        const data = { ...validImportData };
        delete (data as any).scenarios;
        
        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should reject missing activeScenario', () => {
        const data = { ...validImportData };
        delete (data as any).activeScenario;
        
        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should reject empty activeScenario', () => {
        const data = {
          ...validImportData,
          activeScenario: ''
        };
        
        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it('should reject activeScenario that does not match any scenario name', () => {
        const data = {
          ...validImportData,
          activeScenario: 'Non-existent Timeline'
        };
        
        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Active scenario must match one of the scenario names');
        }
      });

      it('should reject invalid exportDate format', () => {
        const invalidDates = [
          '2025-08-26',           // Missing time
          '26-08-2025T17:25:25Z', // Wrong date format
          '2025/08/26T17:25:25Z', // Wrong separators
          'invalid-date',         // Not a date
          ''                      // Empty string
        ];

        invalidDates.forEach(exportDate => {
          const data = {
            ...validImportData,
            exportDate
          };
          
          const result = ImportSchema.safeParse(data);
          expect(result.success).toBe(false);
        });
      });

      it('should reject duplicate task names across scenarios', () => {
        const data = {
          scenarios: [
            {
              name: 'Timeline 1',
              tasks: [
                {
                  name: 'Duplicate Task',
                  swimlane: 'Team A',
                  startQuarter: 'Q1 2025',
                  endQuarter: 'Q2 2025',
                  progress: 50,
                  color: 'blue'
                }
              ]
            },
            {
              name: 'Timeline 2',
              tasks: [
                {
                  name: 'Duplicate Task', // Same name as above
                  swimlane: 'Team B',
                  startQuarter: 'Q3 2025',
                  endQuarter: 'Q4 2025',
                  progress: 75,
                  color: 'indigo'
                }
              ]
            }
          ],
          activeScenario: 'Timeline 1',
          swimlanes: ['Team A', 'Team B'],
          exportDate: '2025-08-26T17:25:25.117Z'
        };

        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('All task names must be unique across all timelines');
        }
      });

      it('should reject duplicate timeline names', () => {
        const data = {
          scenarios: [
            {
              name: 'Duplicate Timeline',
              tasks: []
            },
            {
              name: 'Duplicate Timeline', // Same name as above
              tasks: []
            }
          ],
          activeScenario: 'Duplicate Timeline',
          swimlanes: [],
          exportDate: '2025-08-26T17:25:25.117Z'
        };

        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('All timeline names must be unique');
        }
      });

      it('should reject duplicate swimlane names', () => {
        const data = {
          ...validImportData,
          swimlanes: ['Team A', 'Team B', 'Team A'] // Duplicate Team A
        };

        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('All team/swimlane names must be unique');
        }
      });

      it('should reject empty swimlane names', () => {
        const data = {
          ...validImportData,
          swimlanes: ['Team A', '', 'Team B']
        };

        const result = ImportSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('validation helper functions', () => {
    describe('validateTask', () => {
      it('should return success for valid task', () => {
        const task = {
          name: 'Test Task',
          swimlane: 'Test Team',
          startQuarter: 'Q1 2025',
          endQuarter: 'Q2 2025',
          progress: 50,
          color: 'blue'
        };

        const result = validateTask(task);
        expect(result.success).toBe(true);
      });

      it('should return error for invalid task', () => {
        const result = validateTask({ name: '' });
        expect(result.success).toBe(false);
      });
    });

    describe('validateTimeline', () => {
      it('should return success for valid timeline', () => {
        const timeline = {
          name: 'Test Timeline',
          tasks: []
        };

        const result = validateTimeline(timeline);
        expect(result.success).toBe(true);
      });

      it('should return error for invalid timeline', () => {
        const result = validateTimeline({ name: '' });
        expect(result.success).toBe(false);
      });
    });

    describe('validateTeam', () => {
      it('should return success for valid team', () => {
        const team = { name: 'Test Team' };
        const result = validateTeam(team);
        expect(result.success).toBe(true);
      });

      it('should return error for invalid team', () => {
        const result = validateTeam({ name: '' });
        expect(result.success).toBe(false);
      });
    });

    describe('validateImportData', () => {
      it('should return success for valid import data', () => {
        const data = {
          scenarios: [{ name: 'Timeline 1', tasks: [] }],
          activeScenario: 'Timeline 1',
          swimlanes: [],
          exportDate: '2025-08-26T17:25:25.117Z'
        };

        const result = validateImportData(data);
        expect(result.success).toBe(true);
      });

      it('should return error for invalid import data', () => {
        const result = validateImportData({ scenarios: [] });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(validateTask(null).success).toBe(false);
      expect(validateTask(undefined).success).toBe(false);
      expect(validateTimeline(null).success).toBe(false);
      expect(validateTeam(null).success).toBe(false);
      expect(validateImportData(null).success).toBe(false);
    });

    it('should handle non-object inputs', () => {
      expect(validateTask('string').success).toBe(false);
      expect(validateTask(123).success).toBe(false);
      expect(validateTask(true).success).toBe(false);
      expect(validateTask([]).success).toBe(false);
    });

    it('should handle deeply nested whitespace trimming', () => {
      const data = {
        scenarios: [
          {
            name: '  Timeline with Spaces  ',
            tasks: [
              {
                name: '  Task with Spaces  ',
                swimlane: '  Team with Spaces  ',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue'
              }
            ]
          }
        ],
        activeScenario: '  Timeline with Spaces  ', // This should fail - activeScenario is not trimmed
        swimlanes: ['  Team with Spaces  '],
        exportDate: '2025-08-26T17:25:25.117Z'
      };

      const result = ImportSchema.safeParse(data);
      expect(result.success).toBe(false); // Should fail because activeScenario has spaces
    });

    it('should handle maximum valid progress values', () => {
      const task = {
        name: 'Progress Test',
        swimlane: 'Test Team',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 100,
        color: 'blue'
      };

      const result = validateTask(task);
      expect(result.success).toBe(true);
    });

    it('should handle minimum valid progress values', () => {
      const task = {
        name: 'Progress Test',
        swimlane: 'Test Team',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q2 2025',
        progress: 0,
        color: 'blue'
      };

      const result = validateTask(task);
      expect(result.success).toBe(true);
    });

    it('should validate complex import data with all edge cases covered', () => {
      const data = {
        scenarios: [
          {
            name: 'Timeline A',
            tasks: [
              {
                name: 'Task Full Span',
                swimlane: 'Team Alpha',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q4 2028',
                progress: 0,
                color: 'blue'
              },
              {
                name: 'Task Single Quarter',
                swimlane: 'Team Beta',
                startQuarter: 'Q4 2028',
                endQuarter: 'Q4 2028',
                progress: 100,
                color: 'indigo'
              }
            ]
          },
          {
            name: 'Timeline B',
            tasks: []
          }
        ],
        activeScenario: 'Timeline A',
        swimlanes: ['Team Alpha', 'Team Beta', 'Team Gamma'],
        exportDate: '2025-12-31T23:59:59.999Z'
      };

      const result = ImportSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
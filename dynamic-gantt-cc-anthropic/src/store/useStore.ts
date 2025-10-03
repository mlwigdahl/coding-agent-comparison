import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ITask, ITimeline, CreateTaskPayload, UpdateTaskPayload } from '../types';
import { validateTask, validateTimeline, validateTeam } from '../utils/dataValidation';
import { exportData, importData, createFileInput } from '../utils/fileOperations';
import { ExportData } from '../types';

interface AppState {
  // State
  timelines: ITimeline[];
  activeTimeline: string;
  teams: string[];
}

interface AppActions {
  // Task actions
  addTask: (task: CreateTaskPayload) => void;
  updateTask: (taskName: string, updates: UpdateTaskPayload) => void;
  deleteTask: (taskName: string) => void;
  getTasksByTimeline: (timelineName: string) => ITask[];
  getTasksByTeam: (teamName: string) => ITask[];
  taskExists: (taskName: string, timelineName?: string, teamName?: string) => boolean;
  
  // Timeline actions
  addTimeline: (name: string) => void;
  deleteTimeline: (name: string) => void;
  setActiveTimeline: (name: string) => void;
  timelineExists: (name: string) => boolean;
  getTimeline: (name: string) => ITimeline | undefined;
  
  // Team actions
  addTeam: (name: string) => void;
  deleteTeam: (name: string) => void;
  teamExists: (name: string) => boolean;
  getTeamTaskCount: (teamName: string) => number;
  
  // Import/Export actions
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  clearAllData: () => void;
}

type AppStore = AppState & AppActions;

// Main store implementation
export const useStore = create<AppStore>()(
  devtools(
    (set, get) => ({
      // Initial state with sample data for testing animations
      timelines: [{
        name: 'Main Timeline',
        tasks: [
          {
            name: 'Task A',
            swimlane: 'Pet Fish',
            startQuarter: 'Q1 2025',
            endQuarter: 'Q2 2025',
            progress: 75,
            color: 'blue'
          },
          {
            name: 'Task B',
            swimlane: 'Infrastructure',
            startQuarter: 'Q3 2025',
            endQuarter: 'Q4 2025',
            progress: 50,
            color: 'indigo'
          }
        ]
      }, {
        name: 'Alternative Timeline',
        tasks: [
          {
            name: 'Task A',
            swimlane: 'Pet Fish',
            startQuarter: 'Q2 2025',
            endQuarter: 'Q4 2025',
            progress: 100,
            color: 'blue'
          },
          {
            name: 'Task B',
            swimlane: 'Infrastructure',
            startQuarter: 'Q1 2025',
            endQuarter: 'Q2 2025',
            progress: 25,
            color: 'indigo'
          }
        ]
      }],
      activeTimeline: 'Main Timeline',
      teams: ['Pet Fish', 'Infrastructure'],

      // Task actions
      addTask: (taskPayload: CreateTaskPayload) => {
        const state = get();
        
        const trimmedName = taskPayload.name.trim();
        
        if (state.taskExists(trimmedName, state.activeTimeline, taskPayload.swimlane)) {
          throw new Error(`Task with name "${trimmedName}" already exists in the ${taskPayload.swimlane} team`);
        }
        
        const taskData = { ...taskPayload, name: trimmedName };
        const validation = validateTask(taskData);
        
        if (!validation.success) {
          throw new Error(`Invalid task data: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }
        
        const validatedTask = validation.data;
        
        if (!state.teamExists(validatedTask.swimlane)) {
          state.addTeam(validatedTask.swimlane);
        }
        
        // Add task to the active timeline
        set((state) => ({
          timelines: state.timelines.map(timeline => 
            timeline.name === state.activeTimeline 
              ? { ...timeline, tasks: [...timeline.tasks, validatedTask] }
              : timeline
          )
        }));
      },

      updateTask: (taskName: string, updates: UpdateTaskPayload) => {
        const state = get();
        const activeTimeline = state.getTimeline(state.activeTimeline);
        
        if (!activeTimeline) {
          throw new Error('Active timeline not found');
        }
        
        const existingTaskIndex = activeTimeline.tasks.findIndex(task => task.name === taskName);
        
        if (existingTaskIndex === -1) {
          throw new Error(`Task "${taskName}" not found`);
        }
        
        const existingTask = activeTimeline.tasks[existingTaskIndex];
        const updatedTaskData = { ...existingTask, ...updates };
        
        if (updates.name && updates.name.trim() !== taskName) {
          const trimmedNewName = updates.name.trim();
          const teamToCheck = updates.swimlane || existingTask.swimlane;
          if (state.taskExists(trimmedNewName, state.activeTimeline, teamToCheck)) {
            throw new Error(`Task with name "${trimmedNewName}" already exists in the ${teamToCheck} team`);
          }
          updatedTaskData.name = trimmedNewName;
        }
        
        const validation = validateTask(updatedTaskData);
        if (!validation.success) {
          throw new Error(`Invalid task data: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }
        
        const validatedTask = validation.data;
        
        if (updates.swimlane && !state.teamExists(validatedTask.swimlane)) {
          state.addTeam(validatedTask.swimlane);
        }
        
        // Update task in the active timeline
        set((state) => ({
          timelines: state.timelines.map(timeline => 
            timeline.name === state.activeTimeline 
              ? { 
                  ...timeline, 
                  tasks: timeline.tasks.map((task, index) =>
                    index === existingTaskIndex ? validatedTask : task
                  )
                }
              : timeline
          )
        }));
      },

      deleteTask: (taskName: string) => {
        const state = get();
        const activeTimeline = state.getTimeline(state.activeTimeline);
        
        if (!activeTimeline) {
          throw new Error('Active timeline not found');
        }
        
        const taskExists = activeTimeline.tasks.some(task => task.name === taskName);
        if (!taskExists) {
          throw new Error(`Task "${taskName}" not found`);
        }
        
        // Remove task from the active timeline
        set((state) => ({
          timelines: state.timelines.map(timeline => 
            timeline.name === state.activeTimeline 
              ? { ...timeline, tasks: timeline.tasks.filter(task => task.name !== taskName) }
              : timeline
          )
        }));
      },

      getTasksByTimeline: (timelineName: string) => {
        const state = get();
        const timeline = state.getTimeline(timelineName);
        return timeline ? timeline.tasks : [];
      },

      getTasksByTeam: (teamName: string) => {
        const state = get();
        const activeTimeline = state.getTimeline(state.activeTimeline);
        return activeTimeline ? activeTimeline.tasks.filter(task => task.swimlane === teamName) : [];
      },

      taskExists: (taskName: string, timelineName?: string, teamName?: string) => {
        const state = get();
        const trimmedName = taskName.trim();
        
        // If timeline and team are specified, check uniqueness only within that scope
        if (timelineName && teamName) {
          const timeline = state.getTimeline(timelineName);
          if (!timeline) return false;
          
          return timeline.tasks.some(task => 
            task.name === trimmedName && task.swimlane === teamName
          );
        }
        
        // If only timeline is specified, check within that timeline
        if (timelineName) {
          const timeline = state.getTimeline(timelineName);
          if (!timeline) return false;
          
          return timeline.tasks.some(task => task.name === trimmedName);
        }
        
        // Fallback: check across all timelines (maintain backward compatibility)
        return state.timelines.some(timeline => 
          timeline.tasks.some(task => task.name === trimmedName)
        );
      },

      // Timeline actions
      addTimeline: (name: string) => {
        const state = get();
        const trimmedName = name.trim();
        
        if (state.timelineExists(trimmedName)) {
          throw new Error(`Timeline with name "${trimmedName}" already exists`);
        }
        
        const timelineData = { name: trimmedName, tasks: [] };
        const validation = validateTimeline(timelineData);
        
        if (!validation.success) {
          throw new Error(`Invalid timeline data: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }
        
        const validatedTimeline = validation.data;
        
        set((state) => ({
          timelines: [...state.timelines, validatedTimeline]
        }));
      },

      deleteTimeline: (name: string) => {
        const state = get();
        
        if (!state.timelineExists(name)) {
          throw new Error(`Timeline "${name}" not found`);
        }
        
        if (state.timelines.length <= 1) {
          throw new Error('Cannot delete the last timeline');
        }
        
        const newTimelines = state.timelines.filter(timeline => timeline.name !== name);
        const newActiveTimeline = state.activeTimeline === name 
          ? newTimelines[0].name 
          : state.activeTimeline;
        
        set(() => ({
          timelines: newTimelines,
          activeTimeline: newActiveTimeline
        }));
      },

      setActiveTimeline: (name: string) => {
        const state = get();
        
        if (!state.timelineExists(name)) {
          throw new Error(`Timeline "${name}" not found`);
        }
        
        set(() => ({
          activeTimeline: name
        }));
      },

      timelineExists: (name: string) => {
        const state = get();
        return state.timelines.some(timeline => timeline.name === name.trim());
      },

      getTimeline: (name: string) => {
        const state = get();
        return state.timelines.find(timeline => timeline.name === name);
      },

      // Team actions
      addTeam: (name: string) => {
        const state = get();
        const trimmedName = name.trim();
        
        if (state.teamExists(trimmedName)) {
          throw new Error(`Team with name "${trimmedName}" already exists`);
        }
        
        const teamData = { name: trimmedName };
        const validation = validateTeam(teamData);
        
        if (!validation.success) {
          throw new Error(`Invalid team data: ${validation.error.errors.map(e => e.message).join(', ')}`);
        }
        
        set((state) => ({
          teams: [...state.teams, trimmedName]
        }));
      },

      deleteTeam: (name: string) => {
        const state = get();
        
        if (!state.teamExists(name)) {
          throw new Error(`Team "${name}" not found`);
        }
        
        const associatedTasks = state.getTasksByTeam(name);
        if (associatedTasks.length > 0) {
          throw new Error(`Cannot delete team "${name}" - it has ${associatedTasks.length} associated tasks`);
        }
        
        set((state) => ({
          teams: state.teams.filter(team => team !== name)
        }));
      },

      teamExists: (name: string) => {
        const state = get();
        return state.teams.includes(name.trim());
      },

      getTeamTaskCount: (teamName: string) => {
        const state = get();
        return state.getTasksByTeam(teamName).length;
      },

      // Import/Export actions
      exportData: () => {
        const state = get();
        
        const exportDataObj: ExportData = {
          scenarios: state.timelines.map(timeline => ({
            name: timeline.name,
            tasks: timeline.tasks
          })),
          activeScenario: state.activeTimeline,
          swimlanes: [...state.teams],
          exportDate: new Date().toISOString()
        };
        
        exportData(exportDataObj).catch((error) => {
          console.error('Export failed:', error);
          throw error;
        });
      },

      importData: async (file: File) => {
        try {
          const data = await importData(file);
          
          set(() => ({
            timelines: data.scenarios,
            activeTimeline: data.activeScenario,
            teams: [...data.swimlanes]
          }));
          
        } catch (error) {
          console.error('Import failed:', error);
          throw error;
        }
      },

      clearAllData: () => {
        set(() => ({
          timelines: [{
            name: 'Main Timeline',
            tasks: []
          }],
          activeTimeline: 'Main Timeline',
          teams: []
        }));
      }
    }),
    {
      name: 'timeline-store'
    }
  )
);

// Utility hook to trigger file import with proper error handling
export const useFileImport = () => {
  const importDataAction = useStore(state => state.importData);
  
  const triggerImport = (onSuccess?: () => void, onError?: (error: Error) => void) => {
    const input = createFileInput(async (file) => {
      try {
        await importDataAction(file);
        onSuccess?.();
      } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error('Unknown import error');
        onError?.(errorMessage);
      }
    });
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };
  
  return triggerImport;
};

// Selectors for common data access patterns
export const useTimelines = () => useStore(state => state.timelines);
export const useActiveTimeline = () => useStore(state => state.activeTimeline);
export const useActiveTimelineTasks = () => useStore(state => {
  const activeTimeline = state.getTimeline(state.activeTimeline);
  return activeTimeline ? activeTimeline.tasks : [];
});
export const useTeams = () => useStore(state => state.teams);
export const useTeamsWithCounts = () => useStore(state => 
  state.teams.map(team => ({
    name: team,
    taskCount: state.getTeamTaskCount(team)
  }))
);

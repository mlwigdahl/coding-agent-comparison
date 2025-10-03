import { ITask } from './task';

// Core Timeline interface based on SPEC.md requirements
export interface ITimeline {
  name: string;                   // Unique timeline name (trimmed, no duplicates)
  tasks: ITask[];                 // Set of associated tasks
}

// Timeline creation payload
export type CreateTimelinePayload = {
  name: string;
};

// Timeline with task count for display
export interface TimelineWithCount {
  name: string;
  taskCount: number;              // Number of tasks in this timeline
}
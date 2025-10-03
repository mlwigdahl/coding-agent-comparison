import { ITask, PositionedTask } from '../types';
import { getQuarterIndex, getQuarterDuration, getTaskStartColumn, getTaskColumnSpan } from './dateHelpers';

// Check if two tasks overlap in their time ranges
function tasksOverlap(task1: ITask, task2: ITask): boolean {
  const start1 = getQuarterIndex(task1.startQuarter);
  const end1 = getQuarterIndex(task1.endQuarter);
  const start2 = getQuarterIndex(task2.startQuarter);
  const end2 = getQuarterIndex(task2.endQuarter);
  
  // Tasks overlap if one starts before the other ends
  return start1 <= end2 && start2 <= end1;
}

// Check if a task overlaps with any task in a specific row
function taskOverlapsWithRow(task: ITask, row: ITask[]): boolean {
  return row.some(rowTask => tasksOverlap(task, rowTask));
}

// Find the first available row for a task (0-based)
function findAvailableRow(task: ITask, rows: ITask[][]): number {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    if (!taskOverlapsWithRow(task, rows[rowIndex])) {
      return rowIndex;
    }
  }
  // If no existing row is available, create a new one
  return rows.length;
}

// Sort tasks by start quarter, then by duration (descending for better packing)
function sortTasksForPositioning(tasks: ITask[]): ITask[] {
  return [...tasks].sort((a, b) => {
    const startA = getQuarterIndex(a.startQuarter);
    const startB = getQuarterIndex(b.startQuarter);
    
    if (startA !== startB) {
      return startA - startB; // Earlier tasks first
    }
    
    // For tasks starting at the same time, put longer tasks first
    const durationA = getQuarterDuration(a.startQuarter, a.endQuarter);
    const durationB = getQuarterDuration(b.startQuarter, b.endQuarter);
    
    return durationB - durationA;
  });
}

// Main algorithm: Position tasks to minimize vertical space usage
export function positionTasks(tasks: ITask[]): PositionedTask[] {
  if (tasks.length === 0) {
    return [];
  }
  
  // Sort tasks for optimal positioning
  const sortedTasks = sortTasksForPositioning(tasks);
  
  // Track which tasks are in each row
  const rows: ITask[][] = [];
  const positionedTasks: PositionedTask[] = [];
  
  // Position each task
  for (const task of sortedTasks) {
    // Find the first available row
    const rowIndex = findAvailableRow(task, rows);
    
    // Ensure the row exists
    if (!rows[rowIndex]) {
      rows[rowIndex] = [];
    }
    
    // Add task to the row
    rows[rowIndex].push(task);
    
    // Calculate positioning information
    const startColumn = getTaskStartColumn(task.startQuarter);
    const columnSpan = getTaskColumnSpan(task.startQuarter, task.endQuarter);
    
    positionedTasks.push({
      task,
      row: rowIndex,
      startColumn,
      endColumn: startColumn + columnSpan - 1
    });
  }
  
  return positionedTasks;
}

// Get the maximum number of rows needed for a set of tasks
export function getMaxRows(positionedTasks: PositionedTask[]): number {
  if (positionedTasks.length === 0) {
    return 0;
  }
  
  return Math.max(...positionedTasks.map(pt => pt.row)) + 1;
}

// Group positioned tasks by row for easier rendering
export function groupTasksByRow(positionedTasks: PositionedTask[]): PositionedTask[][] {
  const maxRows = getMaxRows(positionedTasks);
  const rows: PositionedTask[][] = Array.from({ length: maxRows }, () => []);
  
  for (const positionedTask of positionedTasks) {
    rows[positionedTask.row].push(positionedTask);
  }
  
  // Sort tasks within each row by start column for consistent rendering
  rows.forEach(row => {
    row.sort((a, b) => a.startColumn - b.startColumn);
  });
  
  return rows;
}

// Utility function to recalculate positions when tasks change
export function repositionTasks(tasks: ITask[]): {
  positionedTasks: PositionedTask[];
  maxRows: number;
  tasksByRow: PositionedTask[][];
} {
  const positionedTasks = positionTasks(tasks);
  const maxRows = getMaxRows(positionedTasks);
  const tasksByRow = groupTasksByRow(positionedTasks);
  
  return {
    positionedTasks,
    maxRows,
    tasksByRow
  };
}
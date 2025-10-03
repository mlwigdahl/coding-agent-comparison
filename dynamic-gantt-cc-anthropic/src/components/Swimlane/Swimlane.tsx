import { useMemo } from 'react';
import { Task } from './Task';
import { useStore } from '../../store/useStore';
import { repositionTasks } from '../../utils/taskPositioning';
import { QUARTERS } from '../../utils/constants';
import { ITask } from '../../types';

export interface SwimlaneProps {
  teamName: string;
  taskCount: number;
  onTaskClick?: (task: ITask) => void;
}

export function Swimlane({ teamName, taskCount, onTaskClick }: SwimlaneProps) {
  const tasks = useStore(state => state.getTasksByTeam(teamName));
  
  // Calculate task positions using the positioning algorithm
  const { tasksByRow, maxRows } = useMemo(() => {
    return repositionTasks(tasks);
  }, [tasks]);
  
  // Calculate the minimum height needed for this swimlane
  const swimlaneHeight = Math.max(60, maxRows * 50 + 20); // 50px per row + 20px padding
  
  return (
    <div 
      className="flex border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-150"
      style={{ minHeight: `${swimlaneHeight}px` }}
    >
      {/* Team name column - fixed width to match header */}
      <div className="min-w-[120px] sm:min-w-[200px] flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 flex items-center border-r-2 border-gray-300 bg-gray-50">
        <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{teamName}</span>
        <span className="ml-1 sm:ml-2 text-gray-500 text-xs sm:text-sm flex-shrink-0">({taskCount})</span>
      </div>
      
      {/* Tasks area - positioned using CSS Grid */}
      <div className="flex-1 relative overflow-x-auto">
        <div 
          className="grid gap-1 p-1 sm:p-2 h-full min-h-[50px] sm:min-h-[60px]"
          style={{
            gridTemplateColumns: `repeat(${QUARTERS.length}, minmax(80px, 1fr))`,
            gridTemplateRows: maxRows > 0 ? `repeat(${maxRows}, 42px)` : '1fr'
          }}
        >
          {/* Render tasks positioned by the algorithm */}
          {tasksByRow.map((row, rowIndex) =>
            row.map((positionedTask) => (
              <Task
                key={positionedTask.task.name}
                task={positionedTask.task}
                onClick={() => onTaskClick?.(positionedTask.task)}
                style={{
                  gridColumn: `${positionedTask.startColumn} / span ${positionedTask.endColumn - positionedTask.startColumn + 1}`,
                  gridRow: rowIndex + 1,
                }}
              />
            ))
          )}
          
          {/* Show placeholder if no tasks */}
          {tasks.length === 0 && (
            <div 
              className="flex items-center justify-center text-gray-400 text-xs sm:text-sm italic col-span-full"
              style={{ gridColumn: `1 / -1` }}
            >
              <span className="hidden sm:inline">No tasks for this team</span>
              <span className="sm:hidden">No tasks</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
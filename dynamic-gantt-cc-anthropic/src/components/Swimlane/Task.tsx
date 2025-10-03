import { ITask } from '../../types';
import { COLORS } from '../../utils/constants';

export interface TaskProps {
  task: ITask;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Task({ task, onClick, style }: TaskProps) {
  const colorScheme = COLORS[task.color];
  const isCompleted = task.progress === 100;
  const backgroundColor = isCompleted ? colorScheme.completed : colorScheme.uncompleted;
  // Use the completed color as border for emphasis (darker outline)
  const borderColor = colorScheme.completed;
  
  return (
    <div
      className="relative bg-white rounded-full border-2 cursor-pointer hover:shadow-md transition-all duration-200 min-h-[36px] sm:min-h-[40px] px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between"
      style={{
        backgroundColor,
        borderColor,
        ...style
      }}
      onClick={onClick}
      data-task-name={task.name}
    >
      {/* Task name - left justified */}
      <span className="text-white font-medium text-xs sm:text-sm truncate pr-1 sm:pr-2 min-w-0">
        {task.name}
      </span>
      
      {/* Progress percentage - right justified */}
      <span className="text-white font-medium text-xs flex-shrink-0">
        {task.progress}%
      </span>
      
      {/* Progress bar at bottom - thin orange bar */}
      <div 
        className="absolute bottom-0 left-0 h-0.5 sm:h-1 rounded-b-full transition-all duration-300"
        style={{
          backgroundColor: COLORS.progress,
          width: `${task.progress}%`
        }}
      />
    </div>
  );
}
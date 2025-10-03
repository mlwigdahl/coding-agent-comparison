import { Calendar } from 'lucide-react';
import { TimelineSelector } from './TimelineSelector';
import { ActionButtons } from './ActionButtons';

export interface HeaderProps {
  onNewTimeline: () => void;
  onAddTeam: () => void;
  onAddTask: () => void;
}

export function Header({ onNewTimeline, onAddTeam, onAddTask }: HeaderProps) {
  return (
    <header className="bg-black text-white px-3 sm:px-4 py-3 w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left side */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {/* Calendar icon in blue */}
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
          
          {/* Title in bold - responsive text */}
          <h1 className="text-sm sm:text-lg font-bold text-white truncate">
            <span className="hidden lg:inline">Dynamic Project Timeline - Quarterly View</span>
            <span className="hidden md:inline lg:hidden">Timeline - Quarterly View</span>
            <span className="md:hidden">Timeline</span>
          </h1>
          
          {/* Timeline selector */}
          <div className="hidden sm:block">
            <TimelineSelector onNewTimeline={onNewTimeline} />
          </div>
        </div>
        
        {/* Mobile Timeline selector */}
        <div className="sm:hidden">
          <TimelineSelector onNewTimeline={onNewTimeline} />
        </div>
        
        {/* Right side - Action buttons */}
        <div className="flex-shrink-0">
          <ActionButtons 
            onAddTeam={onAddTeam}
            onAddTask={onAddTask}
          />
        </div>
      </div>
    </header>
  );
}
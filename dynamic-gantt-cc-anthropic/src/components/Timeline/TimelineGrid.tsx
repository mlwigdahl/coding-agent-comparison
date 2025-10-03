import { useRef, useEffect } from 'react';
import { TimelineHeader } from './TimelineHeader';
import { useTeamsWithCounts, useActiveTimeline } from '../../store/useStore';
import { Swimlane } from '../Swimlane';
import { useTaskAnimation } from '../../hooks/useTaskAnimation';
import { ITask } from '../../types';

export interface TimelineGridProps {
  onTaskClick?: (task: ITask) => void;
}

export function TimelineGrid({ onTaskClick }: TimelineGridProps) {
  const teamsWithCounts = useTeamsWithCounts();
  const activeTimeline = useActiveTimeline();
  const swimlanesRef = useRef<HTMLDivElement>(null);
  const { animateTimelineTransition, captureInitialPositions } = useTaskAnimation();
  const prevTimelineRef = useRef<string | null>(null);
  
  // Capture initial positions when component first mounts or teams change (not on timeline changes)
  useEffect(() => {
    if (swimlanesRef.current && teamsWithCounts.length > 0) {
      const timeoutId = setTimeout(() => {
        if (swimlanesRef.current) {
          captureInitialPositions(swimlanesRef.current);
        }
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [teamsWithCounts, captureInitialPositions]); // Only run when teams change, NOT on timeline changes
  
  // Handle timeline changes with proper FLIP timing
  useEffect(() => {
    if (prevTimelineRef.current === null) {
      prevTimelineRef.current = activeTimeline;
      return;
    }
    
    if (prevTimelineRef.current !== activeTimeline) {
      prevTimelineRef.current = activeTimeline;
      
      if (swimlanesRef.current) {
        // Wait for React to update DOM with new timeline data, then animate
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (swimlanesRef.current) {
              animateTimelineTransition(swimlanesRef.current);
            }
          });
        });
      }
    }
  }, [activeTimeline, animateTimelineTransition]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Timeline Header with quarters */}
      <TimelineHeader />
      
      {/* Swimlanes area */}
      <div ref={swimlanesRef} className="bg-gray-50">
        {teamsWithCounts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-500 text-lg mb-2">No teams configured</div>
              <div className="text-gray-400 text-sm">
                Click "+ Add Team" to create your first team
              </div>
            </div>
          </div>
        ) : (
          <div>
            {teamsWithCounts.map((team) => (
              <Swimlane
                key={team.name}
                teamName={team.name}
                taskCount={team.taskCount}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
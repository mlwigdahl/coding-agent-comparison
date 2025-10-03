import { Plus } from 'lucide-react';
import { Button } from '../Common/Button';
import { Dropdown } from '../Common/Dropdown';
import { useStore, useTimelines, useActiveTimeline } from '../../store/useStore';
import { useToast } from '../../hooks/useToast';

export interface TimelineSelectorProps {
  onNewTimeline: () => void;
}

export function TimelineSelector({ onNewTimeline }: TimelineSelectorProps) {
  const timelines = useTimelines();
  const activeTimeline = useActiveTimeline();
  const setActiveTimeline = useStore(state => state.setActiveTimeline);
  const { error } = useToast();

  const timelineOptions = timelines.map(timeline => ({
    value: timeline.name,
    label: timeline.name
  }));

  const handleTimelineChange = (timelineName: string) => {
    try {
      setActiveTimeline(timelineName);
    } catch (timelineError) {
      console.error('Failed to set active timeline:', timelineError);
      error(
        'Timeline Switch Failed',
        timelineError instanceof Error ? timelineError.message : 'An unexpected error occurred while switching timelines'
      );
    }
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-3">
      <Dropdown
        options={timelineOptions}
        value={activeTimeline}
        placeholder="Select Timeline"
        onSelect={handleTimelineChange}
        className="min-w-[120px] sm:min-w-[200px]"
        size="md"
        variant="header"
      />
      
      <Button
        variant="secondary"
        size="sm"
        icon={<Plus className="h-3 w-3 sm:h-4 sm:w-4" />}
        onClick={onNewTimeline}
        className="!text-white !bg-gray-600 !border-gray-600 hover:!bg-gray-700 px-2 sm:px-3"
        title="Add New Timeline"
        aria-label="Add New Timeline"
      >
        <span className="hidden sm:inline">+</span>
      </Button>
    </div>
  );
}
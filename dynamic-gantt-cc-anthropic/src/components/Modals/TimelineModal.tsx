import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Modal, Input, Button } from '../Common';
import { useStore } from '../../store/useStore';

export interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TimelineModal({ isOpen, onClose }: TimelineModalProps) {
  const { timelines, addTimeline } = useStore();
  
  // Form state
  const [timelineName, setTimelineName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTimelineName('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Validation function
  const validateTimelineName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'Timeline name is required';
    }
    
    if (trimmedName !== name) {
      return 'Timeline name cannot have leading or trailing whitespace';
    }
    
    // Check for duplicate timeline names
    const existingTimeline = timelines.find(t => t.name === trimmedName);
    if (existingTimeline) {
      return 'A timeline with this name already exists';
    }
    
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateTimelineName(timelineName);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      addTimeline(timelineName.trim());
      onClose();
    } catch (error) {
      console.error('Error creating timeline:', error);
      setError('Failed to create timeline. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change with real-time validation
  const handleTimelineNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimelineName(value);
    
    // Clear error when user starts typing
    if (error && value.trim()) {
      setError('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Timeline"
      icon={<Clock size={20} />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Timeline Name Input */}
        <Input
          id="timelineName"
          label="Timeline Name"
          type="text"
          value={timelineName}
          onChange={handleTimelineNameChange}
          error={error}
          placeholder="Enter timeline name"
          required
          autoFocus
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !timelineName.trim()}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : 'Save Timeline'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Modal, Input, Button } from '../Common';
import { useStore } from '../../store/useStore';

export interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeamModal({ isOpen, onClose }: TeamModalProps) {
  const { teams, addTeam } = useStore();
  
  // Form state
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTeamName('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Validation function
  const validateTeamName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'Team name is required';
    }
    
    if (trimmedName !== name) {
      return 'Team name cannot have leading or trailing whitespace';
    }
    
    // Check for duplicate team names
    const existingTeam = teams.find(teamName => teamName === trimmedName);
    if (existingTeam) {
      return 'A team with this name already exists';
    }
    
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateTeamName(teamName);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      addTeam(teamName.trim());
      onClose();
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change with real-time validation
  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeamName(value);
    
    // Clear error when user starts typing
    if (error && value.trim()) {
      setError('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Team"
      icon={<Users size={20} />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team Name Input */}
        <Input
          id="teamName"
          label="Team Name"
          type="text"
          value={teamName}
          onChange={handleTeamNameChange}
          error={error}
          placeholder="Enter team name"
          required
          autoFocus
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !teamName.trim()}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : 'Save Team'}
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
import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Modal, Input, Button, Dropdown } from '../Common';
import { useStore } from '../../store/useStore';
import { ITask, CreateTaskPayload } from '../../types';
import { QUARTERS, COLOR_THEMES } from '../../utils/constants';

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: ITask; // If provided, editing mode; if not, creating mode
  preselectedTeam?: string; // For when adding a task from a specific team
}

export function TaskModal({ isOpen, onClose, task, preselectedTeam }: TaskModalProps) {
  const { teams, timelines, activeTimeline, addTask, updateTask, deleteTask } = useStore();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    swimlane: preselectedTeam || '',
    startQuarter: 'Q1 2025' as typeof QUARTERS[number],
    endQuarter: 'Q1 2025' as typeof QUARTERS[number], 
    progress: 0,
    color: 'blue' as typeof COLOR_THEMES[number]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = Boolean(task);
  const modalTitle = isEditing ? 'Edit Task' : 'Add New Task';
  
  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        swimlane: task.swimlane,
        startQuarter: task.startQuarter,
        endQuarter: task.endQuarter,
        progress: task.progress,
        color: task.color
      });
    } else {
      setFormData({
        name: '',
        swimlane: preselectedTeam || teams[0] || '',
        startQuarter: 'Q1 2025',
        endQuarter: 'Q1 2025',
        progress: 0,
        color: 'blue'
      });
    }
    setErrors({});
  }, [task, preselectedTeam, teams, isOpen]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Task name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    } else if (formData.name.trim() !== formData.name) {
      newErrors.name = 'Task name cannot have leading or trailing whitespace';
    }
    
    // Team validation
    if (!formData.swimlane) {
      newErrors.swimlane = 'Team is required';
    }
    
    // Quarter validation
    const startIndex = QUARTERS.indexOf(formData.startQuarter);
    const endIndex = QUARTERS.indexOf(formData.endQuarter);
    if (startIndex > endIndex) {
      newErrors.endQuarter = 'End quarter must be after or equal to start quarter';
    }
    
    // Progress validation
    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }
    
    // Check for duplicate task names within the same timeline and team (only if creating or changing name)
    if (!isEditing || task?.name !== formData.name.trim()) {
      const currentTasks = timelines.find(t => t.name === activeTimeline)?.tasks || [];
      const duplicateTask = currentTasks.find(t => 
        t.name === formData.name.trim() && t.swimlane === formData.swimlane
      );
      if (duplicateTask) {
        newErrors.name = `A task with this name already exists in the ${formData.swimlane} team`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const taskData: CreateTaskPayload = {
        name: formData.name.trim(),
        swimlane: formData.swimlane,
        startQuarter: formData.startQuarter,
        endQuarter: formData.endQuarter,
        progress: formData.progress,
        color: formData.color
      };
      
      if (isEditing && task) {
        updateTask(task.name, taskData);
      } else {
        addTask(taskData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle task deletion
  const handleDelete = () => {
    if (isEditing && task) {
      deleteTask(task.name);
      onClose();
    } else {
      // If creating, just close
      onClose();
    }
  };

  // Team dropdown options
  const teamOptions = teams.map(team => ({
    value: team,
    label: team
  }));

  // Quarter dropdown options
  const quarterOptions = QUARTERS.map(quarter => ({
    value: quarter,
    label: quarter
  }));

  // Color theme dropdown options
  const colorOptions = COLOR_THEMES.map(color => ({
    value: color,
    label: color.charAt(0).toUpperCase() + color.slice(1)
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      icon={<Edit size={20} />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <Input
          id="taskName"
          label="Task Name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          placeholder="Enter task name"
          required
        />

        {/* Team */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Team</label>
          <Dropdown
            options={teamOptions}
            value={formData.swimlane}
            onSelect={(team) => setFormData(prev => ({ ...prev, swimlane: team }))}
            placeholder="Select team"
          />
          {errors.swimlane && <p className="text-sm text-red-600">{errors.swimlane}</p>}
        </div>

        {/* Start Quarter */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Start Quarter</label>
          <Dropdown
            options={quarterOptions}
            value={formData.startQuarter}
            onSelect={(quarter) => setFormData(prev => ({ ...prev, startQuarter: quarter as typeof QUARTERS[number] }))}
            placeholder="Select start quarter"
          />
        </div>

        {/* End Quarter */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">End Quarter</label>
          <Dropdown
            options={quarterOptions}
            value={formData.endQuarter}
            onSelect={(quarter) => setFormData(prev => ({ ...prev, endQuarter: quarter as typeof QUARTERS[number] }))}
            placeholder="Select end quarter"
          />
          {errors.endQuarter && <p className="text-sm text-red-600">{errors.endQuarter}</p>}
        </div>

        {/* Progress */}
        <Input
          id="progress"
          label="Progress (%)"
          type="number"
          min="0"
          max="100"
          value={formData.progress}
          onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
          error={errors.progress}
          placeholder="0-100"
          required
        />

        {/* Color Theme */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Color Theme</label>
          <Dropdown
            options={colorOptions}
            value={formData.color}
            onSelect={(color) => setFormData(prev => ({ ...prev, color: color as typeof COLOR_THEMES[number] }))}
            placeholder="Select color theme"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task')}
          </Button>
          
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            {isEditing ? 'Delete' : 'Cancel'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
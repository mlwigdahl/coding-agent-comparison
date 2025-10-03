import { useState } from 'react';
import { Header } from './components/Header';
import { TimelineGrid } from './components/Timeline';
import { TaskModal, TimelineModal, TeamModal } from './components/Modals';
import { ToastContainer } from './components/Common/Toast';
import { useToast } from './hooks/useToast';
import { ITask } from './types';

function App() {
  // Toast notifications
  const { toasts, removeToast } = useToast();

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | undefined>(undefined);
  const [preselectedTeam, setPreselectedTeam] = useState<string | undefined>(undefined);

  // Timeline modal state
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // Team modal state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Timeline modal handlers
  const handleNewTimeline = () => {
    setIsTimelineModalOpen(true);
  };

  const handleCloseTimelineModal = () => {
    setIsTimelineModalOpen(false);
  };

  // Team modal handlers
  const handleAddTeam = () => {
    setIsTeamModalOpen(true);
  };

  const handleCloseTeamModal = () => {
    setIsTeamModalOpen(false);
  };

  // Task modal handlers
  const handleAddTask = () => {
    setEditingTask(undefined);
    setPreselectedTeam(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: ITask) => {
    setEditingTask(task);
    setPreselectedTeam(undefined);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
    setPreselectedTeam(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onNewTimeline={handleNewTimeline}
        onAddTeam={handleAddTeam}
        onAddTask={handleAddTask}
      />
      <main className="p-3 sm:p-6">
        <div className="max-w-full mx-auto">
          <TimelineGrid onTaskClick={handleEditTask} />
        </div>
      </main>
      
      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        task={editingTask}
        preselectedTeam={preselectedTeam}
      />
      
      {/* Timeline Modal */}
      <TimelineModal
        isOpen={isTimelineModalOpen}
        onClose={handleCloseTimelineModal}
      />
      
      {/* Team Modal */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={handleCloseTeamModal}
      />
      
      {/* Toast Notifications */}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
      />
    </div>
  );
}

export default App;
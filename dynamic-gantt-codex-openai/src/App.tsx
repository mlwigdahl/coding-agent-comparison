import React from 'react';
import Header from './components/Header/Header';
import TimelineGrid from './components/Timeline/TimelineGrid';
import Swimlanes from './components/Timeline/Swimlanes';
import { ModalProvider } from './components/Modals/ModalContext';
import TaskModal from './components/Modals/TaskModal';
import TeamModal from './components/Modals/TeamModal';
import ScenarioModal from './components/Modals/ScenarioModal';

function App() {
  return (
    <ModalProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="mx-auto max-w-screen-xl px-4 py-6">
          <div className="overflow-x-auto">
            <TimelineGrid />
            <Swimlanes />
          </div>
        </main>
        <TaskModal />
        <TeamModal />
        <ScenarioModal />
      </div>
    </ModalProvider>
  );
}

export default App;

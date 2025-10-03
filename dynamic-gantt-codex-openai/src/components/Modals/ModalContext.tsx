import React, { createContext, useContext, useState, useCallback } from 'react';

type TaskModalState =
  | { open: false }
  | { open: true; mode: 'create'; preset?: Partial<{ swimlane: string }> }
  | { open: true; mode: 'edit'; taskName: string; swimlane: string };

type Ctx = {
  taskModal: TaskModalState;
  openTaskCreate: (preset?: Partial<{ swimlane: string }>) => void;
  openTaskEdit: (taskName: string, swimlane: string) => void;
  closeTaskModal: () => void;
  teamModal: { open: boolean };
  openTeamCreate: () => void;
  closeTeamModal: () => void;
  scenarioModal: { open: boolean };
  openScenarioCreate: () => void;
  closeScenarioModal: () => void;
};

const ModalCtx = createContext<Ctx | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [taskModal, setTaskModal] = useState<TaskModalState>({ open: false });
  const [teamModal, setTeamModal] = useState<{ open: boolean }>({ open: false });
  const [scenarioModal, setScenarioModal] = useState<{ open: boolean }>({ open: false });

  const openTaskCreate = useCallback((preset?: Partial<{ swimlane: string }>) => {
    setTaskModal({ open: true, mode: 'create', preset });
  }, []);

  const openTaskEdit = useCallback((taskName: string, swimlane: string) => {
    setTaskModal({ open: true, mode: 'edit', taskName, swimlane });
  }, []);

  const closeTaskModal = useCallback(() => setTaskModal({ open: false }), []);

  const openTeamCreate = useCallback(() => setTeamModal({ open: true }), []);
  const closeTeamModal = useCallback(() => setTeamModal({ open: false }), []);
  const openScenarioCreate = useCallback(() => setScenarioModal({ open: true }), []);
  const closeScenarioModal = useCallback(() => setScenarioModal({ open: false }), []);

  return (
    <ModalCtx.Provider
      value={{ taskModal, openTaskCreate, openTaskEdit, closeTaskModal, teamModal, openTeamCreate, closeTeamModal, scenarioModal, openScenarioCreate, closeScenarioModal }}
    >
      {children}
    </ModalCtx.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalCtx);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

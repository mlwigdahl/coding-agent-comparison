import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { AppData } from './types';
import { reducer, initialState } from './reducer';
import type { Action } from './actions';
import { loadFromStorage, saveToStorage } from './storage';

const StateCtx = createContext<AppData | undefined>(undefined);
const DispatchCtx = createContext<React.Dispatch<Action> | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useMemo(() => loadFromStorage(), []);
  const [state, dispatch] = useReducer(reducer, hydrated ?? initialState);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(DispatchCtx);
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider');
  return ctx;
}


import React from 'react';
import { useAppDispatch, useAppState } from '../../state/context';
import { setActiveScenario } from '../../state/actions';
import { useModal } from '../Modals/ModalContext';
import { capturePositions, playTransitions } from '../../logic/animation';

export default function ScenarioSelect() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { openScenarioCreate } = useModal();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // FLIP: capture current positions, then change scenario and play transitions
    capturePositions();
    const name = e.target.value;
    dispatch(setActiveScenario(name));
    // play after next frame to ensure DOM updated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => playTransitions(2000));
    });
  };

  const onAddScenario = () => openScenarioCreate();

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label="Select timeline"
        data-testid="scenario-select"
        value={state.activeScenario}
        onChange={onChange}
        className="bg-gray-900 text-white border border-gray-700 rounded px-2 py-1"
      >
        {state.scenarios.map((s) => (
          <option key={s.name} value={s.name} className="text-white">
            {s.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        aria-label="Add Timeline"
        data-testid="add-timeline"
        onClick={onAddScenario}
        className="bg-gray-800 hover:bg-gray-700 text-white rounded w-8 h-8 flex items-center justify-center"
        title="New timeline"
      >
        +
      </button>
    </div>
  );
}

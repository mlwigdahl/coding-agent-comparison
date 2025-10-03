import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { useModal } from './ModalContext';
import { useAppDispatch } from '../../state/context';
import { addScenario } from '../../state/actions';
import ClockIcon from '../Icons/Clock';

export default function ScenarioModal() {
  const { scenarioModal, closeScenarioModal } = useModal();
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scenarioModal.open) {
      setName('');
      setError(null);
    }
  }, [scenarioModal.open]);

  const onSave = () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return setError('Timeline name is required');
    try {
      dispatch(addScenario(trimmed));
      closeScenarioModal();
    } catch (e: any) {
      setError(e?.message ?? 'Error saving timeline');
    }
  };

  return (
    <Modal
      title="Add New Timeline"
      icon={<ClockIcon className="w-4 h-4 text-gray-700" />}
      open={scenarioModal.open}
      onClose={closeScenarioModal}
    >
      <div className="space-y-3">
        {error && (
          <div className="text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="scenario-name" className="block text-sm font-medium mb-1">Timeline Name</label>
          <input
            id="scenario-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="px-3 py-1 rounded border" onClick={closeScenarioModal}>
            Cancel
          </button>
          <button type="button" className="px-3 py-1 rounded bg-blue-600 text-white" onClick={onSave}>
            Save Timeline
          </button>
        </div>
      </div>
    </Modal>
  );
}

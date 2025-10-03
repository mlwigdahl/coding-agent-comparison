import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useModal } from './ModalContext';
import { useAppDispatch } from '../../state/context';
import { addTeam } from '../../state/actions';

export default function TeamModal() {
  const { teamModal, closeTeamModal } = useModal();
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teamModal.open) {
      setName('');
      setError(null);
    }
  }, [teamModal.open]);

  const onSave = () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return setError('Team name is required');
    try {
      dispatch(addTeam(trimmed));
      closeTeamModal();
    } catch (e: any) {
      setError(e?.message ?? 'Error saving team');
    }
  };

  return (
    <Modal
      title="Add Team"
      icon={<span aria-hidden className="inline-block w-4 h-4 bg-gray-600 rounded-sm" />}
      open={teamModal.open}
      onClose={closeTeamModal}
    >
      <div className="space-y-3">
        {error && (
          <div className="text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="team-name" className="block text-sm font-medium mb-1">Team Name</label>
          <input
            id="team-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="px-3 py-1 rounded border" onClick={closeTeamModal}>
            Cancel
          </button>
          <button type="button" className="px-3 py-1 rounded bg-blue-600 text-white" onClick={onSave}>
            Save Team
          </button>
        </div>
      </div>
    </Modal>
  );
}

import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import { useModal } from './ModalContext';
import { useAppDispatch, useAppState } from '../../state/context';
import { addTask, deleteTask, updateTask } from '../../state/actions';
import { ALL_QUARTERS } from '../../state/quarters';
import type { ColorTheme } from '../../state/types';
import PenIcon from '../Icons/Pen';
import TrashIcon from '../Icons/Trash';

export default function TaskModal() {
  const { taskModal, closeTaskModal } = useModal();
  const state = useAppState();
  const dispatch = useAppDispatch();

  const scenario = state.scenarios.find((s) => s.name === state.activeScenario)!;
  const editingTask = useMemo(
    () => (taskModal.open && taskModal.mode === 'edit' ? scenario.tasks.find((t) => t.name === taskModal.taskName && t.swimlane === taskModal.swimlane) : undefined),
    [taskModal, scenario.tasks]
  );

  const [name, setName] = useState(editingTask?.name ?? '');
  const initialSwimlane = editingTask?.swimlane ?? (taskModal.open && taskModal.mode === 'create' ? (taskModal.preset?.swimlane ?? '') : '');
  const [swimlane, setSwimlane] = useState(initialSwimlane);
  const [startQuarter, setStartQuarter] = useState<string>(editingTask?.startQuarter ?? 'Q1 2025');
  const [endQuarter, setEndQuarter] = useState<string>(editingTask?.endQuarter ?? 'Q1 2025');
  const [progress, setProgress] = useState<number>(editingTask?.progress ?? 0);
  const [color, setColor] = useState<ColorTheme>(editingTask?.color ?? 'blue');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setSwimlane(editingTask.swimlane);
      setStartQuarter(editingTask.startQuarter);
      setEndQuarter(editingTask.endQuarter);
      setProgress(editingTask.progress);
      setColor(editingTask.color);
    } else if (taskModal.open && taskModal.mode === 'create') {
      setName('');
      setSwimlane(taskModal.preset?.swimlane ?? '');
      setStartQuarter('Q1 2025');
      setEndQuarter('Q1 2025');
      setProgress(0);
      setColor('blue');
    }
  }, [taskModal.open, taskModal.mode, editingTask, taskModal]);

  const onSave = () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return setError('Task name is required');
    if (!swimlane) return setError('Team is required');
    const pg = Number(progress);
    if (!Number.isInteger(pg) || pg < 0 || pg > 100) return setError('Progress must be an integer 0..100');
    if (ALL_QUARTERS.indexOf(startQuarter as any) < 0 || ALL_QUARTERS.indexOf(endQuarter as any) < 0) {
      return setError('Invalid quarter');
    }
    if (ALL_QUARTERS.indexOf(endQuarter as any) < ALL_QUARTERS.indexOf(startQuarter as any)) {
      return setError('End quarter must be >= start quarter');
    }

    try {
      if (taskModal.open && taskModal.mode === 'edit' && editingTask) {
        dispatch(
          updateTask(editingTask.name, editingTask.swimlane, {
            name: trimmed,
            swimlane,
            startQuarter: startQuarter as any,
            endQuarter: endQuarter as any,
            progress: pg,
            color,
          })
        );
      } else {
        dispatch(
          addTask({
            name: trimmed,
            swimlane,
            startQuarter: startQuarter as any,
            endQuarter: endQuarter as any,
            progress: pg,
            color,
          })
        );
      }
      closeTaskModal();
    } catch (e: any) {
      setError(e?.message ?? 'Error saving task');
    }
  };

  const onDelete = () => {
    if (taskModal.open && taskModal.mode === 'edit' && editingTask) {
      dispatch(deleteTask(editingTask.name, editingTask.swimlane));
    }
    closeTaskModal();
  };

  return (
    <Modal
      title={taskModal.open && taskModal.mode === 'edit' ? 'Edit Task' : 'Add Task'}
      icon={<PenIcon className="w-4 h-4 text-gray-700" />}
      open={taskModal.open}
      onClose={closeTaskModal}
    >
      <div className="space-y-3">
        {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
        <div>
          <label htmlFor="task-name" className="block text-sm font-medium mb-1">Task Name</label>
          <input
            id="task-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="task-team" className="block text-sm font-medium mb-1">Team</label>
          <select id="task-team" value={swimlane} onChange={(e) => setSwimlane(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="" disabled>
              Select team
            </option>
            {state.swimlanes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-start" className="block text-sm font-medium mb-1">Start Quarter</label>
            <select id="task-start" value={startQuarter} onChange={(e) => setStartQuarter(e.target.value)} className="w-full border rounded px-2 py-1">
              {ALL_QUARTERS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="task-end" className="block text-sm font-medium mb-1">End Quarter</label>
            <select id="task-end" value={endQuarter} onChange={(e) => setEndQuarter(e.target.value)} className="w-full border rounded px-2 py-1">
              {ALL_QUARTERS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label htmlFor="task-progress" className="block text-sm font-medium mb-1">Progress (%)</label>
            <input
              id="task-progress"
              type="number"
              min={0}
              max={100}
              step={1}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <div>
            <label htmlFor="task-color" className="block text-sm font-medium mb-1">Color Theme</label>
            <select id="task-color" value={color} onChange={(e) => setColor(e.target.value as ColorTheme)} className="w-full border rounded px-2 py-1">
              <option value="blue">Blue</option>
              <option value="indigo">Indigo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="px-3 py-1 rounded border" onClick={closeTaskModal}>
            Cancel
          </button>
          <button type="button" className="px-3 py-1 rounded bg-red-600 text-white flex items-center gap-1" onClick={onDelete}>
            <TrashIcon className="w-4 h-4" />
            <span>Delete</span>
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={onSave}
          >
            {taskModal.open && taskModal.mode === 'edit' ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

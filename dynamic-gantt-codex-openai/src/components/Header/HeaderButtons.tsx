import React from 'react';
import DownloadIcon from '../Icons/Download';
import UploadIcon from '../Icons/Upload';

type Props = {
  onExport?: () => void;
  onImport?: () => void;
  onAddTeam?: () => void;
  onAddTask?: () => void;
};

export default function HeaderButtons({ onExport, onImport, onAddTeam, onAddTask }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        data-testid="export-button"
        onClick={onExport}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500 text-white rounded px-3 py-1 transition"
        title="Export"
      >
        <DownloadIcon className="w-4 h-4 text-gray-300" />
        <span>Export</span>
      </button>
      <button
        type="button"
        data-testid="import-button"
        onClick={onImport}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-blue-500 text-white rounded px-3 py-1 transition"
        title="Import"
      >
        <UploadIcon className="w-4 h-4 text-gray-300" />
        <span>Import</span>
      </button>
      <button
        type="button"
        data-testid="add-team"
        onClick={onAddTeam}
        className="bg-blue-600 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-white text-white rounded px-3 py-1 transition"
      >
        + Add Team
      </button>
      <button
        type="button"
        data-testid="add-task"
        onClick={onAddTask}
        className="bg-blue-600 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-white text-white rounded px-3 py-1 transition"
      >
        + Add Task
      </button>
    </div>
  );
}

import { useState } from 'react';
import { Download, Upload, Users, Plus } from 'lucide-react';
import { Button } from '../Common/Button';
import { useStore, useFileImport } from '../../store/useStore';
import { useToast } from '../../hooks/useToast';

export interface ActionButtonsProps {
  onAddTeam: () => void;
  onAddTask: () => void;
}

export function ActionButtons({ onAddTeam, onAddTask }: ActionButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const exportData = useStore(state => state.exportData);
  const triggerImport = useFileImport();
  const { success, error } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      exportData();
      success('Export Successful', 'Timeline data has been downloaded successfully');
    } catch (exportError) {
      console.error('Export failed:', exportError);
      error(
        'Export Failed', 
        exportError instanceof Error ? exportError.message : 'An unexpected error occurred during export'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    setIsImporting(true);
    triggerImport(
      // onSuccess callback
      () => {
        setIsImporting(false);
        success('Import Successful', 'Timeline data has been imported successfully');
      },
      // onError callback
      (importError: Error) => {
        setIsImporting(false);
        console.error('Import failed:', importError);
        error(
          'Import Failed',
          importError.message || 'An unexpected error occurred during import'
        );
      }
    );
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      {/* Export Button */}
      <Button
        variant="secondary"
        size="md"
        icon={<Download className="h-3 w-3 sm:h-4 sm:w-4" />}
        loading={isExporting}
        loadingText="Exporting..."
        onClick={handleExport}
        className="!text-white !bg-gray-600 !border-gray-600 hover:!bg-gray-700 text-xs sm:text-sm px-2 sm:px-4"
        title="Export Timeline Data"
        aria-label="Export Timeline Data"
      >
        <span className="hidden sm:inline">Export</span>
      </Button>

      {/* Import Button */}
      <Button
        variant="secondary"
        size="md"
        icon={<Upload className="h-3 w-3 sm:h-4 sm:w-4" />}
        loading={isImporting}
        loadingText="Importing..."
        onClick={handleImport}
        className="!text-white !bg-gray-600 !border-gray-600 hover:!bg-gray-700 text-xs sm:text-sm px-2 sm:px-4"
        title="Import Timeline Data"
        aria-label="Import Timeline Data"
      >
        <span className="hidden sm:inline">Import</span>
      </Button>

      {/* Add Team Button */}
      <Button
        variant="secondary"
        size="md"
        icon={<Users className="h-3 w-3 sm:h-4 sm:w-4" />}
        onClick={onAddTeam}
        className="!text-white !bg-gray-600 !border-gray-600 hover:!bg-gray-700 text-xs sm:text-sm px-2 sm:px-4"
        title="Add New Team"
        aria-label="Add New Team"
      >
        <span className="hidden md:inline">+ Add Team</span>
        <span className="md:hidden">Team</span>
      </Button>

      {/* Add Task Button */}
      <Button
        variant="secondary"
        size="md"
        icon={<Plus className="h-3 w-3 sm:h-4 sm:w-4" />}
        onClick={onAddTask}
        className="!text-white !bg-gray-600 !border-gray-600 hover:!bg-gray-700 text-xs sm:text-sm px-2 sm:px-4"
        title="Add New Task"
        aria-label="Add New Task"
      >
        <span className="hidden md:inline">+ Add Task</span>
        <span className="md:hidden">Task</span>
      </Button>
    </div>
  );
}
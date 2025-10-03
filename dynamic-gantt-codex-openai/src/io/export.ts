import type { AppData } from '../state/types';
import { AppDataSchema } from '../state/schema';

export function buildExportPayload(state: AppData): AppData {
  const payload: AppData = {
    scenarios: state.scenarios,
    activeScenario: state.activeScenario,
    swimlanes: state.swimlanes,
    exportDate: new Date().toISOString(),
  };
  // Validate before exporting
  AppDataSchema.parse(payload);
  return payload;
}

export function triggerDownload(filename: string, data: string) {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

export function exportAppData(state: AppData) {
  const payload = buildExportPayload(state);
  const filename = `timeline-export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
  triggerDownload(filename, JSON.stringify(payload, null, 2));
}


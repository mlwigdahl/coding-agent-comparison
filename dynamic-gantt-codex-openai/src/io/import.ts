import { AppDataSchema } from '../state/schema';
import type { AppData } from '../state/types';

export function parseAppDataJson(text: string): AppData {
  const raw = JSON.parse(text);
  return AppDataSchema.parse(raw);
}

export function openImportDialog(onData: (data: AppData) => void, onError: (message: string) => void) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        const data = parseAppDataJson(text);
        onData(data);
      } catch (e: any) {
        onError(e?.message ?? 'Invalid file');
      }
    };
    reader.onerror = () => onError('Failed to read file');
    reader.readAsText(file);
  };
  input.click();
}


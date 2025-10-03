import { ExportData } from '../types';
import { validateImportData } from './dataValidation';
import { MAX_FILE_SIZE } from './constants';

// Export data to JSON file
export async function exportData(data: ExportData): Promise<void> {
  try {
    // Add current timestamp
    const exportDataWithDate = {
      ...data,
      exportDate: new Date().toISOString()
    };
    
    // Create blob with formatted JSON
    const blob = new Blob(
      [JSON.stringify(exportDataWithDate, null, 2)], 
      { type: 'application/json' }
    );
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timeline-export-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export data');
  }
}

// Import data from JSON file with validation
export async function importData(file: File): Promise<ExportData> {
  // Validate file size (security consideration from APP-PLAN.md)
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  // Validate file type
  if (!file.type.includes('application/json') && !file.name.endsWith('.json')) {
    throw new Error('File must be a JSON file');
  }
  
  try {
    // Read file content
    const text = await file.text();
    
    // Parse JSON
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      throw new Error('File contains invalid JSON');
    }
    
    // Validate data structure using Zod schema
    const validation = validateImportData(data);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => {
        const path = err.path.length > 0 ? ` at ${err.path.join('.')}` : '';
        return `${err.message}${path}`;
      }).join(', ');
      
      throw new Error(`Invalid file format: ${errorMessages}`);
    }
    
    return validation.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to import file');
  }
}

// Utility to check if browser supports File API
export function isFileAPISupported(): boolean {
  return 'File' in window && 'FileReader' in window && 'FileList' in window && 'Blob' in window;
}

// Create file input element for import
export function createFileInput(onFileSelect: (file: File) => void): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.style.display = 'none';
  
  input.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  });
  
  return input;
}
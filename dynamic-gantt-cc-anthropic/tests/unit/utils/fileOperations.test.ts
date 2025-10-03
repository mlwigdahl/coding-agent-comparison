import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import {
  exportData,
  importData,
  isFileAPISupported,
  createFileInput
} from '../../../src/utils/fileOperations';
import { ExportData } from '../../../src/types';

// Mock DOM APIs that aren't available in test environment
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockCreateObjectURL = vi.fn();

// Mock global objects
Object.defineProperty(global, 'document', {
  value: {
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild
    }
  },
  writable: true
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL
  },
  writable: true
});

Object.defineProperty(global, 'Blob', {
  value: class MockBlob {
    constructor(public parts: any[], public options: any) {}
  },
  writable: true
});

// Create valid test data
function createValidExportData(overrides: Partial<ExportData> = {}): ExportData {
  return {
    scenarios: [
      {
        name: 'Main Timeline',
        tasks: [
          {
            name: 'Test Task',
            swimlane: 'Test Team',
            startQuarter: 'Q1 2025' as any,
            endQuarter: 'Q2 2025' as any,
            progress: 50,
            color: 'blue' as any
          }
        ]
      }
    ],
    activeScenario: 'Main Timeline',
    swimlanes: ['Test Team'],
    exportDate: '2025-08-26T17:25:25.117Z',
    ...overrides
  };
}

// Create mock File object
function createMockFile(content: string, name: string = 'test.json', type: string = 'application/json', size?: number): File {
  const mockFile = {
    name,
    type,
    size: size ?? content.length,
    text: vi.fn().mockResolvedValue(content)
  } as unknown as File;
  
  return mockFile;
}

describe('fileOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockCreateElement.mockReturnValue({
      click: mockClick,
      style: {},
      addEventListener: vi.fn()
    });
    
    mockCreateObjectURL.mockReturnValue('mock-url');
  });

  describe('exportData', () => {
    it('should export valid data successfully', async () => {
      const data = createValidExportData();
      
      await exportData(data);
      
      // Verify blob creation
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('"scenarios"')],
        { type: 'application/json' }
      );
      
      // Verify URL creation and cleanup
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
      
      // Verify DOM manipulation
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should add current timestamp to export data', async () => {
      const data = createValidExportData();
      const originalDate = data.exportDate;
      
      await exportData(data);
      
      // Get the blob content from the mock call
      const blobCall = (global.Blob as any).mock.calls[0];
      const exportContent = JSON.parse(blobCall[0][0]);
      
      // Should have updated exportDate
      expect(exportContent.exportDate).not.toBe(originalDate);
      expect(new Date(exportContent.exportDate)).toBeInstanceOf(Date);
    });

    it('should create filename with current date', async () => {
      const data = createValidExportData();
      const mockElement = {
        click: mockClick,
        style: {},
        href: '',
        download: ''
      };
      mockCreateElement.mockReturnValue(mockElement);
      
      await exportData(data);
      
      expect(mockElement.download).toMatch(/^timeline-export-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should handle export errors gracefully', async () => {
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Mock URL creation error');
      });
      
      const data = createValidExportData();
      
      await expect(exportData(data)).rejects.toThrow('Failed to export data');
    });

    it('should preserve all data fields in export', async () => {
      const data = createValidExportData({
        scenarios: [
          {
            name: 'Complex Timeline',
            tasks: [
              {
                name: 'Complex Task',
                swimlane: 'Complex Team',
                startQuarter: 'Q1 2025' as any,
                endQuarter: 'Q4 2028' as any,
                progress: 75,
                color: 'indigo' as any
              }
            ]
          },
          {
            name: 'Empty Timeline',
            tasks: []
          }
        ],
        activeScenario: 'Complex Timeline',
        swimlanes: ['Complex Team', 'Another Team']
      });
      
      await exportData(data);
      
      const blobCall = (global.Blob as any).mock.calls[0];
      const exportContent = JSON.parse(blobCall[0][0]);
      
      expect(exportContent.scenarios).toHaveLength(2);
      expect(exportContent.scenarios[0].tasks[0].name).toBe('Complex Task');
      expect(exportContent.scenarios[0].tasks[0].progress).toBe(75);
      expect(exportContent.activeScenario).toBe('Complex Timeline');
      expect(exportContent.swimlanes).toEqual(['Complex Team', 'Another Team']);
    });
  });

  describe('importData', () => {
    it('should import valid JSON file successfully', async () => {
      const validData = createValidExportData();
      const file = createMockFile(JSON.stringify(validData));
      
      const result = await importData(file);
      
      expect(result).toEqual(validData);
    });

    it('should validate file size limits', async () => {
      const data = createValidExportData();
      const file = createMockFile(JSON.stringify(data), 'large.json', 'application/json', 11 * 1024 * 1024); // 11MB
      
      await expect(importData(file)).rejects.toThrow('File size exceeds maximum limit of 10MB');
    });

    it('should validate file type by MIME type', async () => {
      const data = createValidExportData();
      const file = createMockFile(JSON.stringify(data), 'test.json', 'text/plain');
      
      await expect(importData(file)).rejects.toThrow('File must be a JSON file');
    });

    it('should validate file type by extension', async () => {
      const data = createValidExportData();
      const file = createMockFile(JSON.stringify(data), 'test.txt', 'application/json');
      
      await expect(importData(file)).rejects.toThrow('File must be a JSON file');
    });

    it('should accept files with correct extension even with generic MIME type', async () => {
      const data = createValidExportData();
      const file = createMockFile(JSON.stringify(data), 'test.json', 'text/plain');
      
      // This should NOT throw because filename ends with .json
      const result = await importData(file);
      expect(result).toEqual(data);
    });

    it('should handle invalid JSON gracefully', async () => {
      const file = createMockFile('{ invalid json content');
      
      await expect(importData(file)).rejects.toThrow('File contains invalid JSON');
    });

    it('should validate import data structure', async () => {
      const invalidData = {
        scenarios: [], // Empty scenarios should fail validation
        activeScenario: 'Non-existent',
        swimlanes: [],
        exportDate: 'invalid-date'
      };
      const file = createMockFile(JSON.stringify(invalidData));
      
      await expect(importData(file)).rejects.toThrow('Invalid file format');
    });

    it('should provide detailed validation error messages', async () => {
      const invalidData = {
        scenarios: [
          {
            name: '',  // Empty name should fail
            tasks: [
              {
                name: 'Task',
                swimlane: 'Team',
                startQuarter: 'Q5 2025', // Invalid quarter
                endQuarter: 'Q1 2025',
                progress: 150, // Invalid progress
                color: 'red' // Invalid color
              }
            ]
          }
        ],
        activeScenario: 'Timeline',
        swimlanes: ['Team'],
        exportDate: 'invalid-date'
      };
      const file = createMockFile(JSON.stringify(invalidData));
      
      try {
        await importData(file);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).toContain('Invalid file format');
        // Should contain specific validation errors
      }
    });

    it('should handle file read errors', async () => {
      const file = createMockFile('valid json');
      file.text = vi.fn().mockRejectedValue(new Error('File read error'));
      
      await expect(importData(file)).rejects.toThrow('File read error');
    });

    it('should handle complex valid data structures', async () => {
      const complexData = createValidExportData({
        scenarios: [
          {
            name: 'Timeline A',
            tasks: [
              {
                name: 'Task A1',
                swimlane: 'Team Alpha',
                startQuarter: 'Q1 2025' as any,
                endQuarter: 'Q2 2025' as any,
                progress: 0,
                color: 'blue' as any
              },
              {
                name: 'Task A2',
                swimlane: 'Team Beta',
                startQuarter: 'Q3 2025' as any,
                endQuarter: 'Q4 2028' as any,
                progress: 100,
                color: 'indigo' as any
              }
            ]
          },
          {
            name: 'Timeline B',
            tasks: [
              {
                name: 'Task B1',
                swimlane: 'Team Gamma',
                startQuarter: 'Q2 2026' as any,
                endQuarter: 'Q4 2026' as any,
                progress: 50,
                color: 'blue' as any
              }
            ]
          }
        ],
        activeScenario: 'Timeline A',
        swimlanes: ['Team Alpha', 'Team Beta', 'Team Gamma']
      });
      
      const file = createMockFile(JSON.stringify(complexData));
      const result = await importData(file);
      
      expect(result).toEqual(complexData);
      expect(result.scenarios).toHaveLength(2);
      expect(result.scenarios[0].tasks).toHaveLength(2);
      expect(result.scenarios[1].tasks).toHaveLength(1);
    });

    it('should validate unique constraints in import data', async () => {
      const duplicateTaskNames = {
        scenarios: [
          {
            name: 'Timeline A',
            tasks: [
              {
                name: 'Duplicate Task',
                swimlane: 'Team A',
                startQuarter: 'Q1 2025',
                endQuarter: 'Q2 2025',
                progress: 50,
                color: 'blue'
              }
            ]
          },
          {
            name: 'Timeline B',
            tasks: [
              {
                name: 'Duplicate Task', // Same name should fail
                swimlane: 'Team B',
                startQuarter: 'Q3 2025',
                endQuarter: 'Q4 2025',
                progress: 75,
                color: 'indigo'
              }
            ]
          }
        ],
        activeScenario: 'Timeline A',
        swimlanes: ['Team A', 'Team B'],
        exportDate: '2025-08-26T17:25:25.117Z'
      };
      
      const file = createMockFile(JSON.stringify(duplicateTaskNames));
      
      await expect(importData(file)).rejects.toThrow('Invalid file format');
    });
  });

  describe('isFileAPISupported', () => {
    it('should return true when all File APIs are available', () => {
      // Mock all required APIs
      Object.defineProperty(global, 'window', {
        value: {
          File: function() {},
          FileReader: function() {},
          FileList: function() {},
          Blob: function() {}
        },
        writable: true
      });
      
      expect(isFileAPISupported()).toBe(true);
    });

    it('should return false when File API is missing', () => {
      Object.defineProperty(global, 'window', {
        value: {
          // File: undefined,
          FileReader: function() {},
          FileList: function() {},
          Blob: function() {}
        },
        writable: true
      });
      
      expect(isFileAPISupported()).toBe(false);
    });

    it('should return false when FileReader API is missing', () => {
      Object.defineProperty(global, 'window', {
        value: {
          File: function() {},
          // FileReader: undefined,
          FileList: function() {},
          Blob: function() {}
        },
        writable: true
      });
      
      expect(isFileAPISupported()).toBe(false);
    });

    it('should return false when window is not available', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      
      expect(isFileAPISupported()).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('createFileInput', () => {
    it('should create input element with correct attributes', () => {
      const mockElement = {
        type: '',
        accept: '',
        style: { display: '' },
        addEventListener: vi.fn()
      };
      mockCreateElement.mockReturnValue(mockElement);
      
      const onFileSelect = vi.fn();
      const input = createFileInput(onFileSelect);
      
      expect(mockCreateElement).toHaveBeenCalledWith('input');
      expect(mockElement.type).toBe('file');
      expect(mockElement.accept).toBe('.json,application/json');
      expect(mockElement.style.display).toBe('none');
      expect(mockElement.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should call onFileSelect when file is selected', () => {
      const mockFile = createMockFile('test content');
      let changeHandler: (event: Event) => void;
      
      const mockElement = {
        type: '',
        accept: '',
        style: { display: '' },
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        })
      };
      mockCreateElement.mockReturnValue(mockElement);
      
      const onFileSelect = vi.fn();
      createFileInput(onFileSelect);
      
      // Simulate file selection
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as unknown as Event;
      
      changeHandler!(mockEvent);
      
      expect(onFileSelect).toHaveBeenCalledWith(mockFile);
    });

    it('should not call onFileSelect when no file is selected', () => {
      let changeHandler: (event: Event) => void;
      
      const mockElement = {
        type: '',
        accept: '',
        style: { display: '' },
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            changeHandler = handler;
          }
        })
      };
      mockCreateElement.mockReturnValue(mockElement);
      
      const onFileSelect = vi.fn();
      createFileInput(onFileSelect);
      
      // Simulate no file selection
      const mockEvent = {
        target: {
          files: []
        }
      } as unknown as Event;
      
      changeHandler!(mockEvent);
      
      expect(onFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('security and performance considerations', () => {
    it('should handle very large valid JSON files within size limit', async () => {
      // Create large but valid data (under 10MB limit)
      const largeData = createValidExportData({
        scenarios: Array(100).fill(null).map((_, i) => ({
          name: `Timeline ${i}`,
          tasks: Array(10).fill(null).map((_, j) => ({
            name: `Task ${i}-${j}`,
            swimlane: `Team ${i}`,
            startQuarter: 'Q1 2025' as any,
            endQuarter: 'Q2 2025' as any,
            progress: j * 10,
            color: 'blue' as any
          }))
        })),
        activeScenario: 'Timeline 0',
        swimlanes: Array(100).fill(null).map((_, i) => `Team ${i}`)
      });
      
      const content = JSON.stringify(largeData);
      const file = createMockFile(content, 'large.json', 'application/json', content.length);
      
      // Should not throw for large but valid file
      const result = await importData(file);
      expect(result.scenarios).toHaveLength(100);
    });

    it('should prevent processing files that are too large', async () => {
      const file = createMockFile('small content', 'huge.json', 'application/json', 11 * 1024 * 1024);
      
      await expect(importData(file)).rejects.toThrow('File size exceeds maximum limit');
    });

    it('should handle malformed JSON without crashing', async () => {
      const malformedCases = [
        '{ "incomplete": ',
        '{ "missing": "quote }',
        '[ { "nested": { "incomplete" }',
        'not json at all',
        '{"scenarios":}', // Invalid syntax
        '{"circular": {"ref": circular}}' // This would be invalid JSON anyway
      ];
      
      for (const malformed of malformedCases) {
        const file = createMockFile(malformed);
        await expect(importData(file)).rejects.toThrow('File contains invalid JSON');
      }
    });

    it('should handle edge case empty files', async () => {
      const file = createMockFile('');
      
      await expect(importData(file)).rejects.toThrow('File contains invalid JSON');
    });

    it('should handle edge case whitespace-only files', async () => {
      const file = createMockFile('   \n\t   ');
      
      await expect(importData(file)).rejects.toThrow('File contains invalid JSON');
    });
  });
});
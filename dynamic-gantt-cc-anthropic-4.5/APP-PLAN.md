# Dynamic Project Timeline - Architecture and Implementation Plan

## 1. Executive Summary

This document provides a comprehensive architecture and implementation plan for a browser-only, single-page application (SPA) that enables dynamic project timeline tracking with quarterly views. The application allows users to manage multiple timeline scenarios, teams, and tasks with visual Gantt-style representation, import/export capabilities, and smooth animations.

## 2. Tech Stack and Project Infrastructure

### 2.1 Core Technologies

- **Framework**: React 18.x with TypeScript 5.x
  - Component-based architecture for modular UI
  - Type safety to prevent runtime errors
  - Excellent ecosystem and tooling

- **Build Tool**: Vite 5.x
  - Fast development server with HMR
  - Optimized production builds
  - Native ESM support
  - Excellent TypeScript integration

- **Styling**: Tailwind CSS 3.x
  - Utility-first approach for rapid development
  - Consistent design tokens
  - Built-in responsive design utilities
  - Easy custom color configuration

- **State Management**: React Context API + Custom Hooks
  - Sufficient for application complexity (YAGNI principle)
  - No external dependencies needed
  - Built-in React features

- **Data Persistence**: Browser localStorage API
  - Browser-only requirement (no backend)
  - Simple key-value storage
  - Synchronous API for immediate reads/writes

### 2.2 Development Dependencies

- **Testing Framework**: Vitest 1.x
  - Native Vite integration
  - Jest-compatible API
  - Fast execution

- **Testing Library**: @testing-library/react 14.x
  - User-centric testing approach
  - Best practices for React testing

- **Linting**: ESLint 8.x
  - Code quality and consistency
  - TypeScript-aware rules

- **Formatting**: Prettier 3.x
  - Automatic code formatting
  - Consistent style across team

### 2.3 Production Dependencies

- **React**: react, react-dom (18.x)
- **Icons**: lucide-react (for calendar, pen, clock, trash, download icons)
- **UUID Generation**: crypto.randomUUID (native browser API)

### 2.4 Development Environment

- **Node.js**: v18+ (for build tooling)
- **Package Manager**: npm or yarn
- **Browser Targets**: Modern browsers (ES2020+)

## 3. Project Structure

```
dynamic-gantt-cc-anthropic-4.5/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   └── index.ts
│   │   ├── Timeline/
│   │   │   ├── Timeline.tsx
│   │   │   ├── Timeline.test.tsx
│   │   │   ├── TimelineHeader.tsx
│   │   │   └── index.ts
│   │   ├── Swimlane/
│   │   │   ├── Swimlane.tsx
│   │   │   ├── Swimlane.test.tsx
│   │   │   ├── Task.tsx
│   │   │   ├── Task.test.tsx
│   │   │   └── index.ts
│   │   ├── Modals/
│   │   │   ├── TaskModal.tsx
│   │   │   ├── TaskModal.test.tsx
│   │   │   ├── TimelineModal.tsx
│   │   │   ├── TimelineModal.test.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── contexts/
│   │   ├── DataContext.tsx
│   │   ├── DataContext.test.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useLocalStorage.test.ts
│   │   ├── useFileImportExport.ts
│   │   ├── useFileImportExport.test.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── utils/
│   │   ├── taskStacking.ts
│   │   ├── taskStacking.test.ts
│   │   ├── validation.ts
│   │   ├── validation.test.ts
│   │   ├── quarters.ts
│   │   ├── quarters.test.ts
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts
│   ├── styles/
│   │   └── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── vitest.config.ts
├── SPEC.md
└── APP-PLAN.md (this file)
```

## 4. Data Model and Type Definitions

### 4.1 Core Types (src/types/index.ts)

```typescript
export type ColorTheme = 'blue' | 'indigo';

export type Quarter =
  | 'Q1 2025' | 'Q2 2025' | 'Q3 2025' | 'Q4 2025'
  | 'Q1 2026' | 'Q2 2026' | 'Q3 2026' | 'Q4 2026'
  | 'Q1 2027' | 'Q2 2027' | 'Q3 2027' | 'Q4 2027'
  | 'Q1 2028' | 'Q2 2028' | 'Q3 2028' | 'Q4 2028';

export interface Task {
  name: string;
  swimlane: string;  // team name
  startQuarter: Quarter;
  endQuarter: Quarter;
  progress: number;  // 0-100
  color: ColorTheme;
}

export interface Scenario {
  name: string;
  tasks: Task[];
}

export interface AppData {
  scenarios: Scenario[];
  activeScenario: string;
  swimlanes: string[];  // team names
  exportDate?: string;
}

export interface StackedTask extends Task {
  row: number;  // for vertical stacking within swimlane
}
```

### 4.2 Validation Rules (src/utils/validation.ts)

- Names must be trimmed (no leading/trailing whitespace)
- Names must be unique within their category (tasks, teams, scenarios)
- Progress must be integer 0-100 inclusive
- Start quarter must be <= end quarter
- All required fields must be present

## 5. Core Features and Implementation Details

### 5.1 Application State Management

**File**: `src/contexts/DataContext.tsx`

**Purpose**: Centralized state management for all application data.

**State Structure**:
```typescript
{
  data: AppData,
  setData: (data: AppData) => void,
  addTask: (scenarioName: string, task: Task) => void,
  updateTask: (scenarioName: string, oldName: string, newTask: Task) => void,
  deleteTask: (scenarioName: string, taskName: string) => void,
  addScenario: (name: string) => void,
  setActiveScenario: (name: string) => void,
  addTeam: (name: string) => void,
  getAllTaskNames: () => string[],
  getAllTeamNames: () => string[],
  getAllScenarioNames: () => string[]
}
```

**Implementation Details**:
- Use `useLocalStorage` hook to persist data automatically
- Provide validation before state updates
- Ensure immutability using spread operators
- Initialize with default data if localStorage is empty

**Default Initial Data**:
```typescript
{
  scenarios: [{ name: "Main Timeline", tasks: [] }],
  activeScenario: "Main Timeline",
  swimlanes: []
}
```

### 5.2 Task Stacking Algorithm

**File**: `src/utils/taskStacking.ts`

**Function**: `stackTasks(tasks: Task[], quarters: Quarter[]): StackedTask[]`

**Algorithm**: Greedy row assignment with minimal rows

1. Convert quarters to numeric indices for comparison
2. Sort tasks by start quarter, then by duration (longer first)
3. Initialize empty array to track occupied ranges per row
4. For each task:
   - Find the first row where the task's quarter range doesn't overlap with any existing task
   - If no row is available, create a new row
   - Assign task to row and record the occupied range
5. Return tasks with row assignments

**Complexity**: O(n² * m) where n = number of tasks, m = number of rows (typically small)

**Example**:
```
Input:
  Task A: Q1-Q2
  Task B: Q1-Q3
  Task C: Q3-Q4

Output:
  Task B: row 0 (longest)
  Task A: row 1 (overlaps with B in Q1-Q2)
  Task C: row 0 (no overlap with B in Q3-Q4)
```

### 5.3 Quarter Management

**File**: `src/utils/quarters.ts`

**Functions**:
- `getAllQuarters(): Quarter[]` - Returns array of all quarters Q1 2025 - Q4 2028
- `getQuarterIndex(quarter: Quarter): number` - Returns 0-based index
- `compareQuarters(q1: Quarter, q2: Quarter): number` - Returns -1, 0, or 1
- `getQuartersBetween(start: Quarter, end: Quarter): Quarter[]` - Inclusive range

### 5.4 Import/Export Functionality

**File**: `src/hooks/useFileImportExport.ts`

**Export Function**: `exportData(data: AppData): void`
1. Add `exportDate` field with current ISO timestamp
2. Serialize to JSON with 2-space indentation
3. Create Blob with MIME type `application/json`
4. Create temporary download link with filename `timeline-data-YYYY-MM-DD.json`
5. Programmatically click link to trigger download
6. Clean up object URL

**Import Function**: `importData(onSuccess: (data: AppData) => void, onError: (error: string) => void): void`
1. Create hidden file input element accepting `.json`
2. Attach change handler:
   - Read file using FileReader API
   - Parse JSON
   - Validate structure using JSON schema validation
   - Validate business rules (unique names, valid quarters, etc.)
   - If valid, call onSuccess callback
   - If invalid, call onError callback with descriptive message
3. Programmatically click input to open file picker
4. Clean up input element

**Validation Rules**:
- Must have `scenarios`, `activeScenario`, and `swimlanes` properties
- `activeScenario` must exist in `scenarios` array
- All tasks must reference swimlanes that exist in `swimlanes` array
- All quarters must be valid
- All progress values must be 0-100
- All names must be unique within their category

### 5.5 CSS Animations

**File**: `src/styles/index.css`

**Implementation**: Use CSS transitions on task positioning

```css
.task-element {
  transition: transform 2s ease-in-out, opacity 2s ease-in-out;
}

.task-enter {
  opacity: 0;
}

.task-enter-active {
  opacity: 1;
}

.task-exit {
  opacity: 1;
}

.task-exit-active {
  opacity: 0;
}
```

**Strategy**:
- Assign unique key to each task based on task name
- When scenario changes, React will animate tasks with matching names
- Tasks with same name = same key = animated repositioning
- New tasks = fade in
- Removed tasks = fade out

### 5.6 LocalStorage Persistence

**File**: `src/hooks/useLocalStorage.ts`

**Hook**: `useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void]`

**Implementation**:
```typescript
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
```

**Storage Key**: `dynamic-timeline-data`

## 6. Component Architecture

### 6.1 App Component (src/components/App.tsx)

**Responsibility**: Root component, provides DataContext

**Structure**:
```tsx
<DataProvider>
  <div className="app-container">
    <Header />
    <Timeline />
  </div>
</DataProvider>
```

### 6.2 Header Component (src/components/Header/Header.tsx)

**Responsibility**: Top navigation bar with controls

**Structure**:
- Black background (`bg-gray-900`)
- Flex container with space-between
- Left section:
  - Calendar icon (lucide-react: `Calendar`, blue color `#3b82f6`)
  - Title text (bold, white)
  - Timeline dropdown (select element)
  - "+" button for new timeline
- Right section:
  - Export button (download icon, "Export" text)
  - Import button (upload icon, "Import" text)
  - "+ Add Team" button
  - "+ Add Task" button

**State**:
- Modal visibility flags (taskModalOpen, timelineModalOpen)
- Current editing task (if any)

**Event Handlers**:
- handleTimelineChange
- handleNewTimeline
- handleAddTask
- handleAddTeam
- handleExport
- handleImport

### 6.3 Timeline Component (src/components/Timeline/Timeline.tsx)

**Responsibility**: Quarterly grid and swimlanes

**Structure**:
```tsx
<div className="timeline-container">
  <TimelineHeader />
  {swimlanes.map(swimlane => (
    <Swimlane
      key={swimlane}
      name={swimlane}
      tasks={getTasksForSwimlane(swimlane)}
    />
  ))}
</div>
```

**Layout**:
- CSS Grid with fixed left column and scrollable right columns
- Left column: 200px fixed width
- Quarter columns: 100px each, 16 total (Q1 2025 - Q4 2028)
- Year separators: border-left on Q1 of each year

### 6.4 TimelineHeader Component (src/components/Timeline/TimelineHeader.tsx)

**Responsibility**: Column headers for quarters

**Structure**:
- "Teams" header with icon in first column
- Quarter headers: "Q1" (bold) / "2025" (smaller, gray)
- Vertical separators before Q1 2026, Q1 2027, Q1 2028

### 6.5 Swimlane Component (src/components/Swimlane/Swimlane.tsx)

**Props**:
```typescript
interface SwimlaneProps {
  name: string;
  tasks: Task[];
}
```

**Responsibility**: Display team name and all tasks for that team

**Implementation**:
1. Use `stackTasks` utility to get tasks with row assignments
2. Calculate height based on max row count
3. Render team name with task count in first column
4. Render each task using Task component with absolute positioning

**Layout**:
- Min height: 80px
- Height per row: 60px (task height 50px + 10px gap)
- Team name in first column, vertically centered
- Task count in gray text, e.g., "Pet Fish (3)"

### 6.6 Task Component (src/components/Swimlane/Task.tsx)

**Props**:
```typescript
interface TaskProps {
  task: StackedTask;
  onClick: () => void;
}
```

**Responsibility**: Render individual task graphic

**Visual Design**:
- Rounded ends (pill shape): `border-radius: 9999px`
- Height: 50px
- Positioned based on startQuarter, endQuarter, and row
- Width calculated from quarter span
- Border: 2px solid darker shade of color
- Background: color based on theme and completion status
  - If progress === 100: use completed color
  - Else: use uncompleted color

**Content**:
- Task name (left-aligned, white text, medium weight, truncate with ellipsis)
- Progress percentage (right-aligned, white text, medium weight, e.g., "75%")
- Progress bar at bottom (orange `#f97316`, height 4px, width = progress%)

**Colors**:
```typescript
const colors = {
  blue: {
    uncompleted: '#3b82f6',
    completed: '#1e40af',
  },
  indigo: {
    uncompleted: '#6366f1',
    completed: '#3730a3',
  }
};
```

**Interaction**:
- Cursor: pointer
- Click handler: open TaskModal with current task data

### 6.7 Modal Component (src/components/Modals/Modal.tsx)

**Responsibility**: Reusable modal container

**Structure**:
- Overlay: fixed position, full screen, semi-transparent black
- Modal box: centered, white background, rounded corners, shadow
- Close on overlay click (optional)
- ESC key to close

### 6.8 TaskModal Component (src/components/Modals/TaskModal.tsx)

**Props**:
```typescript
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;  // undefined = adding new task
  onSave: (task: Task) => void;
  onDelete?: () => void;  // undefined when adding new task
}
```

**Structure**:
- Header: Pen icon + "Edit Task" or "Add Task"
- Form fields:
  - Text input: Task Name
  - Dropdown: Team (from DataContext)
  - Dropdown: Start Quarter
  - Dropdown: End Quarter
  - Number input: Progress (%) - integer 0-100
  - Dropdown: Color Theme (Blue, Indigo)
- Buttons:
  - Blue "Update Task" or "Add Task" (primary action)
  - Red "Delete" button with trash icon (only if editing)
  - White "Cancel" button

**Validation**:
- Task name required, trimmed, unique
- Team required
- Start <= End quarter
- Progress 0-100 integer
- Display error messages inline

### 6.9 TimelineModal Component (src/components/Modals/TimelineModal.tsx)

**Props**:
```typescript
interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}
```

**Structure**:
- Header: Clock icon + "Add New Timeline"
- Form fields:
  - Text input: Timeline Name
- Buttons:
  - Blue "Save Timeline" (primary action)
  - White "Cancel" button

**Validation**:
- Timeline name required, trimmed, unique

## 7. Naming and Coding Conventions

### 7.1 TypeScript Conventions

- Use PascalCase for types, interfaces, components
- Use camelCase for variables, functions, props
- Use UPPER_SNAKE_CASE for constants
- Prefer `interface` over `type` for object shapes
- Use explicit return types for functions
- Avoid `any` type; use `unknown` if necessary

### 7.2 React Conventions

- Functional components only
- Use hooks (useState, useEffect, useContext, custom hooks)
- Props interface defined above component
- Export component as default at end of file
- Named exports for sub-components

### 7.3 File Naming

- Components: PascalCase (e.g., `TaskModal.tsx`)
- Utilities: camelCase (e.g., `taskStacking.ts`)
- Test files: `.test.ts` or `.test.tsx` suffix
- Index files: `index.ts` for barrel exports

### 7.4 CSS/Styling

- Use Tailwind utility classes
- Custom CSS only when necessary
- BEM naming if custom CSS needed
- Responsive design: mobile-first approach

### 7.5 Comments and Documentation

- JSDoc comments for complex functions
- Inline comments for non-obvious logic
- README for setup instructions
- No excessive comments for self-explanatory code

## 8. Testing Strategy

### 8.1 Unit Tests

**Coverage Target**: 80% code coverage

**Test Files**: Co-located with source files (`.test.ts` or `.test.tsx`)

**Testing Utilities**:
- Vitest for test runner
- @testing-library/react for component testing
- @testing-library/user-event for user interactions

**What to Test**:

1. **Utility Functions** (100% coverage expected):
   - `taskStacking.ts`: Various overlap scenarios, edge cases
   - `validation.ts`: All validation rules, error cases
   - `quarters.ts`: All quarter operations

2. **Custom Hooks**:
   - `useLocalStorage`: Read/write, error handling
   - `useFileImportExport`: Export format, import validation

3. **Components**:
   - Task: Renders correctly with different props, click handler
   - Swimlane: Stacking calculation, rendering tasks
   - Modals: Form validation, submit/cancel actions
   - Header: Button clicks, dropdown changes

4. **Context**:
   - DataContext: All CRUD operations, validation

### 8.2 Integration Tests

**Focus**: Component interaction and data flow

**Examples**:
- Add task through modal → appears in correct swimlane
- Switch timelines → tasks animate to new positions
- Export → import → data matches
- Delete task → removed from display and state

### 8.3 Manual Testing Checklist

- [ ] Visual design matches spec
- [ ] Animations smooth (2 second duration)
- [ ] Colors match spec exactly
- [ ] Import/export works with example JSON
- [ ] Validation prevents invalid data
- [ ] localStorage persists across page reloads
- [ ] Responsive layout works on different screen sizes

## 9. Implementation Plan

### Phase 1: Project Setup and Foundation

#### Step 1.1: Initialize Project

**Actions**:
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
npm install -D @testing-library/jest-dom
npm install -D eslint prettier eslint-config-prettier
```

**Configure Files**:
- `tailwind.config.js`: Add custom colors, configure content paths
- `vite.config.ts`: Add test configuration
- `vitest.config.ts`: Configure test environment
- `.eslintrc.cjs`: Set up linting rules
- `.prettierrc`: Set up formatting rules
- `tsconfig.json`: Configure strict mode

**Success Criteria**:
- [ ] `npm run dev` starts development server
- [ ] `npm run build` creates production build
- [ ] `npm run test` runs test suite (even if empty)
- [ ] `npm run lint` runs without errors
- [ ] TypeScript compiles without errors

**Validation**:
```bash
npm run dev  # Should open browser to http://localhost:5173
npm run build  # Should create dist/ folder
npm run test  # Should run (0 tests)
npm run lint  # Should pass
```

---

#### Step 1.2: Define Core Types

**File**: `src/types/index.ts`

**Actions**:
- Define `ColorTheme`, `Quarter`, `Task`, `Scenario`, `AppData`, `StackedTask` types
- Export all types

**Test File**: `src/types/index.test.ts`
- Test type exports are accessible
- Test Quarter type has all expected values

**Success Criteria**:
- [ ] All types defined and exported
- [ ] TypeScript compilation passes
- [ ] Types can be imported in other files

**Validation**:
```bash
npm run build  # Should compile without type errors
```

---

#### Step 1.3: Create Constants

**File**: `src/constants/index.ts`

**Actions**:
```typescript
export const QUARTERS: Quarter[] = [
  'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025',
  // ... all quarters through Q4 2028
];

export const COLOR_THEMES = {
  blue: {
    uncompleted: '#3b82f6',
    completed: '#1e40af',
  },
  indigo: {
    uncompleted: '#6366f1',
    completed: '#3730a3',
  },
  orange: '#f97316',
};

export const STORAGE_KEY = 'dynamic-timeline-data';
```

**Success Criteria**:
- [ ] Constants defined and exported
- [ ] Can be imported in other files

**Validation**:
```bash
npm run build  # Should compile without errors
```

---

### Phase 2: Utility Functions

#### Step 2.1: Quarter Utilities

**File**: `src/utils/quarters.ts`
**Test File**: `src/utils/quarters.test.ts`

**Actions**:
- Implement `getAllQuarters()`
- Implement `getQuarterIndex()`
- Implement `compareQuarters()`
- Implement `getQuartersBetween()`
- Write comprehensive tests

**Success Criteria**:
- [ ] All functions implemented
- [ ] 100% test coverage
- [ ] All tests passing

**Validation**:
```bash
npm run test quarters  # All tests pass
npm run test -- --coverage  # 100% coverage for quarters.ts
```

---

#### Step 2.2: Validation Utilities

**File**: `src/utils/validation.ts`
**Test File**: `src/utils/validation.test.ts`

**Actions**:
- Implement `validateTaskName()`
- Implement `validateTeamName()`
- Implement `validateScenarioName()`
- Implement `validateProgress()`
- Implement `validateQuarterRange()`
- Implement `validateAppData()` (for import)
- Write comprehensive tests for all validation rules

**Success Criteria**:
- [ ] All validation functions implemented
- [ ] 100% test coverage
- [ ] All tests passing
- [ ] Handles edge cases (empty strings, whitespace, duplicates)

**Validation**:
```bash
npm run test validation  # All tests pass
npm run test -- --coverage  # 100% coverage for validation.ts
```

---

#### Step 2.3: Task Stacking Algorithm

**File**: `src/utils/taskStacking.ts`
**Test File**: `src/utils/taskStacking.test.ts`

**Actions**:
- Implement `stackTasks()` function
- Write tests for:
  - No tasks (empty array)
  - Single task
  - Non-overlapping tasks (same row)
  - Overlapping tasks (multiple rows)
  - Complex scenarios (3+ rows)
  - Tasks with same start but different end

**Success Criteria**:
- [ ] Algorithm implemented and working
- [ ] 100% test coverage
- [ ] All tests passing
- [ ] No tasks overlap in same row

**Validation**:
```bash
npm run test taskStacking  # All tests pass
npm run test -- --coverage  # 100% coverage for taskStacking.ts
```

---

### Phase 3: State Management

#### Step 3.1: LocalStorage Hook

**File**: `src/hooks/useLocalStorage.ts`
**Test File**: `src/hooks/useLocalStorage.test.ts`

**Actions**:
- Implement `useLocalStorage<T>()` hook
- Handle JSON serialization/deserialization
- Handle errors gracefully
- Write tests with mocked localStorage

**Success Criteria**:
- [ ] Hook implemented
- [ ] Persists data to localStorage
- [ ] Reads data from localStorage on mount
- [ ] Handles parse errors
- [ ] 100% test coverage

**Validation**:
```bash
npm run test useLocalStorage  # All tests pass
```

---

#### Step 3.2: Data Context

**File**: `src/contexts/DataContext.tsx`
**Test File**: `src/contexts/DataContext.test.tsx`

**Actions**:
- Create DataContext and DataProvider
- Implement all CRUD operations:
  - `addTask`, `updateTask`, `deleteTask`
  - `addScenario`, `setActiveScenario`
  - `addTeam`
  - `getAllTaskNames`, `getAllTeamNames`, `getAllScenarioNames`
- Use `useLocalStorage` hook for persistence
- Validate all operations before state updates
- Write comprehensive tests

**Success Criteria**:
- [ ] Context provides all required methods
- [ ] Data persists to localStorage automatically
- [ ] Validation prevents invalid operations
- [ ] 90%+ test coverage
- [ ] All tests passing

**Validation**:
```bash
npm run test DataContext  # All tests pass
# Manual: Check localStorage in browser dev tools
```

---

#### Step 3.3: File Import/Export Hook

**File**: `src/hooks/useFileImportExport.ts`
**Test File**: `src/hooks/useFileImportExport.test.ts`

**Actions**:
- Implement `exportData()` function
- Implement `importData()` function
- Handle file I/O with browser APIs
- Validate imported data structure
- Write tests with mocked File API

**Success Criteria**:
- [ ] Export creates valid JSON file
- [ ] Export filename includes date
- [ ] Import validates file structure
- [ ] Import rejects invalid files with descriptive errors
- [ ] 90%+ test coverage

**Validation**:
```bash
npm run test useFileImportExport  # All tests pass
# Manual: Export file, inspect JSON structure
# Manual: Import valid/invalid files, verify behavior
```

---

### Phase 4: Basic UI Components

#### Step 4.1: App Shell

**File**: `src/components/App.tsx`
**File**: `src/main.tsx`
**File**: `src/styles/index.css`

**Actions**:
- Set up Tailwind CSS imports
- Create basic App component with DataProvider
- Configure global styles
- Create placeholder for Header and Timeline

**Success Criteria**:
- [ ] App renders in browser
- [ ] Tailwind CSS is working
- [ ] No console errors
- [ ] DataContext is accessible in component tree

**Validation**:
```bash
npm run dev  # Open browser, see placeholder UI
```

---

#### Step 4.2: Modal Component

**File**: `src/components/Modals/Modal.tsx`
**Test File**: `src/components/Modals/Modal.test.tsx`

**Actions**:
- Create reusable Modal component
- Implement overlay, modal box, close button
- Handle ESC key press
- Handle overlay click
- Style with Tailwind
- Write tests

**Success Criteria**:
- [ ] Modal renders when open
- [ ] Modal closes on ESC, overlay click, close button
- [ ] Accessible (focus management, ARIA attributes)
- [ ] Tests passing

**Validation**:
```bash
npm run test Modal  # All tests pass
# Manual: Open/close modal with keyboard and mouse
```

---

#### Step 4.3: Header Component

**File**: `src/components/Header/Header.tsx`
**Test File**: `src/components/Header/Header.test.tsx`

**Actions**:
- Implement Header layout (black background, flex container)
- Add calendar icon and title
- Add timeline dropdown (connected to DataContext)
- Add "+" new timeline button
- Add Export/Import buttons
- Add "+ Add Team" and "+ Add Task" buttons
- Style with Tailwind to match spec
- Write tests

**Success Criteria**:
- [ ] Header renders with all elements
- [ ] Matches design spec (colors, spacing, layout)
- [ ] Buttons have click handlers (can be no-ops for now)
- [ ] Dropdown shows scenarios from context
- [ ] Tests passing

**Validation**:
```bash
npm run test Header  # All tests pass
npm run dev  # Verify visual design
```

---

### Phase 5: Timeline and Task Display

#### Step 5.1: Timeline Header

**File**: `src/components/Timeline/TimelineHeader.tsx`
**Test File**: `src/components/Timeline/TimelineHeader.test.tsx`

**Actions**:
- Create grid layout for quarter headers
- First column: "Teams" with icon
- Quarter columns: Q1-Q4 for each year 2025-2028
- Year separators (border-left)
- Style text (bold quarters, gray years)
- Write tests

**Success Criteria**:
- [ ] Header renders all 16 quarters
- [ ] Columns align with grid
- [ ] Styling matches spec
- [ ] Tests passing

**Validation**:
```bash
npm run test TimelineHeader  # All tests pass
npm run dev  # Verify visual layout
```

---

#### Step 5.2: Task Component

**File**: `src/components/Swimlane/Task.tsx`
**Test File**: `src/components/Swimlane/Task.test.tsx`

**Actions**:
- Create Task component with pill shape
- Calculate positioning from quarters
- Calculate width from quarter span
- Apply colors based on theme and completion
- Render task name and progress
- Render progress bar
- Add click handler
- Style with Tailwind and custom CSS
- Write tests

**Success Criteria**:
- [ ] Task renders with correct shape
- [ ] Colors match spec exactly
- [ ] Progress bar width matches percentage
- [ ] Task name truncates if too long
- [ ] Click handler fires
- [ ] Tests passing

**Validation**:
```bash
npm run test Task  # All tests pass
npm run dev  # Verify visual design with sample data
```

---

#### Step 5.3: Swimlane Component

**File**: `src/components/Swimlane/Swimlane.tsx`
**Test File**: `src/components/Swimlane/Swimlane.test.tsx`

**Actions**:
- Create Swimlane component
- Render team name with task count
- Use `stackTasks` utility
- Calculate height based on row count
- Position tasks with absolute positioning
- Write tests

**Success Criteria**:
- [ ] Swimlane renders team name correctly
- [ ] Task count is accurate
- [ ] Tasks are stacked without overlap
- [ ] Height adjusts to fit all rows
- [ ] Tests passing

**Validation**:
```bash
npm run test Swimlane  # All tests pass
npm run dev  # Verify stacking with overlapping tasks
```

---

#### Step 5.4: Timeline Component

**File**: `src/components/Timeline/Timeline.tsx`
**Test File**: `src/components/Timeline/Timeline.test.tsx`

**Actions**:
- Create Timeline component
- Render TimelineHeader
- Render Swimlane for each team
- Connect to DataContext for data
- Filter tasks by active scenario
- Write tests

**Success Criteria**:
- [ ] Timeline renders header and swimlanes
- [ ] Shows tasks from active scenario only
- [ ] Updates when scenario changes
- [ ] Tests passing

**Validation**:
```bash
npm run test Timeline  # All tests pass
npm run dev  # Verify full timeline display
```

---

### Phase 6: Modal Dialogs and Interactions

#### Step 6.1: TaskModal Component

**File**: `src/components/Modals/TaskModal.tsx`
**Test File**: `src/components/Modals/TaskModal.test.tsx`

**Actions**:
- Create TaskModal component
- Add form fields (name, team, quarters, progress, color)
- Populate fields when editing existing task
- Implement validation
- Display error messages
- Connect to DataContext for save/delete
- Write tests

**Success Criteria**:
- [ ] Modal opens with correct initial data
- [ ] Form validation works
- [ ] Save updates task in context
- [ ] Delete removes task from context
- [ ] Cancel closes without changes
- [ ] Tests passing

**Validation**:
```bash
npm run test TaskModal  # All tests pass
npm run dev  # Manual test: add, edit, delete tasks
```

---

#### Step 6.2: TimelineModal Component

**File**: `src/components/Modals/TimelineModal.tsx`
**Test File**: `src/components/Modals/TimelineModal.test.tsx`

**Actions**:
- Create TimelineModal component
- Add form field (timeline name)
- Implement validation (unique name)
- Connect to DataContext to add scenario
- Write tests

**Success Criteria**:
- [ ] Modal opens and closes correctly
- [ ] Name validation works
- [ ] Save creates new scenario in context
- [ ] New scenario appears in dropdown
- [ ] Tests passing

**Validation**:
```bash
npm run test TimelineModal  # All tests pass
npm run dev  # Manual test: add new timeline
```

---

#### Step 6.3: Add Team Functionality

**Actions**:
- Add "Add Team" button handler in Header
- Show prompt or modal for team name
- Validate and add to DataContext
- Write tests for team addition flow

**Success Criteria**:
- [ ] Can add new team via header button
- [ ] Team appears in task modal dropdown
- [ ] Team appears as new swimlane
- [ ] Validation prevents duplicate names

**Validation**:
```bash
npm run dev  # Manual test: add team, verify it appears
```

---

### Phase 7: Import/Export Integration

#### Step 7.1: Export Button Integration

**Actions**:
- Connect Export button in Header to `exportData`
- Pass current data from DataContext
- Test export with sample data
- Verify JSON structure matches spec

**Success Criteria**:
- [ ] Export button downloads JSON file
- [ ] Filename includes current date
- [ ] JSON structure matches spec example
- [ ] File includes all scenarios, swimlanes, tasks

**Validation**:
```bash
npm run dev  # Manual test: export, inspect file
# Verify JSON structure matches SPEC.md example
```

---

#### Step 7.2: Import Button Integration

**Actions**:
- Connect Import button in Header to `importData`
- Display error messages if import fails
- Update DataContext with imported data
- Test with valid and invalid files

**Success Criteria**:
- [ ] Import button opens file picker
- [ ] Valid files load successfully
- [ ] Invalid files show error message
- [ ] Data persists to localStorage after import
- [ ] UI updates to show imported data

**Validation**:
```bash
npm run dev  # Manual tests:
# 1. Export data, modify, import back
# 2. Import spec example JSON
# 3. Try importing invalid JSON
# 4. Try importing JSON with wrong structure
```

---

### Phase 8: Animations and Polish

#### Step 8.1: CSS Animations

**File**: `src/styles/index.css` or component CSS

**Actions**:
- Add CSS transitions to Task component
- Ensure tasks with same name have same key
- Test animation when switching scenarios
- Tune timing to 2 seconds

**Success Criteria**:
- [ ] Tasks smoothly transition position over 2 seconds
- [ ] New tasks fade in
- [ ] Removed tasks fade out
- [ ] Animation is smooth (no jank)

**Validation**:
```bash
npm run dev  # Manual test:
# 1. Create timeline with tasks
# 2. Create second timeline with some same tasks in different positions
# 3. Switch between timelines
# 4. Verify tasks with same name animate, others fade in/out
```

---

#### Step 8.2: Visual Polish

**Actions**:
- Fine-tune spacing, padding, margins
- Ensure colors match spec exactly
- Add hover states for interactive elements
- Ensure responsive layout works
- Test on different screen sizes
- Verify icons are correct

**Success Criteria**:
- [ ] Visual design matches SPEC.md exactly
- [ ] Colors are correct (use color picker to verify)
- [ ] Layout is responsive
- [ ] All icons are correct and visible
- [ ] No visual bugs or alignment issues

**Validation**:
```bash
npm run dev  # Manual visual inspection
# Use browser color picker to verify hex colors
# Test at different viewport sizes
```

---

#### Step 8.3: Accessibility

**Actions**:
- Add ARIA labels to buttons and form fields
- Ensure keyboard navigation works
- Test with screen reader
- Ensure focus indicators are visible
- Add alt text for icons

**Success Criteria**:
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Tab order is logical
- [ ] Screen reader announces content correctly

**Validation**:
```bash
npm run dev  # Manual test:
# 1. Navigate entire app with keyboard only
# 2. Verify focus indicators
# 3. Test with screen reader (VoiceOver on Mac)
```

---

### Phase 9: Testing and Quality Assurance

#### Step 9.1: Integration Tests

**Actions**:
- Write integration tests for complete user flows:
  - Add task → verify display
  - Edit task → verify changes
  - Delete task → verify removal
  - Switch scenarios → verify animation
  - Export → import → verify data match
- Run all tests

**Success Criteria**:
- [ ] All integration tests passing
- [ ] Test coverage >= 80%
- [ ] No console errors or warnings

**Validation**:
```bash
npm run test  # All tests pass
npm run test -- --coverage  # Verify coverage >= 80%
```

---

#### Step 9.2: Manual Testing

**Actions**:
- Follow manual testing checklist from Section 8.3
- Test with example JSON from SPEC.md
- Test edge cases:
  - Very long task names
  - Many overlapping tasks (stress test stacking)
  - Empty swimlanes
  - Single swimlane with many tasks
- Test error scenarios:
  - Duplicate names
  - Invalid progress values
  - Invalid quarter ranges

**Success Criteria**:
- [ ] All manual tests pass
- [ ] No console errors
- [ ] Data persists across page reloads
- [ ] Example JSON imports successfully

**Validation**:
```bash
npm run dev  # Manual testing session
# Follow checklist in Section 8.3
```

---

#### Step 9.3: Performance Testing

**Actions**:
- Test with large dataset (50+ tasks, 10+ swimlanes)
- Verify animations are smooth
- Check bundle size
- Optimize if necessary

**Success Criteria**:
- [ ] App loads in < 2 seconds
- [ ] Animations run at 60fps
- [ ] Bundle size < 500KB (gzipped)
- [ ] No memory leaks

**Validation**:
```bash
npm run build  # Check dist/ folder size
npm run preview  # Test production build
# Use browser performance tools to measure
```

---

### Phase 10: Documentation and Deployment

#### Step 10.1: Code Documentation

**Actions**:
- Add JSDoc comments to complex functions
- Ensure all public APIs are documented
- Review code for clarity

**Success Criteria**:
- [ ] All complex functions have comments
- [ ] Type signatures are clear
- [ ] Code is readable

---

#### Step 10.2: Deployment Preparation

**Actions**:
- Test production build
- Verify all features work in production
- Create deployment instructions

**Success Criteria**:
- [ ] Production build works correctly
- [ ] No errors in console
- [ ] All features functional

**Validation**:
```bash
npm run build
npm run preview
# Test all features in production mode
```

---

## 10. Success Criteria Summary

### Overall Project Completion Criteria

- [ ] All unit tests passing (80%+ coverage)
- [ ] All integration tests passing
- [ ] Manual testing checklist complete
- [ ] Visual design matches SPEC.md exactly
- [ ] Animations smooth (2 second duration)
- [ ] Import/export works with example JSON
- [ ] Data persists across page reloads
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Production build works correctly
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Responsive layout

### Performance Targets

- [ ] Initial load < 2 seconds
- [ ] Animations run at 60fps
- [ ] Bundle size < 500KB (gzipped)
- [ ] No memory leaks

### Code Quality

- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied
- [ ] TypeScript strict mode enabled
- [ ] No `any` types used
- [ ] All functions have clear purposes
- [ ] KISS and YAGNI principles followed

---

## 11. Risk Mitigation

### Identified Risks

1. **Task Stacking Algorithm Complexity**
   - Mitigation: Implement and test thoroughly in Phase 2 before building UI
   - Fallback: Use simpler algorithm (all tasks in separate rows)

2. **CSS Animation Performance**
   - Mitigation: Use CSS transforms (GPU-accelerated) instead of layout properties
   - Fallback: Disable animations if performance issues occur

3. **Browser Compatibility**
   - Mitigation: Target modern browsers (ES2020+), use standard APIs
   - Fallback: Add polyfills if needed

4. **Large Dataset Performance**
   - Mitigation: Test with large datasets early, optimize as needed
   - Fallback: Add pagination or virtualization if performance issues occur

---

## 12. Future Enhancements (Out of Scope)

These features are not in the current spec but could be added later:

- Drag-and-drop task repositioning
- Undo/redo functionality
- Dark mode
- Multiple timeline views (monthly, yearly)
- Task dependencies and critical path
- Collaborative editing (requires backend)
- PDF export
- Task comments and notes
- Customizable color schemes
- Task search and filtering

---

## End of Plan

This comprehensive plan provides all necessary information for implementing the Dynamic Project Timeline application. Each phase builds on the previous one, with explicit success criteria and validation steps. Follow the phases in order for systematic, testable progress toward a complete, working application.

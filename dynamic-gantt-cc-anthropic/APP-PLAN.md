# Dynamic Project Timeline Application - Architecture & Implementation Plan

## 1. Tech Stack and Project Infrastructure

### Core Technologies
- **Framework**: React 18.x with TypeScript 5.x
- **Build Tool**: Vite 5.x (fast development and production builds)
- **State Management**: Zustand (lightweight, TypeScript-friendly)
- **Styling**: Tailwind CSS 3.x with PostCSS
- **Date Handling**: date-fns 3.x
- **Animation**: CSS transitions and transforms (native browser support)
- **Data Validation**: Zod (schema validation for imports)
- **Package Manager**: npm
- **File Operations**: Browser File API (native)
- **Icons**: Lucide React (lightweight icon library)

### Development Infrastructure
- **TypeScript Configuration**: Strict mode enabled
- **Linting**: ESLint with TypeScript and React plugins
- **Formatting**: Prettier with consistent configuration
- **Testing Framework**: Vitest for unit tests, Playwright for E2E tests
- **Pre-commit Hooks**: Husky with lint-staged

## 2. Project File and Directory Structure

```
dynamic-gantt-cc-anthropic/
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── TimelineSelector.tsx
│   │   │   └── ActionButtons.tsx
│   │   ├── Timeline/
│   │   │   ├── TimelineGrid.tsx
│   │   │   ├── QuarterColumn.tsx
│   │   │   └── TimelineHeader.tsx
│   │   ├── Swimlane/
│   │   │   ├── Swimlane.tsx
│   │   │   ├── Task.tsx
│   │   │   └── TaskPositioner.tsx
│   │   ├── Modals/
│   │   │   ├── TaskModal.tsx
│   │   │   ├── TimelineModal.tsx
│   │   │   └── TeamModal.tsx
│   │   └── Common/
│   │       ├── Button.tsx
│   │       ├── Dropdown.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   ├── store/
│   │   ├── useStore.ts
│   │   ├── slices/
│   │   │   ├── tasksSlice.ts
│   │   │   ├── timelinesSlice.ts
│   │   │   └── teamsSlice.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── taskPositioning.ts
│   │   ├── dataValidation.ts
│   │   ├── fileOperations.ts
│   │   ├── dateHelpers.ts
│   │   └── constants.ts
│   ├── types/
│   │   ├── task.ts
│   │   ├── timeline.ts
│   │   ├── team.ts
│   │   └── data.ts
│   ├── hooks/
│   │   ├── useTaskAnimation.ts
│   │   ├── useFileImportExport.ts
│   │   └── useModalState.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── index.html
├── tests/
│   ├── unit/
│   │   ├── utils/
│   │   └── components/
│   └── e2e/
│       └── scenarios/
├── .eslintrc.js
├── .prettierrc
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── index.html
```

## 3. Testing and Logging Dependencies

### Testing Dependencies
- **vitest**: ^1.x - Unit testing framework
- **@testing-library/react**: ^14.x - React testing utilities
- **@testing-library/jest-dom**: ^6.x - DOM matchers
- **@testing-library/user-event**: ^14.x - User interaction simulation
- **playwright**: ^1.x - E2E testing
- **@vitest/ui**: ^1.x - Test UI

### Logging
- **Development**: Console-based logging with environment checks
- **Production**: Minimal error logging only
- **Debug Mode**: Comprehensive state change logging (development only)

## 4. Application Dependencies

### Runtime Dependencies
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "zustand": "^4.5.0",
  "date-fns": "^3.6.0",
  "zod": "^3.23.0",
  "lucide-react": "^0.400.0",
  "clsx": "^2.1.0"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "@typescript-eslint/eslint-plugin": "^7.0.0",
  "@typescript-eslint/parser": "^7.0.0",
  "@vitejs/plugin-react": "^4.3.0",
  "autoprefixer": "^10.4.0",
  "eslint": "^8.57.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-react-refresh": "^0.4.0",
  "husky": "^9.0.0",
  "lint-staged": "^15.2.0",
  "postcss": "^8.4.0",
  "prettier": "^3.3.0",
  "tailwindcss": "^3.4.0",
  "typescript": "^5.5.0",
  "vite": "^5.3.0"
}
```

## 5. Feature Implementation Details

### 5.1 Task Positioning Algorithm
**File**: `src/utils/taskPositioning.ts`

```typescript
interface PositionedTask {
  task: Task;
  row: number;
  startColumn: number;
  endColumn: number;
}

function positionTasks(tasks: Task[]): PositionedTask[] {
  // Sort tasks by start date, then by duration (longest first)
  // Use interval tree algorithm for efficient overlap detection
  // Assign to lowest available row that doesn't overlap
  // Return positioned tasks with row assignments
}
```

**Algorithm**:
1. Sort tasks by start quarter, then by duration (descending)
2. For each task:
   - Check existing rows for overlaps
   - Place in first row without overlap
   - Create new row if all existing rows have overlaps
3. Minimize vertical space by compacting rows

### 5.2 Data Validation Schema
**File**: `src/utils/dataValidation.ts`

```typescript
const TaskSchema = z.object({
  name: z.string().min(1).trim(),
  swimlane: z.string().min(1).trim(),
  startQuarter: z.enum(['Q1 2025', 'Q2 2025', /* ... */ 'Q4 2028']),
  endQuarter: z.enum(['Q1 2025', 'Q2 2025', /* ... */ 'Q4 2028']),
  progress: z.number().int().min(0).max(100),
  color: z.enum(['blue', 'indigo'])
});

const ImportSchema = z.object({
  scenarios: z.array(TimelineSchema),
  activeScenario: z.string(),
  swimlanes: z.array(z.string()),
  exportDate: z.string().datetime()
});
```

### 5.3 Animation System
**File**: `src/hooks/useTaskAnimation.ts`

- CSS-based transitions for 2-second duration
- Transform and opacity transitions
- FLIP (First, Last, Invert, Play) technique for smooth repositioning
- RequestAnimationFrame for performance

### 5.4 File Import/Export
**File**: `src/utils/fileOperations.ts`

```typescript
export async function exportData(data: ExportData): Promise<void> {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timeline-export-${new Date().toISOString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<ExportData> {
  const text = await file.text();
  const data = JSON.parse(text);
  return ImportSchema.parse(data); // Validates and returns
}
```

## 6. Requirements Fulfillment

### Data Constraints
- **Unique Names**: Enforced via Set validation in store
- **Progress Range**: Validated with Zod schema (0-100 integer)
- **Whitespace Trimming**: Applied on all name inputs via `.trim()`
- **Quarter Range**: Enum validation for Q1 2025 - Q4 2028

### UI/UX Requirements
- **Header**: Fixed position with black background (#000000)
- **Icons**: Lucide React icons for consistency
- **Colors**: Exact hex values per specification
- **Animations**: 2-second CSS transitions
- **Modals**: Portal-based rendering for proper z-index

## 7. Naming and Coding Conventions

### TypeScript Conventions
- **Interfaces**: PascalCase with 'I' prefix for domain models (ITask, ITimeline)
- **Types**: PascalCase without prefix for utility types
- **Enums**: PascalCase for enum names, UPPER_SNAKE_CASE for values
- **Functions**: camelCase for functions, descriptive verb-noun pattern
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Files**: PascalCase for components, camelCase for utilities

### React Conventions
- **Components**: Functional components with TypeScript
- **Props**: Interface with 'Props' suffix (HeaderProps)
- **Hooks**: 'use' prefix (useTaskAnimation)
- **Event Handlers**: 'handle' prefix (handleTaskClick)

### CSS Conventions
- **Tailwind**: Utility-first approach
- **Custom CSS**: BEM methodology for complex components
- **Animation Classes**: 'animate-' prefix

## 8. Step-by-Step Implementation Plan

### Phase 1: Project Setup and Infrastructure
**Step 1.1**: Initialize Project
- Create Vite React TypeScript project
- Configure TypeScript with strict mode
- Setup ESLint and Prettier
- **Success Criteria**: 
  - `npm run dev` starts development server
  - `npm run build` creates production build
  - `npm run lint` passes with no errors

**Step 1.2**: Install Dependencies
- Install all runtime and development dependencies
- Configure Tailwind CSS
- Setup testing infrastructure
- **Success Criteria**:
  - All dependencies installed without conflicts
  - Tailwind utilities work in components
  - `npm run test` executes successfully

### Phase 2: Core Data Layer
**Step 2.1**: Define TypeScript Types
- Create type definitions for Task, Timeline, Team
- Setup Zod schemas for validation
- **Success Criteria**:
  - TypeScript compiles without errors
  - Validation schemas match specification

**Step 2.2**: Implement Zustand Store
- Create store with slices for tasks, timelines, teams
- Implement CRUD operations
- Add constraint validation
- **Success Criteria**:
  - Store operations maintain data integrity
  - Unique name constraints enforced
  - Unit tests pass for all store operations

### Phase 3: Layout and Structure
**Step 3.1**: Create Header Component
- Implement fixed header with black background
- Add calendar icon and title
- Create timeline selector dropdown
- Add action buttons (export, import, add team, add task)
- **Success Criteria**:
  - Header displays correctly at all viewport sizes
  - All buttons are clickable and properly positioned
  - Timeline selector shows all available timelines

**Step 3.2**: Build Timeline Grid
- Create quarterly column structure (Q1 2025 - Q4 2028)
- Implement fixed "Teams" column
- Add vertical year separators
- **Success Criteria**:
  - Grid displays all 16 quarters correctly
  - Teams column stays fixed on horizontal scroll
  - Year separators visible and properly styled

### Phase 4: Swimlanes and Tasks
**Step 4.1**: Implement Swimlane Component
- Create swimlane container for each team
- Display team name with task count
- Implement task positioning algorithm
- **Success Criteria**:
  - Swimlanes stack vertically without gaps
  - Team names display with correct task counts
  - Tasks position correctly without overlaps

**Step 4.2**: Create Task Component
- Design task pill with rounded ends
- Add task name and progress percentage
- Implement progress bar visualization
- Apply color themes (blue/indigo)
- **Success Criteria**:
  - Tasks render with correct dimensions
  - Progress bar accurately reflects percentage
  - Colors match specification exactly
  - Click events trigger correctly

### Phase 5: Modals and Forms
**Step 5.1**: Build Task Modal
- Create modal with form fields
- Implement validation for all inputs
- Add save, delete, and cancel functionality
- **Success Criteria**:
  - Modal opens on task click and add button
  - Form validates all constraints
  - Data persists correctly to store
  - Modal closes after successful action

**Step 5.2**: Create Timeline Modal
- Implement timeline creation form
- Add validation for unique names
- **Success Criteria**:
  - Modal creates new timelines
  - Duplicate names are rejected
  - New timeline appears in dropdown

**Step 5.3**: Create Team Modal
- Implement team creation form
- Add validation for unique names
- **Success Criteria**:
  - Modal creates new teams
  - Teams appear as new swimlanes
  - Duplicate names are rejected

### Phase 6: Import/Export Functionality
**Step 6.1**: Implement Export
- Create JSON serialization logic
- Add file download functionality
- Include metadata (export date)
- **Success Criteria**:
  - Export creates valid JSON file
  - File downloads with timestamp
  - All data is preserved correctly

**Step 6.2**: Implement Import
- Create file selection interface
- Implement JSON parsing and validation
- Handle error cases gracefully
- **Success Criteria**:
  - Valid files import successfully
  - Invalid files show error messages
  - Existing data is replaced correctly

### Phase 7: Animations and Polish
**Step 7.1**: Add Timeline Transitions
- Implement 2-second CSS transitions
- Use task name for identity matching
- Smooth position changes between timelines
- **Success Criteria**:
  - Tasks animate when switching timelines
  - Animation duration is exactly 2 seconds
  - No visual glitches or jumps

**Step 7.2**: UI/UX Refinement
- Fine-tune spacing and alignment
- Ensure responsive behavior
- Add loading states and error handling
- **Success Criteria**:
  - Application works on various screen sizes
  - All interactions feel smooth
  - Error states are user-friendly

### Phase 8: Testing and Validation
**Step 8.1**: Unit Testing
- Write tests for utility functions
- Test store operations
- Test validation logic
- **Success Criteria**:
  - 90%+ code coverage for utilities
  - All edge cases tested
  - Tests run in < 10 seconds

**Step 8.2**: E2E Testing
- Test complete user workflows
- Verify import/export cycle
- Test all modal interactions
- **Success Criteria**:
  - All user stories pass
  - No critical bugs found
  - Performance meets expectations

### Phase 9: Production Build
**Step 9.1**: Optimization
- Minimize bundle size
- Optimize images and assets
- Configure production build
- **Success Criteria**:
  - Bundle size < 500KB
  - Lighthouse score > 90
  - Build completes without warnings

**Step 9.2**: Deployment Preparation
- Create production configuration
- Document deployment process
- Final testing on production build
- **Success Criteria**:
  - Application runs from file:// protocol
  - All features work offline
  - No console errors in production

## 9. Validation and Testing Strategy

### Unit Tests
- Task positioning algorithm with various overlap scenarios
- Data validation with edge cases
- Store operations with constraint violations
- Date/quarter calculations

### Integration Tests
- Modal form submissions
- Import/export cycle integrity
- Timeline switching with data persistence
- Team and task management workflows

### E2E Tests
- Complete task creation and editing flow
- Timeline management (create, switch, delete)
- Import invalid and valid files
- Export and re-import data integrity
- Animation timing verification

### Manual Testing Checklist
- [ ] All buttons and interactions work
- [ ] Modals open and close correctly
- [ ] Data validation prevents invalid entries
- [ ] Animations run smoothly
- [ ] File operations work in different browsers
- [ ] No console errors in production build
- [ ] Application works offline
- [ ] Responsive design works on mobile

## 10. Performance Considerations

### Optimization Strategies
- Virtual scrolling for large datasets (if > 100 tasks)
- Memoization of expensive calculations
- Lazy loading of modal components
- CSS containment for swimlanes
- RequestAnimationFrame for animations

### Performance Targets
- Initial load: < 2 seconds
- Timeline switch: < 100ms (excluding animation)
- Task positioning: < 50ms for 100 tasks
- File import: < 500ms for typical dataset
- Memory usage: < 50MB for typical usage

## 11. Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required APIs
- File API
- Blob API
- CSS Grid
- CSS Custom Properties
- ES2020+ JavaScript features

## 12. Security Considerations

### Data Handling
- Client-side only (no server communication)
- Input sanitization for all user inputs
- JSON parsing with error handling
- No execution of imported code
- Content Security Policy headers (if served)

### File Operations
- Validate file size limits (< 10MB)
- Check file type before processing
- Sanitize filenames for export
- Handle malformed JSON gracefully
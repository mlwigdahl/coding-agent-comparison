# Dynamic Project Timeline SPA – Architecture & Implementation Plan

## 1. Project Overview
- **Goal**: Browser-only SPA for creating, viewing, and managing quarterly project timelines without backend dependencies.
- **Key pillars**: Local data persistence, interactive timeline visualization with smooth task animations, intuitive CRUD modals, and robust import/export workflows.

## 2. Tech Stack & Infrastructure
- **Runtime**: Browser-only; no server components.
- **Framework**: React 18 + TypeScript for typed component-driven UI.
- **Build tooling**: Vite (React + TS template) for fast dev server, HMR, and production bundling.
- **State management**: React Context + custom hooks to keep dependencies minimal (KISS) while centrally managing timelines, tasks, and teams.
- **Styling**: CSS Modules with PostCSS nesting; keeps styles scoped and maintainable without large utility frameworks. Global CSS variables will capture theme colors.
- **Icons**: `@heroicons/react` (solid & outline) for calendar, clock, pen, download, trash, and add icons.
- **Animations**: Native CSS transitions using FLIP (First-Last-Invert-Play) technique coordinated via custom React hook to animate 2s task repositioning.
- **Persistence**: `localStorage` for last-opened state; seeded defaults inline.
- **File import/export**: Browser File APIs (`FileReader`, `Blob`, `URL.createObjectURL`).
- **Linting/formatting**: ESLint (React + TS rules) and Prettier.
- **Testing**: Vitest + React Testing Library for unit/integration; Playwright for critical user flows (modal CRUD, import/export, animation hook smoke test).
- **Logging**: Lightweight `console.info`/`console.error` gated by environment flag; wrap in `src/utils/logger.ts` for easy future enhancement.

## 3. Project Structure
```
APP-PLAN.md
SPEC.md
src/
  main.tsx
  App.tsx
  index.css
  components/
    Header/
      Header.tsx
      Header.module.css
    TimelineGrid/
      TimelineGrid.tsx
      TimelineGrid.module.css
    TaskLane/
      TaskLane.tsx
      TaskLane.module.css
    TaskCard/
      TaskCard.tsx
      TaskCard.module.css
    Modals/
      TaskModal.tsx
      TaskModal.module.css
      TimelineModal.tsx
      TimelineModal.module.css
    Icons/
      Icon.tsx (shared icon wrapper)
  context/
    AppStateContext.tsx
  hooks/
    useTaskStacking.ts
    useFlipAnimation.ts
    useLocalStorage.ts
  models/
    timeline.ts
    task.ts
    team.ts
  utils/
    quarter.ts
    validation.ts
    file.ts
    logger.ts
  data/
    seed.ts
  tests/
    __mocks__/file.ts
    fixtures/import-sample.json
```

## 4. Domain Models & State
- **Quarter**: Represented as `{ year: number; quarter: 1|2|3|4 }`. Utility `parseQuarterLabel(label: string)` transforms strings (e.g., `"Q2 2026"`) to structured form and numeric index `quarterIndex = (year - 2025) * 4 + (quarter - 1)` for ordering.
- **Task** (`models/task.ts`):
  ```ts
  export interface Task {
    id: string; // UUID generated at creation for React keys & FLIP lookup
    name: string;
    teamId: string;
    progress: number; // 0-100
    startQuarter: Quarter;
    endQuarter: Quarter;
    color: 'blue' | 'indigo';
  }
  ```
- **Team** (`models/team.ts`):
  ```ts
  export interface Team {
    id: string;
    name: string; // unique, trimmed
    color: string; // derived accent if needed later
    taskIds: string[];
  }
  ```
- **Timeline** (`models/timeline.ts`):
  ```ts
  export interface Timeline {
    id: string;
    name: string; // unique, trimmed
    taskIds: string[]; // references Task ids scoped to this timeline
  }
  ```
- **AppState** (`context/AppStateContext.tsx`):
  ```ts
  interface AppState {
    timelines: Record<string, Timeline>;
    tasks: Record<string, Task>;
    teams: Record<string, Team>;
    activeTimelineId: string;
    order: { timelineIds: string[]; teamIds: string[] };
  }
  ```
- **Normalization rationale**: Allows quick lookup, deduped names, and reuse of tasks across timelines by id.
- **Validation utilities**: `utils/validation.ts` enforces naming uniqueness, whitespace trimming, and progress bounds (0–100).
- **Derived selectors**: Custom hooks (e.g., `useActiveTimelineTasks()`) compute team groupings and quarter spans.

## 5. UI Architecture
- **App.tsx** orchestrates layout: header, timeline grid, and modals (controlled via state).
- **Header**: Contains icon, title, timeline dropdown, add timeline button, import/export buttons, add team/task actions. Use flexbox with dark background (#000) and proper spacing.
- **TimelineGrid**: Renders quarter headers (Q1 2025 – Q4 2028) and vertical separators. Accepts tasks grouped per team and calculates column spans from quarter index difference.
- **TaskLane**: Displays team name with task count, then stacked TaskCards.
- **TaskCard**: Semicircular rectangle using `border-radius: 9999px`; contains name (left), progress (right), and progress bar (bottom). Colors derived from theme and completion state.
- **Modals**: Implemented via accessible dialogs. Use focus trapping (`@headlessui/react` optional; otherwise custom trap). Task modal supports add/edit/delete flows; timeline modal for creation only.
- **Icons**: Central `Icon` component maps icon names to imported Heroicons for consistent use.

## 6. Feature Implementation Details
- **Quarter timeline headers**:
  - Generate list via `generateQuarters(from: Quarter, to: Quarter)` in `utils/quarter.ts`.
  - Render two-tier header (quarter bold, year smaller gray) using CSS grid.
  - Add thin gray border before each new year using conditional CSS pseudo-element.
- **Task stacking algorithm** (`hooks/useTaskStacking.ts`):
  - Input: array of tasks for a team sorted by start quarter index.
  - Use greedy lane assignment:
    1. Maintain array `lanes`, each storing end index of last task in that lane.
    2. For each task: find first lane where `task.startIndex > laneEndIndex`; place task there and update lane end to `task.endIndex`; otherwise push new lane.
  - Output: tasks with assigned `laneIndex`. Convert to CSS top offset by multiplying lane index by lane height.
  - Re-run on task add/edit/delete to refresh stacking.
- **Animations** (`hooks/useFlipAnimation.ts`):
  - For tasks keyed by `task.id`, capture DOM positions before state change using `getBoundingClientRect`.
  - After DOM update, compute delta and apply transform with transition `transform 2s ease`. Remove transform at animation end.
  - Hook API: `useFlipAnimation(depsKey: string)` returns `ref` setter for task elements and `triggerFlip()` to call when timeline switches.
- **Task Modal** (`components/Modals/TaskModal.tsx`):
  - Controlled via `modalState` in context (tracks type and taskId).
  - On submit: validate uniqueness of task name within active timeline, quarter order (start <= end), progress range, non-empty trimmed name.
  - Insert uses `uuid` for task id, updates tasks map and associated team/timeline references.
  - Delete: remove task id from relevant team and timeline; handle empty teams counts gracefully.
- **Timeline Modal**: Validates unique, trimmed name. On save, create new timeline with empty tasks and set as active.
- **Import/Export** (`utils/file.ts`):
  - **Export**: Serialize normalized data back to required JSON structure with `scenarios`, `activeScenario`, `swimlanes`, `exportDate`.
  - Trigger `URL.createObjectURL` download via hidden anchor.
  - **Import**: Read file text, parse JSON, validate schema (e.g., required keys, arrays, quarter format, progress bounds). On success, normalize into state; on failure, show modal/toast error.
- **Header actions**: `+ Add Team` opens inline prompt modal (optional minimal modal) to capture team name, enforce uniqueness.
- **Data persistence**:
  - `useLocalStorage.ts` syncs AppState to `localStorage` after every state change (debounced 250ms).
  - On load, attempt to rehydrate; fallback to seeded data from `data/seed.ts` matching example JSON.
- **Accessibility considerations**:
  - All buttons have labels/tooltips.
  - Modals trap focus and close on ESC/overlay click.
  - Task cards expose `aria-label` with task metadata.
- **Error handling**:
  - Validation errors surface inline for form fields.
  - Import errors presented via alert region at top of modal.

## 7. Styling & Theming
- Global CSS variables declared in `index.css` for colors (`--color-blue`, `--color-blue-complete`, `--color-indigo`, `--color-indigo-complete`, `--color-orange`).
- Header uses `display: flex`, `align-items: center`, `justify-content: space-between`, padding `16px`, background `#000`, text `#fff`.
- Timeline grid uses CSS grid with fixed first column width, remaining columns auto-fit for quarter segments.
- Task cards leverage gradient backgrounds based on completion (switch to completed color when `progress === 100`).
- Progress bar: absolutely positioned bottom strip with width derived from `%` using inline style.
- Responsiveness: horizontal scroll for narrower screens; header wraps to multi-line gracefully.

## 8. Testing & Logging
- **Unit tests** (Vitest):
  - `utils/quarter.test.ts`: parsing and range generation.
  - `hooks/useTaskStacking.test.ts`: lane assignment edge cases.
  - `utils/validation.test.ts`: uniqueness, trimming, progress bounds.
- **Component tests** (React Testing Library):
  - `TaskModal` validation flows.
  - `TimelineGrid` renders correct quarter headers and task spans.
  - `ImportExport` flow using mocked File API (fixtures in `src/tests/fixtures`).
- **E2E tests** (Playwright):
  - Import sample JSON and verify timeline renders tasks.
  - Add task workflow -> animation triggered on timeline switch.
- **Logging**: `logger.ts` exports `logInfo`, `logError` which guard against noisy output in production (enable only when `import.meta.env.MODE !== 'production'`).

## 9. Naming & Coding Conventions
- Components: PascalCase (`TaskCard`). Hooks/utilities: camelCase (`useFlipAnimation`).
- TypeScript interfaces in singular noun form (`Task`, `Timeline`).
- CSS module class names use kebab case (`task-card`).
- Use functional React components with explicit props interfaces.
- Enforce trimming of names at state boundary (context actions) to avoid scattered logic.

## 10. Step-by-Step Implementation Plan (with success criteria)
1. **Bootstrap Project**
   - Actions: Initialize Vite React-TS app, configure ESLint/Prettier, install dependencies (`react`, `react-dom`, `@heroicons/react`, `uuid`, `clsx`, testing packages).
   - Build: `npm run build` succeeds.
   - Test: `npm run test` (Vitest) passes default sample test or `npx vitest run` reports success.
   - Validation: App serves base placeholder at `npm run dev` without console errors.

2. **Set Up Project Structure & Globals**
   - Actions: Create directories/files as per structure, configure `tsconfig` paths if needed, add `index.css` with CSS variables and base styles.
   - Build: `npm run build` succeeds after restructuring.
   - Test: `npm run test` (no new tests yet) still green.
   - Validation: Manual review verifying folders/files exist and app renders blank scaffold.

3. **Implement Domain Models & Utilities**
   - Actions: Define interfaces, quarter parsing/generation helpers, validation utils, logger.
   - Build: `npm run build` passes with no TS errors.
   - Test: Add Vitest tests for `quarter` and `validation`; ensure `npm run test` passes.
   - Validation: Console-based quick check running helper functions in tests verifying outputs.

4. **Create App State Context & Seed Data**
   - Actions: Implement `AppStateContext`, provider with reducer/actions (add/edit/delete task/team/timeline, set active timeline), localStorage sync hook, seed data.
   - Build: `npm run build` passes.
   - Test: Vitest tests for reducer actions (add timeline, enforce uniqueness, progress bounds) all pass.
   - Validation: Load app; default seed timeline renders placeholder text confirming state loads.

5. **Header Component & Actions Integration**
   - Actions: Build `Header` UI with icons, dropdown, buttons; connect to context actions; stub handlers (modals yet to come).
   - Build: `npm run build` passes.
   - Test: Component test verifying dropdown shows timelines and callbacks invoked.
   - Validation: Manual check in browser ensures layout, colors, buttons align with spec (black background, icons, placements).

6. **Quarter Timeline Grid Layout**
   - Actions: Implement `TimelineGrid` and `TaskLane` skeletons rendering quarter headers and team rows (no tasks yet), ensure layout matches spec.
   - Build: `npm run build` passes.
   - Test: RTL test verifying header labels Q1 2025 – Q4 2028 render with separators.
   - Validation: Visual inspection confirming grid structure and year separators.

7. **Task Stacking Algorithm & TaskCard Rendering**
   - Actions: Implement `useTaskStacking` hook, `TaskCard` component with semicircular styles, progress bar, color themes.
   - Build: `npm run build` passes.
   - Test: Vitest for stacking algorithm edge cases; RTL snapshot verifying card layout and progress bar width.
   - Validation: Manually add seed tasks to context and verify stacking appears correctly with minimal vertical space.

8. **Task Modal (Add/Edit/Delete)**
   - Actions: Build modal UI, form validation, tie into context actions, enforce constraints, integrate with header "Add Task" and card click.
   - Build: `npm run build` passes.
   - Test: RTL tests covering add, edit, delete flows with validation messages.
   - Validation: Manual run verifying modal populates data, prevents invalid inputs, updates UI immediately.

9. **Team Management Modal/Button**
   - Actions: Implement team creation dialog, integrate counts in `TaskLane`, ensure uniqueness checks.
   - Build: `npm run build` passes.
   - Test: RTL test verifying duplicate name rejection and count updates.
   - Validation: Manual addition demonstrates team appears with `(0)` count.

10. **Timeline Modal & Active Timeline Switching**
    - Actions: Implement timeline creation modal, integrate with context, update dropdown switching to trigger FLIP animation.
    - Build: `npm run build` passes.
    - Test: RTL test for timeline creation; test verifying active timeline change updates tasks.
    - Validation: Manual switching ensures tasks update; animation placeholders ready.

11. **FLIP Animation Hook Integration**
    - Actions: Implement `useFlipAnimation`, wrap `TaskCard` list to animate on timeline switch/add/edit operations.
    - Build: `npm run build` passes.
    - Test: Vitest or RTL mock verifying transform values applied; Playwright check ensures animation duration ~2s.
    - Validation: Visual inspection confirming smooth repositioning.

12. **Import/Export Functionality**
    - Actions: Build `utils/file.ts`, wire Export button to download JSON in required format, Import to parse and replace state with validation errors.
    - Build: `npm run build` passes.
    - Test: Unit tests for serialization/deserialization; Playwright E2E importing fixture and verifying DOM updates.
    - Validation: Manual export -> inspect JSON, re-import -> confirm state matches file.

13. **Accessibility & UX Polish**
    - Actions: Ensure focus traps, aria labels, keyboard navigation, responsive handling, finalize color contrast.
    - Build: `npm run build` passes.
    - Test: RTL accessibility queries (e.g., `getByRole`), Playwright keyboard navigation scenario.
    - Validation: Use browser dev tools (Lighthouse/axe) to confirm no critical issues.

14. **Final QA & Documentation**
    - Actions: Update README, usage instructions, note testing commands, and verify import/export cross-browser (Chrome/Edge).
    - Build: Final `npm run build` passes.
    - Test: `npm run test`, `npx playwright test` all green.
    - Validation: Manual smoke test executing core flows (add/edit task, switch timeline, import/export) without errors.


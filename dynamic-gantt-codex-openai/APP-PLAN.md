Dynamic Project Timeline (Quarterly View) — Architecture & Implementation Plan

Overview
- Purpose: Build a browser-only SPA that manages multiple project timelines, teams (swimlanes), and tasks, rendering a quarterly Gantt-like view from Q1 2025 through Q4 2028. No backend services; all logic and data run and persist in the browser, with import/export via JSON.
- Principles: KISS, YAGNI, accessible and consistent UI, smooth 2s animations on task repositioning when switching timelines.
- Identity: For animation and updates, task identity is the task name (unique across all tasks).

Tech Stack & Project Infrastructure
- Framework: React + TypeScript. Rationale: component model fits SPA UI/UX, great ecosystem, strong typing, good testability.
- Build Tool: Vite. Rationale: fast dev server, simple build, TS support built-in.
- Styling: Tailwind CSS for consistent spacing/colors/typography and rapid iteration. Small CSS utilities for custom shapes where needed.
- Icons: Heroicons (SVG) via React components.
- State: React Context + `useReducer` (no extra global state libs). Persist in `localStorage`.
- Validation: Zod for data schemas and import validation.
- Date/Time: None required beyond simple constants (fixed quarter range). Custom helpers for quarters.
- Testing: Vitest + @testing-library/react for unit/component tests. Optional Playwright for E2E.
- Lint/Format: ESLint (typescript + react), Prettier.
- Logging: Lightweight `logger.ts` (console wrapper) with log levels derived from `import.meta.env.DEV` and a local setting.

File & Directory Structure
- Root
  - `index.html` — Vite entry.
  - `package.json` — scripts and deps.
  - `tsconfig.json`, `tsconfig.node.json` — TS config.
  - `vite.config.ts` — Vite config.
  - `postcss.config.cjs`, `tailwind.config.cjs` — Tailwind config.
  - `APP-PLAN.md`, `SPEC.md` — docs.
- `src/`
  - `main.tsx` — React bootstrap.
  - `App.tsx` — top-level layout (Header, Timeline, Modals root).
  - `styles/`
    - `index.css` — Tailwind base, components, utilities; small custom CSS.
  - `state/`
    - `types.ts` — TS types for Task, Scenario, AppData, Team, ColorTheme, QuarterId.
    - `schema.ts` — Zod schemas for import/export (`AppDataSchema`).
    - `constants.ts` — color constants, quarter range, labels, etc.
    - `quarters.ts` — helpers for quarter indexing and formatting.
    - `actions.ts` — action types and creators.
    - `reducer.ts` — reducer for all state transitions and constraints.
    - `context.tsx` — Provider + hooks (`useAppState`, `useAppDispatch`).
    - `storage.ts` — localStorage hydration/persistence.
    - `select.ts` — derived selectors (e.g., active scenario, team task counts).
  - `components/`
    - `Header/`
      - `Header.tsx` — black header bar and controls.
      - `ScenarioSelect.tsx` — dropdown of timelines (scenarios).
      - `HeaderButtons.tsx` — export, import, add team, add task.
    - `Timeline/`
      - `TimelineGrid.tsx` — quarter columns, year separators.
      - `Swimlanes.tsx` — renders all swimlanes and their tasks.
      - `Swimlane.tsx` — single team row (name + tasks stack).
      - `TaskItem.tsx` — task pill with name, percent, progress bar, animation.
    - `Modals/`
      - `TaskModal.tsx` — add/edit/delete tasks.
      - `ScenarioModal.tsx` — add new timeline (scenario).
      - `TeamModal.tsx` — add new team (swimlane).
      - `Modal.tsx` — accessible modal wrapper (focus trap, ESC, backdrop).
    - `Icons/` — calendar, clock, pen, trash, download/upload, team icon, etc.
    - `Form/` — form primitives (Input, Select, Label, Button variants).
    - `Toast/` — minimal toast component for import errors.
  - `logic/`
    - `layout.ts` — stacking algorithm for tasks per swimlane.
    - `animation.ts` — FLIP/transition helpers for 2s reposition animation.
    - `colors.ts` — color scheme helpers based on theme and completion.
  - `io/`
    - `export.ts` — serialize `AppData` to JSON and trigger download.
    - `import.ts` — file input, parse, validate via Zod, integrate or error.
  - `utils/`
    - `logger.ts` — logging wrapper.
    - `strings.ts` — trimming helpers and name normalization.
  - `__tests__/` (or `tests/`)
    - `quarters.test.ts`, `schema.test.ts`, `layout.test.ts`, `reducer.test.ts`, component tests.

Data Model
- Quarter Range: Q1 2025 → Q4 2028 (inclusive). Exactly 16 quarters.
- QuarterId: string literal union `'Q1 2025' | ... | 'Q4 2028'` and index mapping [0..15].
- Types
  - `ColorTheme = 'blue' | 'indigo'`
  - `Task`:
    - `name: string` (unique across all tasks; trimmed)
    - `swimlane: string` (team name)
    - `startQuarter: QuarterId`
    - `endQuarter: QuarterId` (inclusive, must be >= start)
    - `progress: number` (integer 0..100)
    - `color: ColorTheme`
  - `Scenario`:
    - `name: string` (unique across scenarios)
    - `tasks: Task[]`
  - `AppData`:
    - `scenarios: Scenario[]`
    - `activeScenario: string` (scenario name)
    - `swimlanes: string[]` (team names; unique)
    - `exportDate?: string` (ISO string filled on export)

Constraints & Enforcement
- Unique names across entities:
  - Teams (swimlanes): no duplicates.
  - Tasks: no duplicates (global uniqueness by task name across application, per SPEC). Used as identity for animations.
  - Timelines (scenarios): no duplicates.
- Names are trimmed; empty not allowed.
- Progress is integer 0..100 inclusive.
- Start/End quarters within defined range and start <= end.
- Enforced at reducer level; UI prevents invalid submission. Zod validates import.

JSON Validation (Zod)
- `AppDataSchema` mirrors `AppData` with refinements:
  - `scenarios[].tasks[].progress` as int between 0..100.
  - `startQuarter`/`endQuarter` are members of `QuarterId` union; `start <= end` refinement.
  - `swimlane` names exist in `AppData.swimlanes`.
  - Duplicates across names are rejected.
  - `activeScenario` must exist in `scenarios[].name`.

Quarter Utilities (`quarters.ts`)
- `ALL_QUARTERS: QuarterId[]` — ordered list of 16 items.
- `quarterIndex(q: QuarterId): number` — 0..15.
- `quartersBetween(a, b)` — inclusive span length.
- `formatQuarterLabel(q)` — returns `{ quarter: 'Q1', year: '2025' }` for UI.

Color Helpers (`colors.ts`)
- Inputs: `color: 'blue'|'indigo'`, `completed: boolean`.
- Returns `{ bg, border, text }` using constants:
  - Blue: uncompleted `#3b82f6`, completed `#1e40af`.
  - Indigo: uncompleted `#6366f1`, completed `#3730a3`.
- Orange progress bar: `#f97316`.

Layout & Stacking Algorithm (`layout.ts`)
- Goal: For each swimlane (team), place tasks in minimal number of stacked rows so that overlapping tasks do not collide; minimize vertical space.
- Model: Each task has interval `[startIdx, endIdx]` inclusive in [0..15]. Two tasks overlap if intervals intersect.
- Algorithm (Greedy Interval Coloring):
  1. Sort tasks by `startIdx`, then by shorter `endIdx` for tie-breaker.
  2. Maintain an array of rows. Each row tracks the `endIdx` of the last placed task.
  3. For each task in order, find the first row `r` where `row.endIdx < task.startIdx`; place task in `r` and update `row.endIdx = task.endIdx`.
  4. If none found, create a new row and place task there.
- Complexity: O(n·r) with linear scan over small `r`; if needed, use a min-heap keyed by `endIdx` to get O(n log r). Given typical swimlane sizes, a simple array scan is sufficient (KISS).
- Output: For each task, return `{ rowIndex, leftPercent, widthPercent }` computed using `startIdx/16` and `(endIdx - startIdx + 1)/16`.

Animation Strategy (`animation.ts`)
- Requirement: Animate task reposition when switching timelines, 2s duration, identity by task name.
- Approach: CSS transitions on transform using a simple FLIP technique per task:
  1. First: measure current DOM rects for all visible tasks keyed by task name.
  2. Last: update state to new scenario, render new positions.
  3. Invert: for each task present in both scenarios (same name), compute delta from old rect to new rect; apply `transform: translate(deltaX, deltaY)` and `transition: none`.
  4. Play: on next frame, remove the transform to let CSS `transition: transform 2s ease` animate to the correct spot.
- Tasks absent in new scenario fade out; new tasks fade in (optional small opacity transition; 2s sync with movement).

UI/UX Mapping to Components
- Header (black background): `Header.tsx`
  - Left:
    - Blue calendar icon.
    - Title: “Dynamic Project Timeline - Quarterly View” (bold).
    - `ScenarioSelect` dropdown: lists configured timelines (scenarios).
    - New timeline button “+”. Opens `ScenarioModal`.
  - Right:
    - Export button (download icon + “Export”).
    - Import button (download icon + “Import”).
    - “+ Add Team” button -> `TeamModal`.
    - “+ Add Task” button -> `TaskModal` (create mode).
- Timeline grid: `TimelineGrid.tsx`
  - Left fixed column header: “Teams” with icon.
  - 16 date columns Q1 2025..Q4 2028.
  - Bold quarter, smaller/grayer year.
  - Thin gray vertical separators before each year (before Q1 2026, 2027, 2028).
- Swimlanes: `Swimlanes.tsx` and `Swimlane.tsx`
  - Team name in first column under “Teams”.
  - Team name includes gray count of tasks in parentheses.
  - Within each swimlane, tasks stacked per layout algorithm.
- Task visuals: `TaskItem.tsx`
  - Pill shape (rounded-full), darker outline.
  - Left-justified task name, right-justified completion percent.
  - Thin orange bar at bottom indicating completion percent width.
  - Colors based on scheme and completed vs uncompleted.
  - Click opens `TaskModal` in edit mode (pre-populated).
- Modals: `Modals/`
  - Task Modal: pen icon, “Edit Task”, fields per SPEC, Update (blue), Delete (red with trash), Cancel (white). Create mode changes title to “Add Task” and primary to “Create Task”.
  - Scenario Modal: clock icon, “Add New Timeline”, input name, Save/Cancel.
  - Team Modal: name input, Save/Cancel.

State & Reducer Actions (`actions.ts`, `reducer.ts`)
- Teams
  - `ADD_TEAM(name)` — adds unique trimmed name.
  - `REMOVE_TEAM(name)` — optional; if implemented, also removes associated tasks across scenarios or prevents removal if tasks exist (YAGNI: start with add-only as SPEC only requires add).
- Scenarios
  - `ADD_SCENARIO(name)` — adds new empty scenario, sets active to new or leaves as is per UX; we will keep the active as current selection, but make new scenario selectable immediately.
  - `SET_ACTIVE_SCENARIO(name)`
- Tasks
  - `ADD_TASK(task)` — validates uniqueness of `task.name` across all tasks, quarter bounds, team existence.
  - `UPDATE_TASK(name, updates)` — identity by name; updates properties.
  - `DELETE_TASK(name)` — removes from all scenarios or only active? SPEC implies tasks are per scenario and identity by name across app for animation. We maintain uniqueness globally but actions operate on active scenario’s task list by default.
- Import/Export
  - `IMPORT_DATA(appData)` — replaces entire state after validation.
  - `EXPORT_DATA()` — derives export payload.
- General
  - `HYDRATE_FROM_STORAGE()` on load.

Import/Export (`io/`)
- Export: Build object `{ scenarios, activeScenario, swimlanes, exportDate: new Date().toISOString() }`, validate via `AppDataSchema` (confidence), `JSON.stringify`, Blob, `URL.createObjectURL`, trigger `<a download>`.
- Import: `<input type="file" accept="application/json">`, read as text, `JSON.parse`, validate through Zod; on error show toast and abort; on success dispatch `IMPORT_DATA`.

Accessibility & Keyboard
- Modals: focus trap, ESC closes (except destructive confirmation), ARIA roles (`dialog`, `aria-labelledby`), labeled controls.
- Buttons: focusable, accessible labels with icons having `aria-hidden`.
- Keyboard support for dropdowns and form submit/cancel (`Enter`, `Escape`).

Naming & Coding Conventions
- Files: PascalCase for components (`TaskItem.tsx`), kebab or lowercase for non-components acceptable but prefer camelCase for modules (`quarters.ts`).
- Types: PascalCase (`Task`, `Scenario`).
- Functions/vars: camelCase.
- Components: props typed; avoid `any`.
- CSS: Tailwind utilities; avoid long class lists via small component wrappers where needed.
- Tests: co-locate in `__tests__` with `.test.ts(x)` suffix.

Testing Strategy
- Unit
  - `quarters.test.ts`: mapping QuarterId ↔ index; range boundaries.
  - `schema.test.ts`: valid/invalid sample payloads; duplicate detection; start <= end; activeScenario must exist.
  - `layout.test.ts`: stacking correctness for overlapping/non-overlapping sets; deterministic row assignments.
  - `reducer.test.ts`: add team/timeline/task; uniqueness enforcement; progress bounds; trim behavior.
- Component
  - Header renders and actions dispatch; ScenarioSelect changes active scenario.
  - TaskModal field validation and submission (create/update/delete flows).
  - TimelineGrid displays correct labels, year separators.
  - Swimlane renders with counts; TaskItem shows correct colors and progress bar width.
- E2E (optional, Playwright)
  - Add team → add tasks → switch timeline → animation observed (can assert style transition properties and final positions).
  - Export then Import same data → state matches; invalid import shows error.

Build & Scripts
- `dev`: Vite dev server.
- `build`: Vite build.
- `preview`: Vite preview.
- `test`: Vitest run.
- `lint`: ESLint.

Granular Implementation Plan with Success Criteria
1) Scaffold Project
   - Actions: Create Vite React TS app; add Tailwind, ESLint, Prettier, Vitest; set up `index.html`, `main.tsx`, `App.tsx`, baseline styles.
   - Build: `pnpm dev` serves app; no TS errors.
   - Test: `pnpm test` runs sample passing test.
   - Validate: Header placeholder renders.

2) Add Constants and Quarter Utilities
   - Actions: Implement `constants.ts`, `quarters.ts` with ALL_QUARTERS, index helpers, formatting.
   - Build: Types compile.
   - Test: `quarters.test.ts` passes for mapping and boundaries.
   - Validate: Dev log prints correct 16 columns.

3) Define Types and Zod Schemas
   - Actions: `types.ts`, `schema.ts` with all refinements.
   - Build: TS compiles.
   - Test: `schema.test.ts` with valid and invalid payloads.
   - Validate: Example SPEC JSON parses successfully.

4) State: Context, Reducer, Storage
   - Actions: Implement `actions.ts`, `reducer.ts`, `context.tsx`, `storage.ts` (hydrate/persist on change).
   - Build: Compiles.
   - Test: `reducer.test.ts` for add/update/delete, uniqueness, bounds.
   - Validate: State initializes from defaults in absence of storage.

5) Header Bar & Scenario Select
   - Actions: `Header.tsx`, `ScenarioSelect.tsx`, `HeaderButtons.tsx` with correct layout and controls.
   - Build: Compiles.
   - Test: Component tests ensure buttons and select dispatch actions.
   - Validate: Visual match to SPEC (black background, icons, placement).

6) Timeline Grid
   - Actions: `TimelineGrid.tsx` renders left “Teams” column and 16 quarter columns with labels and year separators.
   - Build: Compiles.
   - Test: Labels and separators rendered positions (DOM tests).
   - Validate: Visual correctness.

7) Swimlanes and Team Counts
   - Actions: `Swimlanes.tsx`, `Swimlane.tsx` list swimlanes from state with counts under active scenario.
   - Build: Compiles.
   - Test: Count correctness for several scenarios.
   - Validate: Visual stacking area ready.

8) Stacking Algorithm and Absolute Layout
   - Actions: Implement `layout.ts`; `TaskItem` positions are absolute within swimlane track using left/width %.
   - Build: Compiles.
   - Test: `layout.test.ts` passes; no overlaps.
   - Validate: Tasks don’t overlap for overlapping spans.

9) Task Item Visuals
   - Actions: Pill shape, outline, name left, percent right, thin orange progress bar; color helper usage.
   - Build: Compiles.
   - Test: Progress bar width function; color selection logic.
   - Validate: Visual adherence to color specs.

10) Task Modal (Create/Edit/Delete)
   - Actions: `TaskModal.tsx` with all fields, validation, Update/Delete/Cancel; pre-populate on edit.
   - Build: Compiles.
   - Test: Component tests for validation (progress bounds, name uniqueness, quarter ordering); reducer effects.
   - Validate: Manual add/edit/delete flows work.

11) Team Modal
   - Actions: `TeamModal.tsx` to add new team; uniqueness enforced.
   - Build: Compiles.
   - Test: Reducer prevents duplicates; trimmed inputs.
   - Validate: New team appears with (0) count.

12) Scenario Modal
   - Actions: `ScenarioModal.tsx` to add new timeline.
   - Build: Compiles.
   - Test: Reducer adds empty scenario; dropdown shows it.
   - Validate: Switching scenarios works.

13) Reposition Animation (2s)
   - Actions: Implement FLIP helpers; integrate around scenario switch in `Swimlanes`/`TaskItem`.
   - Build: Compiles.
   - Test: Component test ensures `transition: transform 2s` set; computed transforms applied; durations honored.
   - Validate: Visual smooth 2s animation on switch.

14) Import/Export
   - Actions: Implement `io/export.ts` and `io/import.ts`; wire to header buttons; use Zod validate on import; toast errors.
   - Build: Compiles.
   - Test: Export payload validates; invalid import rejected; valid replaces state.
   - Validate: Manual export/import round-trip.

15) Persistence
   - Actions: Persist `AppData` to localStorage on state changes; hydrate on load with schema validation fallbacks.
   - Build: Compiles.
   - Test: Storage mocked tests ensure persistence called; invalid stored data ignored.
   - Validate: Refresh retains state.

16) Accessibility Pass
   - Actions: Modal focus trap, ARIA, keyboard; buttons have labels.
   - Build: Compiles.
   - Test: Basic a11y checks; tab order in modals.
   - Validate: Keyboard-only flows usable.

17) Polish & QA
   - Actions: Final icon tweaks, spacing, hover/focus states; minor transitions for appearance (not overdone).
   - Build: Compiles.
   - Test: Lint clean; all tests pass.
   - Validate: SPEC parity checklist complete.

18) Optional E2E
   - Actions: Playwright basic flows: add team/task, switch scenario (animation), export/import.
   - Build: Playwright configured.
   - Test: E2E passes locally.
   - Validate: Smoke UI journey works.

SPEC Compliance Checklist
- Browser-only SPA; no backend required.
- Header: black background; left icon + bold title + timeline select + new timeline button; right: export, import, +Add Team, +Add Task.
- Timeline grid: left Teams column; quarters Q1 2025..Q4 2028; bold quarter labels; grayer smaller year; thin gray year separators.
- Swimlanes: team names with counts; tasks stacked with minimal wasted space.
- Tasks: pill with outline; name left; percent right; thin orange bar indicates completion; colors match blue/indigo schemes with completed/uncompleted shades.
- Behavior: 2s CSS animation on scenario switch; identity by task name.
- Task modal: fields and buttons as specified; edit pre-populates; delete works; cancel closes.
- Timeline modal: name + save/cancel.
- Export: JSON structure as example; includes `exportDate` ISO string.
- Import: file picker; Zod validation; error on invalid; overwrite on success.
- Constraints: uniqueness across teams/tasks/timelines; progress bounds; trimmed names.

Risks & Mitigations
- Global task name uniqueness vs per-scenario storage: Use global uniqueness for identity and to meet SPEC constraint; tasks are stored per scenario but cannot duplicate names across app. If this proves too restrictive in practice, we can relax later, updating animation identity mapping to stable IDs.
- FLIP implementation complexity: Start with simple transition of `transform` computed via measured rects; fallback to CSS transitions using layout changes if timing issues arise.
- Import schema drift: Pin schema in `schema.ts`; add versioning field in future if needed (YAGNI for now).

Notes
- Keep components focused and small; prefer composition over deep prop drilling by using context hooks.
- Keep algorithm logic in `logic/` and keep UI components declarative.

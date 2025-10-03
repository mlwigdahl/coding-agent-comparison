# Dynamic Project Timeline – Quarterly View

Browser-only SPA for planning and tracking multi-team roadmaps across fixed quarterly windows (Q1 2025 – Q4 2028). Timelines, teams, and tasks live entirely in the client via localStorage with optional import/export for sharing state.

## Features
- Interactive quarterly grid with team swimlanes and semicapsule task cards.
- Context-driven state for timelines, teams, and tasks with optimistic updates.
- FLIP-powered animations when timelines change or tasks move.
- CRUD modals for tasks, teams, and timelines with full validation.
- JSON import/export matching the provided scenario schema.
- Accessible keyboard navigation, focus traps, and ARIA labelling across dialogs.

## Getting Started
```bash
npm install
npm run dev
```
The dev server defaults to <http://localhost:5173>. Hot module replacement is enabled.

### Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Launch Vite dev server. |
| `npm run build` | Type-check and produce production bundle. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint over the project. |
| `npm run test` | Execute Vitest test suite in watchless mode. |
| `npm run test:watch` | Run Vitest in watch/HMR mode. |
| `npm run coverage` | Generate coverage report via Vitest. |
| `npm run format:write` | Auto-format with Prettier. |

## Project Structure
```
src/
  components/
    Header/             // Header actions + timeline switcher
    Modals/             // Task, team, timeline dialogs
    TaskCard/TaskLane/  // Task visuals + stacking layout
    TimelineGrid/       // Quarterly grid layout
  context/              // App state provider & reducer actions
  hooks/                // FLIP animation, localStorage, focus trap, stacking
  utils/                // Serialization, validation, quarter helpers, logging
  data/seed.ts          // Default timeline/task bootstrap data
  tests/fixtures        // Sample import JSON (Vitest)
```

## Import / Export
- **Export** downloads `dynamic-project-timeline-<timestamp>.json` capturing every timeline, task, and team along with the active scenario.
- **Import** accepts matching JSON; invalid files show an inline alert while leaving existing state untouched. Successful imports replace all data and update the active timeline.

## Keyboard & Accessibility
- Modals trap focus and close with `Esc` or the Cancel button.
- Timeline dropdown, buttons, and cards expose descriptive labels; task cards are Enter/Space activatable.
- Import alerts are announced via `role="alert"`.

## Data Persistence
State persists via `localStorage` under `dynamic-project-timeline-state-v1`. Use the “Reset” browser storage or import a clean file to start fresh.

## Testing & QA
- Automated coverage: `npm run test` / `npm run coverage`.
- Manual smoke checklist:
  1. Add a new timeline, verify it becomes active and animates.
  2. Create a team and a task; ensure validation catches duplicates and invalid progress.
  3. Export state, refresh, and import the saved file — confirm tasks/teams/timelines match.
  4. Tab through each modal to confirm focus is trapped.

Tested against Node 18+ and modern Chromium-based browsers. For best results, clear localStorage between major schema changes.

import React, { useMemo } from 'react';
import { ALL_QUARTERS } from '../../state/quarters';
import { FIRST_COL_PX } from '../../state/constants';
import { useAppState } from '../../state/context';
import { layoutTeamTasks, ROW_HEIGHT_PX } from '../../logic/layout';
import TaskItem from './TaskItem';

type Props = {
  team: string;
  count: number;
};

export default function Swimlane({ team, count }: Props) {
  const gridTemplate = useMemo(() => `${FIRST_COL_PX}px repeat(${ALL_QUARTERS.length}, minmax(80px, 1fr))`, []);
  const state = useAppState();
  const scenario = state.scenarios.find((s) => s.name === state.activeScenario)!;
  const teamTasks = scenario.tasks.filter((t) => t.swimlane === team);
  const layout = useMemo(() => layoutTeamTasks(teamTasks), [teamTasks]);
  const rows = layout.rowCount;
  const minHeight = Math.max(48, rows * ROW_HEIGHT_PX + 16);

  return (
    <div
      className="grid items-stretch border-b border-gray-100 relative isolate"
      style={{ gridTemplateColumns: gridTemplate, minHeight }}
      data-testid={`swimlane-${team}`}
    >
      {/* Left sticky team cell */}
      <div className="sticky left-0 z-10 bg-white border-r border-gray-200">
        <div className="flex items-center gap-2 px-3 py-2">
          <span aria-hidden className="inline-block w-4 h-4 bg-gray-600 rounded-sm" />
          <span className="font-medium">
            {team} <span className="text-gray-500">({count})</span>
          </span>
        </div>
      </div>

      {/* Quarter cells background (no borders; visual separators drawn absolutely) */}
      {ALL_QUARTERS.map((q) => (
        <div key={q} className="pointer-events-none" aria-hidden />
      ))}

      {/* Tasks + year separators overlay positioned within the timeline columns area only */}
      <div
        className="absolute inset-0 z-10"
        style={{ left: `calc(${FIRST_COL_PX}px + 1px)`, right: 0 }}
        data-testid={`overlay-${team}`}
      >
        {[4, 8, 12].map((i) => (
          <div
            key={`sep-${i}`}
            className="absolute top-0 bottom-0 border-l border-gray-200 pointer-events-none"
            style={{ left: `calc(${i} * 100% / ${ALL_QUARTERS.length})` }}
            data-testid={`year-sep-${i}`}
            aria-hidden
          />
        ))}
        {layout.boxes.map((b) => {
          const t = teamTasks.find((x) => x.name === b.name)!;
          return (
            <TaskItem
              key={`${b.name}::${team}`}
              name={b.name}
              swimlane={team}
              left={b.leftCss}
              width={b.widthCss}
              top={b.topCss}
              progress={t.progress}
              color={t.color}
            />
          );
        })}
      </div>
    </div>
  );
}

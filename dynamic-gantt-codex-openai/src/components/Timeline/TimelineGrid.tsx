import React, { useMemo } from 'react';
import { ALL_QUARTERS, YEAR_SEPARATOR_INDICES, splitQuarterLabel } from '../../state/quarters';
import { FIRST_COL_PX } from '../../state/constants';
import UsersIcon from '../Icons/Users';

export default function TimelineGrid() {
  const gridTemplate = useMemo(() => `${FIRST_COL_PX}px repeat(${ALL_QUARTERS.length}, minmax(80px, 1fr))`, []);

  return (
    <div className="border-b border-gray-200">
      <div
        className="relative grid items-stretch"
        style={{ gridTemplateColumns: gridTemplate }}
        data-testid="timeline-grid"
      >
        {/* Left fixed column header */}
        <div className="sticky left-0 z-10 bg-white border-r border-gray-200">
          <div className="flex items-center gap-2 px-3 py-2">
            <UsersIcon className="w-4 h-4 text-gray-600" />
            <span className="font-medium">Teams</span>
          </div>
        </div>

        {/* Quarter columns */}
        {ALL_QUARTERS.map((q, idx) => {
          const { quarter, year } = splitQuarterLabel(q as any);
          return (
            <div
              key={q}
              className="px-2 py-2 text-center"
            >
              <div className="font-semibold">{quarter}</div>
              <div className="text-xs text-gray-500">{year}</div>
            </div>
          );
        })}

        {/* Absolute year separators before each new year (after indices 4, 8, 12) */}
        {YEAR_SEPARATOR_INDICES.filter((i) => i !== 0).map((i) => (
          <div
            key={`sep-${i}`}
            aria-hidden
            className="absolute top-0 bottom-0 border-l border-gray-200 pointer-events-none"
            style={{ left: `calc(${FIRST_COL_PX}px + 1px + (${i} * (100% - ${FIRST_COL_PX}px - 1px) / ${ALL_QUARTERS.length}))` }}
          />
        ))}
      </div>
    </div>
  );
}

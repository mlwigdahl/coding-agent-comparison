import React from 'react';
import Swimlane from './Swimlane';
import { useAppState } from '../../state/context';
import { getTeamTaskCounts } from '../../state/select';

export default function Swimlanes() {
  const state = useAppState();
  const counts = getTeamTaskCounts(state);

  return (
    <div data-testid="swimlanes">
      {state.swimlanes.length === 0 ? (
        <div className="text-gray-500 text-sm py-6">No teams yet. Use "+ Add Team" to create one.</div>
      ) : (
        state.swimlanes.map((team) => (
          <Swimlane key={team} team={team} count={counts[team] ?? 0} />
        ))
      )}
    </div>
  );
}


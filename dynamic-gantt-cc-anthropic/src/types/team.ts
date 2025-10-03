// Core Team interface based on SPEC.md requirements
export interface ITeam {
  name: string;                   // Unique team name (trimmed, no duplicates)
}

// Team creation payload
export type CreateTeamPayload = {
  name: string;
};

// Team with associated task count for display
export interface TeamWithCount {
  name: string;
  taskCount: number;              // Number of tasks associated with this team
}
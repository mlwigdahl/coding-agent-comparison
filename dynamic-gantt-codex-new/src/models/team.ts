export interface Team {
  id: string
  name: string
  color: string
  taskIds: string[]
}

export type TeamMap = Record<string, Team>

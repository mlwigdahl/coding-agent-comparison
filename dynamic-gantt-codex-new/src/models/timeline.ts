export interface Timeline {
  id: string
  name: string
  taskIds: string[]
}

export type TimelineMap = Record<string, Timeline>

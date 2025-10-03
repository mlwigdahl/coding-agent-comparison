import type { Quarter } from '@/utils/quarter'

export type TaskColor = 'blue' | 'indigo'

export interface Task {
  id: string
  name: string
  teamId: string
  progress: number
  startQuarter: Quarter
  endQuarter: Quarter
  color: TaskColor
}

export type TaskMap = Record<string, Task>

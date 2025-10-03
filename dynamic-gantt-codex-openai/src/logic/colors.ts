import { COLORS } from '../state/constants';

export function taskBackground(color: 'blue' | 'indigo', progress: number): string {
  const done = progress >= 100;
  const scheme = COLORS[color];
  return done ? scheme.completed : scheme.uncompleted;
}

export const PROGRESS_ORANGE = COLORS.orange;


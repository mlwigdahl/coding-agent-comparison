import { quarterIndex } from '../state/quarters';
import { TOTAL_QUARTERS } from '../state/constants';
import type { Task } from '../state/types';
import { FIRST_COL_PX } from '../state/constants';

export const ROW_HEIGHT_PX = 28;

export type LayoutBox = {
  name: string;
  startIdx: number;
  endIdx: number;
  rowIndex: number;
  leftCss: string;
  widthCss: string;
  topCss: string;
};

export type TeamLayout = {
  boxes: LayoutBox[];
  rowCount: number;
};

export function layoutTeamTasks(tasks: Task[]): TeamLayout {
  // Map to intervals with start/end indices
  const intervals = tasks.map((t) => ({
    name: t.name,
    startIdx: quarterIndex(t.startQuarter as any),
    endIdx: quarterIndex(t.endQuarter as any),
  }));

  // Sort by start, then end
  intervals.sort((a, b) => (a.startIdx === b.startIdx ? a.endIdx - b.endIdx : a.startIdx - b.startIdx));

  const rowsLastEnd: number[] = []; // last end index for each row
  const boxes: LayoutBox[] = [];

  for (const it of intervals) {
    let row = 0;
    while (row < rowsLastEnd.length && rowsLastEnd[row] >= it.startIdx) row++;
    if (row === rowsLastEnd.length) rowsLastEnd.push(it.endIdx);
    else rowsLastEnd[row] = it.endIdx;

    const span = it.endIdx - it.startIdx + 1;
    // Edge-inclusive visualization: extend half a quarter on both sides
    const leftQ = it.startIdx - 0.5;
    const rightQ = it.endIdx + 0.5;
    const leftPct = Math.max(0, (leftQ / TOTAL_QUARTERS) * 100);
    const rightPct = Math.min(100, (rightQ / TOTAL_QUARTERS) * 100);
    const widthPct = Math.max(0, rightPct - leftPct);
    const leftCss = `${leftPct}%`;
    const widthCss = `${widthPct}%`;
    const topCss = `${row * ROW_HEIGHT_PX + 8}px`; // small top padding

    boxes.push({ name: it.name, startIdx: it.startIdx, endIdx: it.endIdx, rowIndex: row, leftCss, widthCss, topCss });
  }

  return { boxes, rowCount: rowsLastEnd.length };
}

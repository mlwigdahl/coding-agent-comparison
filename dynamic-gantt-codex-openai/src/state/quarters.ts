import { FIRST_YEAR, LAST_YEAR, QUARTERS_PER_YEAR, TOTAL_QUARTERS } from './constants';

export const YEARS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i) as const;
export const QUARTER_PREFIXES = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export const ALL_QUARTERS = YEARS.flatMap((year) =>
  QUARTER_PREFIXES.map((q) => `${q} ${year}` as const)
) as unknown as readonly [`Q1 ${typeof YEARS[number]}` | `Q2 ${typeof YEARS[number]}` | `Q3 ${typeof YEARS[number]}` | `Q4 ${typeof YEARS[number]}`][];

export type QuarterId = (typeof ALL_QUARTERS)[number];

const indexByQuarter = new Map<QuarterId, number>(
  ALL_QUARTERS.map((q, idx) => [q as QuarterId, idx])
);

export function isValidQuarter(q: string): q is QuarterId {
  return indexByQuarter.has(q as QuarterId);
}

export function quarterIndex(q: QuarterId): number {
  const idx = indexByQuarter.get(q);
  if (idx === undefined) throw new Error(`Unknown quarter: ${q}`);
  return idx;
}

export function indexToQuarter(index: number): QuarterId {
  if (index < 0 || index >= TOTAL_QUARTERS) {
    throw new Error(`Quarter index out of range: ${index}`);
  }
  return ALL_QUARTERS[index] as QuarterId;
}

export function compareQuarters(a: QuarterId, b: QuarterId): number {
  const da = quarterIndex(a);
  const db = quarterIndex(b);
  return Math.sign(da - db);
}

export function quartersBetween(a: QuarterId, b: QuarterId): number {
  const ai = quarterIndex(a);
  const bi = quarterIndex(b);
  if (bi < ai) throw new Error(`End quarter precedes start quarter: ${a} > ${b}`);
  return bi - ai + 1; // inclusive span
}

export function splitQuarterLabel(q: QuarterId): { quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'; year: `${number}` } {
  const [quarter, year] = q.split(' ');
  return { quarter: quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4', year: year as `${number}` };
}

export const YEAR_SEPARATOR_INDICES = YEARS.map((_, i) => i * QUARTERS_PER_YEAR);


import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';

/**
 * What the engine pushes at the overlay.
 *
 * The renderer owns the world and the day it is standing on, so every number
 * here is derived inside it and none of it is recomputed in React — a panel
 * that counted its own districts would disagree with the map the moment the
 * scrubber moved.
 */
export interface WorldRankRow {
  key: string;
  name: string;
  level: number;
  reads: number;
  /** Hex, from the district's or realm's own accent. */
  color: string;
  /** Width of the bar under the row, as a percentage of the largest. */
  share: number;
  selected: boolean;
}

export interface WorldOpenRealm {
  id: string;
  name: string;
  theme: string;
  districts: number;
  articles: number;
}

export interface WorldState {
  status: 'loading' | 'ready';
  progress: number;
  message: string;

  playing: boolean;
  speed: number;
  day: number;
  totalDays: number;
  /** False when there is no growth log to walk — one frame is not a replay. */
  replayable?: boolean;
  date?: string;
  from?: string;
  to?: string;
  span?: string;

  articles?: number;
  districts?: number;
  realms?: number;
  open?: WorldOpenRealm | null;
  rank?: WorldRankRow[];
  /** Set while you are riding a bird. */
  riding?: { manual: boolean } | null;
}

export interface WorldModel {
  user: string;
  replayable: boolean;
  nT: number;
  /** The six realms as bare ground: no reader, no reads, nothing standing. */
  unbuilt?: boolean;
}

/**
 * The counter line, shared by the mobile header and the timeline so the two
 * never drift — and formatted the same way the stat tiles are, because 22,479
 * next to a tile reading 22.5K looks like two different numbers.
 */
export const worldCounts = (state: WorldState): string => {
  if (state.open) {
    return `${state.open.districts} districts · ${formatDataTileValue(
      state.open.articles,
    )} articles`;
  }

  return `${state.realms ?? 0} realms · ${
    state.districts ?? 0
  } districts · ${formatDataTileValue(state.articles ?? 0)} articles`;
};

export interface WorldEngine {
  load: (model: WorldModel) => Promise<void>;
  /** Folds the growth log into a world that is already standing. False if it could not be. */
  attachHistory: (model: WorldModel) => boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (day: number) => void;
  toStart: () => void;
  toEnd: () => void;
  setSpeed: (speed: number) => void;
  focus: (key: string) => void;
  leaveRealm: () => void;
  frameWorld: () => void;
  attachSpark: (canvas: HTMLCanvasElement | null) => void;
  setPadding: (pad: Partial<Record<'l' | 'r' | 't' | 'b', number>>) => void;
  setLook: (id: string) => void;
  setViewFlags: (flags: Partial<Record<string, boolean>>) => void;
  dispose: () => void;
}

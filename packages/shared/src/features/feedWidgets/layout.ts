import type { FeedWidget, FeedWidgetSize } from './types';
import { FeedWidgetKind, feedWidgetSizeSpan } from './types';

/** The sponsored slot's column, zero-based: the third slot of the rail. */
export const FEED_WIDGET_AD_COLUMN = 2;
export const FEED_WIDGET_RAIL_ROWS = 2;
export const FEED_WIDGET_AD_KEY = 'ad-slot';

export type RailPlacement = {
  key: string;
  widget?: FeedWidget;
  isAd?: boolean;
  column: number;
  row: number;
  colSpan: 1 | 2;
  rowSpan: 1 | 2;
};

export type RailLayout = {
  placements: RailPlacement[];
  /** Columns the rail spans, the pinned slot included. */
  columns: number;
};

const cellKey = (column: number, row: number): string => `${column}:${row}`;

const fits = (
  occupied: Set<string>,
  column: number,
  row: number,
  cols: number,
  rows: number,
  blockedColumn: number | null,
): boolean => {
  if (row + rows > FEED_WIDGET_RAIL_ROWS) {
    return false;
  }

  for (let dc = 0; dc < cols; dc += 1) {
    if (column + dc === blockedColumn) {
      return false;
    }

    for (let dr = 0; dr < rows; dr += 1) {
      if (occupied.has(cellKey(column + dc, row + dr))) {
        return false;
      }
    }
  }

  return true;
};

/**
 * First-fit, column by column, so a Small after a Tall drops into the gap a
 * Small before it left rather than opening a new column.
 */
const pack = (
  widgets: FeedWidget[],
  blockedColumn: number | null,
): { placements: RailPlacement[]; occupied: Set<string> } => {
  const occupied = new Set<string>();
  const placements: RailPlacement[] = [];

  widgets.forEach((widget) => {
    const { cols, rows } = feedWidgetSizeSpan[widget.size];
    let column = 0;

    for (;;) {
      let placedRow: number | null = null;

      for (let row = 0; row < FEED_WIDGET_RAIL_ROWS; row += 1) {
        if (fits(occupied, column, row, cols, rows, blockedColumn)) {
          placedRow = row;
          break;
        }
      }

      if (placedRow !== null) {
        for (let dc = 0; dc < cols; dc += 1) {
          for (let dr = 0; dr < rows; dr += 1) {
            occupied.add(cellKey(column + dc, placedRow + dr));
          }
        }
        placements.push({
          key: widget.id,
          widget,
          column,
          row: placedRow,
          colSpan: cols,
          rowSpan: rows,
        });
        break;
      }

      column += 1;
    }
  });

  return { placements, occupied };
};

const columnsUsed = (occupied: Set<string>): number =>
  Array.from(occupied).reduce(
    (max, key) => Math.max(max, Number(key.split(':')[0]) + 1),
    0,
  );

/**
 * Lays the rail out on a two-row grid with the sponsored slot pinned to the
 * third column. A Large first widget fills the first two columns, so the ad
 * comes second; two Talls (or four Smalls) push it to third. When the reader's
 * widgets do not reach the third column, the slot closes up behind them
 * rather than leaving a hole.
 */
export const buildRailPlacement = (
  widgets: FeedWidget[],
  { showAd = true }: { showAd?: boolean } = {},
): RailLayout => {
  if (!showAd) {
    const { placements, occupied } = pack(widgets, null);
    return { placements, columns: columnsUsed(occupied) };
  }

  const unreserved = pack(widgets, null);
  const adColumn = Math.min(
    FEED_WIDGET_AD_COLUMN,
    columnsUsed(unreserved.occupied),
  );
  const { placements, occupied } =
    adColumn === FEED_WIDGET_AD_COLUMN ? pack(widgets, adColumn) : unreserved;
  const ad: RailPlacement = {
    key: FEED_WIDGET_AD_KEY,
    isAd: true,
    column: adColumn,
    row: 0,
    colSpan: 1,
    rowSpan: 2,
  };
  const all = [...placements, ad].sort(
    (first, second) => first.column - second.column || first.row - second.row,
  );

  return {
    placements: all,
    columns: Math.max(columnsUsed(occupied), adColumn + 1),
  };
};

const kinds = new Set<string>(Object.values(FeedWidgetKind));

/**
 * What the settings hold, made safe to render: a kind this build does not
 * know, a size it does not have, a duplicate id or a non-object are dropped
 * rather than crashing the rail. Returns `null` when nothing was stored, so
 * the caller can tell "never customized" from "removed everything".
 */
export const normalizeFeedWidgets = (
  stored: unknown,
  allowedSizes: (kind: FeedWidgetKind) => FeedWidgetSize[],
): FeedWidget[] | null => {
  if (!Array.isArray(stored)) {
    return null;
  }

  const seen = new Set<string>();
  const widgets: FeedWidget[] = [];

  stored.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    const { id, kind, size, config } = item as Partial<FeedWidget>;
    if (
      typeof id !== 'string' ||
      !id ||
      seen.has(id) ||
      !kinds.has(kind as string)
    ) {
      return;
    }
    const supported = allowedSizes(kind as FeedWidgetKind);
    if (!supported.length) {
      return;
    }
    seen.add(id);
    widgets.push({
      id,
      kind: kind as FeedWidgetKind,
      size: supported.includes(size as FeedWidgetSize)
        ? (size as FeedWidgetSize)
        : supported[0],
      ...(config && typeof config === 'object' ? { config } : {}),
    });
  });

  return widgets;
};

export const moveFeedWidget = (
  widgets: FeedWidget[],
  id: string,
  toIndex: number,
): FeedWidget[] => {
  const from = widgets.findIndex((widget) => widget.id === id);
  const to = Math.max(0, Math.min(widgets.length - 1, toIndex));
  if (from === -1 || from === to) {
    return widgets;
  }
  const next = [...widgets];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const createFeedWidgetId = (kind: FeedWidgetKind): string =>
  `${kind}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

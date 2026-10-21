import type { FeedWidget, FeedWidgetKind, FeedWidgetSize } from './types';
import { FEED_WIDGET_AD_COLUMN, feedWidgetSizeSpan } from './types';
import { isNewerFeedWidgetConfig, parseFeedWidgetConfig } from './config';

export const FEED_WIDGET_RAIL_ROWS = 2;
export const FEED_WIDGET_AD_KEY = 'ad-slot';

export type RailPlacement = {
  key: string;
  widget?: FeedWidget;
  isAd?: boolean;
  column: number;
  row: number;
  colSpan: number;
  rowSpan: 1 | 2;
  /** An empty cell before the ad, offered as a slot for another widget. */
  isGap?: boolean;
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
  let adColumn = Math.min(
    FEED_WIDGET_AD_COLUMN,
    columnsUsed(unreserved.occupied),
  );
  let packed =
    adColumn === FEED_WIDGET_AD_COLUMN ? pack(widgets, adColumn) : unreserved;

  // A Large that would straddle the reserved column jumps past it and can
  // leave a whole column before the ad empty. A hole there reads as broken,
  // so the ad closes it up instead.
  const isColumnEmpty = (occupied: Set<string>, column: number): boolean =>
    !occupied.has(cellKey(column, 0)) && !occupied.has(cellKey(column, 1));
  const firstEmpty = Array.from(
    { length: adColumn },
    (_, column) => column,
  ).find((column) => isColumnEmpty(packed.occupied, column));
  if (firstEmpty !== undefined) {
    adColumn = firstEmpty;
    packed = pack(widgets, adColumn);
  }

  // A Small alone in a column before the ad leaves its other cell empty,
  // and nothing behind the ad can reach it. It stays Small, as the reader
  // chose, and the cell becomes a slot for another widget.
  const gaps: RailPlacement[] = [];
  for (let column = 0; column < adColumn; column += 1) {
    for (let row = 0; row < FEED_WIDGET_RAIL_ROWS; row += 1) {
      if (!packed.occupied.has(cellKey(column, row))) {
        gaps.push({
          key: `gap-${column}-${row}`,
          isGap: true,
          column,
          row,
          colSpan: 1,
          rowSpan: 1,
        });
      }
    }
  }
  const placements = [...packed.placements, ...gaps];

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
    columns: Math.max(columnsUsed(packed.occupied), adColumn + 1),
  };
};

/**
 * The stored list, made safe to render: kinds this build cannot render are
 * left out, a size it does not have shows as its first supported one, and
 * each config is validated for its kind, so a widget only ever gets one it
 * understands.
 * For display only; writes go through the stored list, so a widget another
 * client added survives this one's edits.
 */
export const visibleFeedWidgets = (
  stored: FeedWidget[],
  allowedSizes: (kind: FeedWidgetKind) => FeedWidgetSize[],
): FeedWidget[] =>
  stored.flatMap((widget) => {
    const supported = allowedSizes(widget.kind);
    if (!supported.length) {
      return [];
    }
    const { config: storedConfig, ...rest } = widget;
    // A config in a newer build's shape is not read here; the widget falls
    // back to its defaults rather than misread it.
    const config = isNewerFeedWidgetConfig(widget)
      ? undefined
      : parseFeedWidgetConfig(widget.kind, storedConfig);
    return [
      {
        ...rest,
        size: supported.includes(widget.size) ? widget.size : supported[0],
        ...(config ? { config } : {}),
      },
    ];
  });

/**
 * Writes a new order and sizes for the rendered widgets back into the stored
 * list. The slots rendered widgets held are refilled in the new order; the
 * slots of widgets this build cannot render stay exactly where they were.
 * Each widget keeps its stored fields (`config`, `v`, …), and its size too
 * unless the reader changed it: a size this build only shows as another one
 * must survive a reorder, not be reset to what it was shown as.
 */
export const mergeRenderedFeedWidgets = (
  stored: FeedWidget[],
  rendered: FeedWidget[],
  visible: FeedWidget[],
): FeedWidget[] => {
  const storedById = new Map(stored.map((widget) => [widget.id, widget]));
  const shownSize = new Map(visible.map(({ id, size }) => [id, size]));
  const queue = rendered.map((widget) => {
    const original = storedById.get(widget.id);
    if (!original) {
      return widget;
    }
    return widget.size === shownSize.get(widget.id)
      ? original
      : { ...original, size: widget.size };
  });

  const merged = stored.flatMap((widget) => {
    if (!shownSize.has(widget.id)) {
      return [widget];
    }
    const next = queue.shift();
    return next ? [next] : [];
  });

  return [...merged, ...queue];
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

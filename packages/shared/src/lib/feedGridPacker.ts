import type { LayoutHint } from './feedLayoutHint';
import {
  DEFAULT_LAYOUT_HINT,
  LAYOUT_HINT_FALLBACK_CHAIN,
  getLayoutHintDimensions,
  isLargeLayoutHint,
} from './feedLayoutHint';

export interface FeedItemPlacement {
  row: number;
  column: number;
  rowSpan: number;
  colSpan: number;
  /** Hint actually rendered (after fallback). */
  effectiveHint: LayoutHint;
  /** Hint requested by adapter before fallback. */
  requestedHint: LayoutHint;
}

export interface PackFeedItemsParams {
  /** Resolved hint per item, in feed order. */
  hints: LayoutHint[];
  /** Number of grid columns. Must be >= 1. */
  columns: number;
  /**
   * Maximum number of large cards per N items.
   * Defaults to product spec: 1 large per 10 items.
   */
  largeCardDensity?: { maxLarge: number; perItems: number };
}

const DEFAULT_DENSITY = { maxLarge: 1, perItems: 10 };

type OccupiedCells = Map<number, Set<number>>;

const isAreaFree = ({
  occupied,
  row,
  column,
  colSpan,
  rowSpan,
  columns,
}: {
  occupied: OccupiedCells;
  row: number;
  column: number;
  colSpan: number;
  rowSpan: number;
  columns: number;
}): boolean => {
  if (column + colSpan > columns) {
    return false;
  }

  const rowsToCheck = Array.from({ length: rowSpan }, (_, idx) => row + idx);
  return rowsToCheck.every((rowIndex) => {
    const rowCells = occupied.get(rowIndex);
    if (!rowCells) {
      return true;
    }
    const cellsToCheck = Array.from(
      { length: colSpan },
      (_, idx) => column + idx,
    );
    return cellsToCheck.every((columnIndex) => !rowCells.has(columnIndex));
  });
};

const markArea = ({
  occupied,
  row,
  column,
  colSpan,
  rowSpan,
}: {
  occupied: OccupiedCells;
  row: number;
  column: number;
  colSpan: number;
  rowSpan: number;
}): void => {
  Array.from({ length: rowSpan }, (_, idx) => row + idx).forEach((rowIndex) => {
    const rowCells = occupied.get(rowIndex) ?? new Set<number>();
    Array.from({ length: colSpan }, (_, idx) => column + idx).forEach(
      (columnIndex) => rowCells.add(columnIndex),
    );
    occupied.set(rowIndex, rowCells);
  });
};

const findFirstFreeSlot = ({
  occupied,
  columns,
  startRow,
  colSpan,
  rowSpan,
  maxRowsToScan,
  preferRightmost = false,
}: {
  occupied: OccupiedCells;
  columns: number;
  startRow: number;
  colSpan: number;
  rowSpan: number;
  maxRowsToScan: number;
  /**
   * When true, scan column candidates from the rightmost column first.
   * Used to alternate 2-wide cards between the left and right edges so
   * consecutive wide variants do not stack on the same side of the row.
   * Falls back to leftmost columns when the rightmost slot is occupied.
   */
  preferRightmost?: boolean;
}): { row: number; column: number } => {
  const rowCandidates = Array.from(
    { length: maxRowsToScan },
    (_, idx) => startRow + idx,
  );
  const columnSlots = columns - colSpan + 1;
  const columnCandidates = Array.from({ length: columnSlots }, (_, idx) =>
    preferRightmost ? columnSlots - 1 - idx : idx,
  );

  let foundSlot: { row: number; column: number } | null = null;
  rowCandidates.some((row) => {
    const column = columnCandidates.find((candidate) =>
      isAreaFree({
        occupied,
        row,
        column: candidate,
        colSpan,
        rowSpan,
        columns,
      }),
    );
    if (column !== undefined) {
      foundSlot = { row, column };
      return true;
    }
    return false;
  });

  if (!foundSlot) {
    throw new Error('findFirstFreeSlot: exhausted scan window without a slot');
  }

  return foundSlot;
};

const isRowFull = (occupied: OccupiedCells, row: number, columns: number) =>
  (occupied.get(row)?.size ?? 0) >= columns;

/**
 * Walks the feed in order and produces grid placements. Reflows around large
 * cards while preserving feed order. Falls back to smaller sizes when the
 * requested size is structurally impossible (e.g. requested 3 columns on a
 * 2-column layout) or when large-card density cap is reached.
 *
 * The packer is fully deterministic given identical inputs, which keeps SSR
 * stable and makes analytics row/column logging reproducible.
 */
export const packFeedItems = ({
  hints,
  columns,
  largeCardDensity = DEFAULT_DENSITY,
}: PackFeedItemsParams): FeedItemPlacement[] => {
  if (columns < 1) {
    throw new Error('packFeedItems: columns must be >= 1');
  }

  const occupied: OccupiedCells = new Map();
  const placements: FeedItemPlacement[] = [];
  // Generous scan window: at worst we add `hints.length` rows for stacked tall
  // cards. Use rowSpan multiplier to be safe.
  const maxRowsToScan = Math.max(hints.length, 1) * 4;
  let searchStartRow = 0;
  let largeCardsPlaced = 0;
  // Counts placements that ended up rendering as horizontally wide (colSpan > 1,
  // rowSpan === 1). Used to alternate consecutive wide cards between the left
  // and right edges so they don't always stack on the same side.
  let horizontalWidePlacements = 0;
  // Counts placements that ended up rendering as a vertical (rowSpan > 1)
  // card. Used to alternate consecutive vertical cards between the left
  // and right edges so the Most Upvoted / Best Discussed pair sits on
  // opposite sides of the grid.
  let verticalPlacements = 0;

  hints.forEach((requestedHint, index) => {
    const fallbackChain =
      LAYOUT_HINT_FALLBACK_CHAIN[requestedHint] ??
      LAYOUT_HINT_FALLBACK_CHAIN[DEFAULT_LAYOUT_HINT];

    const windowIndex = Math.floor(index / largeCardDensity.perItems);
    const expectedWindowLarge =
      windowIndex * largeCardDensity.maxLarge + largeCardDensity.maxLarge;
    const densityExhausted = largeCardsPlaced >= expectedWindowLarge;

    const eligibleCandidates = fallbackChain.filter((candidate) => {
      const { colSpan } = getLayoutHintDimensions(candidate);
      if (colSpan > columns) {
        return false;
      }
      if (densityExhausted && isLargeLayoutHint(candidate)) {
        return false;
      }
      return true;
    });

    const chosenHint =
      eligibleCandidates.length > 0
        ? eligibleCandidates[0]
        : DEFAULT_LAYOUT_HINT;
    const { colSpan, rowSpan } = getLayoutHintDimensions(chosenHint);
    const isHorizontallyWide = colSpan > 1 && rowSpan === 1;
    const isVertical = rowSpan > 1;
    const preferRightmost =
      (isHorizontallyWide && horizontalWidePlacements % 2 === 1) ||
      (isVertical && verticalPlacements % 2 === 1);
    const slot = findFirstFreeSlot({
      occupied,
      columns,
      startRow: searchStartRow,
      colSpan,
      rowSpan,
      maxRowsToScan,
      preferRightmost,
    });

    markArea({
      occupied,
      row: slot.row,
      column: slot.column,
      colSpan,
      rowSpan,
    });

    if (isLargeLayoutHint(chosenHint)) {
      largeCardsPlaced += 1;
    }
    if (isHorizontallyWide) {
      horizontalWidePlacements += 1;
    }
    if (isVertical) {
      verticalPlacements += 1;
    }

    placements.push({
      row: slot.row,
      column: slot.column,
      rowSpan,
      colSpan,
      effectiveHint: chosenHint,
      requestedHint,
    });

    while (isRowFull(occupied, searchStartRow, columns)) {
      searchStartRow += 1;
    }
  });

  return placements;
};

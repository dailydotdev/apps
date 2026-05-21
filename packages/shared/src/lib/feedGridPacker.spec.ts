import { packFeedItems } from './feedGridPacker';
import type { LayoutHint } from './feedLayoutHint';

describe('packFeedItems', () => {
  it('places all items as 1x1 when no hints are provided', () => {
    const hints: LayoutHint[] = ['1x1', '1x1', '1x1', '1x1'];
    const placements = packFeedItems({ hints, columns: 2 });

    expect(placements).toEqual([
      {
        row: 0,
        column: 0,
        rowSpan: 1,
        colSpan: 1,
        effectiveHint: '1x1',
        requestedHint: '1x1',
      },
      {
        row: 0,
        column: 1,
        rowSpan: 1,
        colSpan: 1,
        effectiveHint: '1x1',
        requestedHint: '1x1',
      },
      {
        row: 1,
        column: 0,
        rowSpan: 1,
        colSpan: 1,
        effectiveHint: '1x1',
        requestedHint: '1x1',
      },
      {
        row: 1,
        column: 1,
        rowSpan: 1,
        colSpan: 1,
        effectiveHint: '1x1',
        requestedHint: '1x1',
      },
    ]);
  });

  it('honors a requested 2x1 wide card on a 3-column grid', () => {
    const hints: LayoutHint[] = ['2x1', '1x1', '1x1', '1x1', '1x1'];
    const placements = packFeedItems({ hints, columns: 3 });

    expect(placements[0]).toMatchObject({
      row: 0,
      column: 0,
      colSpan: 2,
      rowSpan: 1,
      effectiveHint: '2x1',
    });
    expect(placements[1]).toMatchObject({
      row: 0,
      column: 2,
      colSpan: 1,
      rowSpan: 1,
    });
    expect(placements[2]).toMatchObject({
      row: 1,
      column: 0,
      colSpan: 1,
      rowSpan: 1,
    });
    expect(placements[3]).toMatchObject({
      row: 1,
      column: 1,
      colSpan: 1,
      rowSpan: 1,
    });
    expect(placements[4]).toMatchObject({
      row: 1,
      column: 2,
      colSpan: 1,
      rowSpan: 1,
    });
  });

  it('downgrades 2x1 to 1x1 on a 1-column grid', () => {
    const hints: LayoutHint[] = ['2x1', '2x1'];
    const placements = packFeedItems({ hints, columns: 1 });

    placements.forEach((placement) => {
      expect(placement.effectiveHint).toBe('1x1');
      expect(placement.colSpan).toBe(1);
      expect(placement.rowSpan).toBe(1);
    });
  });

  it('keeps strict feed order when reflowing around large cards', () => {
    const hints: LayoutHint[] = ['1x1', '2x1', '1x1', '1x1', '1x1'];
    const placements = packFeedItems({ hints, columns: 3 });

    placements.forEach((placement, index) => {
      placements
        .slice(0, index)
        .forEach((earlier) => expect(earlier.row <= placement.row).toBe(true));
    });
  });

  it('caps large-card density to 1 per 10 items by default', () => {
    const hints: LayoutHint[] = new Array(20).fill('2x1');
    const placements = packFeedItems({ hints, columns: 3 });

    const largeCount = placements.filter(
      (placement) => placement.colSpan * placement.rowSpan > 1,
    ).length;
    expect(largeCount).toBeLessThanOrEqual(2);
  });

  it('respects custom density configuration', () => {
    const hints: LayoutHint[] = new Array(10).fill('2x1');
    const placements = packFeedItems({
      hints,
      columns: 3,
      largeCardDensity: { maxLarge: 2, perItems: 5 },
    });

    const largeCount = placements.filter(
      (placement) => placement.colSpan * placement.rowSpan > 1,
    ).length;
    expect(largeCount).toBeLessThanOrEqual(4);
    expect(largeCount).toBeGreaterThanOrEqual(2);
  });

  it('throws when columns is less than 1', () => {
    expect(() => packFeedItems({ hints: ['1x1'], columns: 0 })).toThrow();
  });

  it('alternates consecutive 2-wide cards between the left and right edges', () => {
    // First 2-wide goes to the left edge (col 0). The next 2-wide should
    // start at col 1 so it sits flush with the right edge of a 3-col grid,
    // preventing two wide cards from stacking on the same side.
    // Density cap is disabled here because the test focuses on placement
    // alternation, not density throttling.
    const hints: LayoutHint[] = ['2x1', '1x1', '2x1', '1x1'];
    const placements = packFeedItems({
      hints,
      columns: 3,
      largeCardDensity: { maxLarge: hints.length, perItems: 1 },
    });

    expect(placements[0]).toMatchObject({ row: 0, column: 0, colSpan: 2 });
    expect(placements[2]).toMatchObject({ row: 1, column: 1, colSpan: 2 });
  });

  it('alternates 2-wide cards across many wide variants', () => {
    // Each `2x1` is followed by a single `1x1` so every wide card lands
    // on a fresh row and can reach its preferred edge without colliding
    // with the previous wide card.
    const hints: LayoutHint[] = [
      '2x1',
      '1x1',
      '2x1',
      '1x1',
      '2x1',
      '1x1',
      '2x1',
      '1x1',
    ];
    const placements = packFeedItems({
      hints,
      columns: 3,
      largeCardDensity: { maxLarge: hints.length, perItems: 1 },
    });

    const wideColumns = placements
      .filter((placement) => placement.colSpan === 2)
      .map((placement) => placement.column);

    expect(wideColumns).toEqual([0, 1, 0, 1]);
  });

  it('keeps the wide card within grid bounds when alternation prefers the right edge', () => {
    const hints: LayoutHint[] = ['1x1', '1x1', '2x1', '1x1', '2x1'];
    const placements = packFeedItems({
      hints,
      columns: 3,
      largeCardDensity: { maxLarge: hints.length, perItems: 1 },
    });

    expect(placements[4]).toMatchObject({ colSpan: 2 });
    expect(placements[4].column + placements[4].colSpan).toBeLessThanOrEqual(3);
  });

  it('backfills holes left when a wide card pushes to the next row', () => {
    // Row 0 has two 1x1 cards, then a 2x1 that cannot fit in the remaining
    // single column. The packer should place the 2x1 on row 1 and fill the
    // hole at (0, 2) with the next 1x1 (dense packing). Without dense fill
    // the rendered grid leaves an empty slot before every wide card.
    const hints: LayoutHint[] = ['1x1', '1x1', '2x1', '1x1', '1x1'];
    const placements = packFeedItems({ hints, columns: 3 });

    expect(placements[2]).toMatchObject({ row: 1, column: 0, colSpan: 2 });
    expect(placements[3]).toMatchObject({ row: 0, column: 2, colSpan: 1 });
    expect(placements[4]).toMatchObject({ row: 1, column: 2, colSpan: 1 });
  });

  it('alternates vertical (1x2) cards between the left and right edges', () => {
    // First 1x2 lands on the leftmost column (col 0). The next 1x2 should
    // prefer the rightmost column (col 3 in a 4-col grid) so the Most
    // Upvoted / Best Discussed pair always sits on opposite sides.
    const hints: LayoutHint[] = [
      '1x2',
      '1x1',
      '1x1',
      '1x1',
      '1x1',
      '1x1',
      '1x1',
      '1x1',
      '1x1',
      '1x1',
      '1x2',
    ];
    const placements = packFeedItems({
      hints,
      columns: 4,
      largeCardDensity: { maxLarge: hints.length, perItems: 1 },
    });

    const verticalColumns = placements
      .filter((placement) => placement.rowSpan > 1)
      .map((placement) => placement.column);

    expect(verticalColumns).toEqual([0, 3]);
  });

  it('does not produce overlapping placements', () => {
    const hints: LayoutHint[] = [
      '2x1',
      '1x1',
      '1x2',
      '1x1',
      '1x1',
      '2x1',
      '1x1',
      '1x1',
    ];
    const placements = packFeedItems({ hints, columns: 3 });

    const cells = new Set<string>();
    placements.forEach(({ row, column, rowSpan, colSpan }) => {
      for (let r = row; r < row + rowSpan; r += 1) {
        for (let c = column; c < column + colSpan; c += 1) {
          const key = `${r}:${c}`;
          expect(cells.has(key)).toBe(false);
          cells.add(key);
        }
      }
    });
  });
});

import type { FeedWidget } from './types';
import { FeedWidgetKind, FeedWidgetSize } from './types';
import {
  buildRailPlacement,
  FEED_WIDGET_AD_COLUMN,
  FEED_WIDGET_AD_KEY,
  mergeRenderedFeedWidgets,
  moveFeedWidget,
  readStoredFeedWidgets,
  visibleFeedWidgets,
} from './layout';

const widget = (
  id: string,
  size: FeedWidgetSize,
  kind = FeedWidgetKind.HappeningNow,
): FeedWidget => ({ id, kind, size });

const adOf = (widgets: FeedWidget[], showAd = true) =>
  buildRailPlacement(widgets, { showAd }).placements.find(({ isAd }) => isAd);

const cellsOf = (widgets: FeedWidget[], showAd = true) =>
  buildRailPlacement(widgets, { showAd }).placements.map(
    ({ key, column, row, colSpan, rowSpan }) => [
      key,
      column,
      row,
      colSpan,
      rowSpan,
    ],
  );

describe('buildRailPlacement', () => {
  it('pins the ad to the third column after a Large first widget', () => {
    const widgets = [
      widget('top', FeedWidgetSize.Large, FeedWidgetKind.TopStory),
      widget('now', FeedWidgetSize.Tall),
    ];

    expect(cellsOf(widgets)).toEqual([
      ['top', 0, 0, 2, 2],
      [FEED_WIDGET_AD_KEY, FEED_WIDGET_AD_COLUMN, 0, 1, 2],
      ['now', 3, 0, 1, 2],
    ]);
  });

  it('pins the ad third when two Talls come first', () => {
    const widgets = [
      widget('a', FeedWidgetSize.Tall),
      widget('b', FeedWidgetSize.Tall),
      widget('c', FeedWidgetSize.Tall),
    ];

    expect(cellsOf(widgets)).toEqual([
      ['a', 0, 0, 1, 2],
      ['b', 1, 0, 1, 2],
      [FEED_WIDGET_AD_KEY, 2, 0, 1, 2],
      ['c', 3, 0, 1, 2],
    ]);
  });

  it('stacks Smalls two to a column and fills a gap before opening a column', () => {
    const widgets = [
      widget('a', FeedWidgetSize.Small),
      widget('b', FeedWidgetSize.Tall),
      widget('c', FeedWidgetSize.Small),
      widget('d', FeedWidgetSize.Small),
    ];

    expect(cellsOf(widgets)).toEqual([
      ['a', 0, 0, 1, 1],
      ['c', 0, 1, 1, 1],
      ['b', 1, 0, 1, 2],
      [FEED_WIDGET_AD_KEY, 2, 0, 1, 2],
      ['d', 3, 0, 1, 1],
    ]);
  });

  it('never splits a Large across the ad column', () => {
    const widgets = [
      widget('a', FeedWidgetSize.Tall),
      widget('big', FeedWidgetSize.Large),
    ];

    // Columns 1-2 would straddle the reserved column, so the Large goes past
    // the ad, and the ad closes up to column 1 rather than leave it empty.
    expect(cellsOf(widgets)).toEqual([
      ['a', 0, 0, 1, 2],
      [FEED_WIDGET_AD_KEY, 1, 0, 1, 2],
      ['big', 2, 0, 2, 2],
    ]);
  });

  it('closes the ad up rather than leave a column before it empty', () => {
    const widgets = [
      widget('a', FeedWidgetSize.Small),
      widget('big', FeedWidgetSize.Large, FeedWidgetKind.TopStory),
    ];

    // The Large cannot straddle the ad, so the ad moves up to column two; the
    // Small keeps its size and its lower cell becomes a slot.
    expect(cellsOf(widgets)).toEqual([
      ['a', 0, 0, 1, 1],
      ['gap-0-1', 0, 1, 1, 1],
      [FEED_WIDGET_AD_KEY, 1, 0, 1, 2],
      ['big', 2, 0, 2, 2],
    ]);
  });

  it('keeps a Small before the ad Small and offers its empty cell', () => {
    const widgets = [
      widget('a', FeedWidgetSize.Tall),
      widget('b', FeedWidgetSize.Small),
      widget('c', FeedWidgetSize.Tall),
    ];

    expect(cellsOf(widgets)).toEqual([
      ['a', 0, 0, 1, 2],
      ['b', 1, 0, 1, 1],
      ['gap-1-1', 1, 1, 1, 1],
      [FEED_WIDGET_AD_KEY, 2, 0, 1, 2],
      ['c', 3, 0, 1, 2],
    ]);
  });

  it('closes the ad up behind widgets that do not reach the third column', () => {
    expect(adOf([widget('a', FeedWidgetSize.Small)])?.column).toBe(1);
    expect(adOf([])?.column).toBe(0);
    expect(buildRailPlacement([]).columns).toBe(1);
  });

  it('leaves the ad out when the surface says so', () => {
    const widgets = [widget('a', FeedWidgetSize.Tall)];

    expect(adOf(widgets, false)).toBeUndefined();
    expect(buildRailPlacement(widgets, { showAd: false }).columns).toBe(1);
  });
});

describe('stored and rendered widgets', () => {
  const sizes = (kind: FeedWidgetKind) => {
    if (
      kind === FeedWidgetKind.Streak ||
      !Object.values(FeedWidgetKind).includes(kind)
    ) {
      return [];
    }
    return [FeedWidgetSize.Tall, FeedWidgetSize.Small];
  };

  it('reads nothing stored as null and an emptied rail as empty', () => {
    expect(readStoredFeedWidgets(undefined)).toBeNull();
    expect(readStoredFeedWidgets('nope')).toBeNull();
    expect(readStoredFeedWidgets([])).toEqual([]);
  });

  it('keeps every well-formed item as stored, unknown kinds and fields too', () => {
    expect(
      readStoredFeedWidgets([
        { id: 'a', kind: 'happeningNow', size: 'large', v: 2 },
        { id: 'a', kind: 'happeningNow', size: 'tall' },
        { id: 'b', kind: 'fromTheFuture', size: 'huge' },
        { kind: 'streak', size: 'small' },
        'garbage',
      ]),
    ).toEqual([
      { id: 'a', kind: 'happeningNow', size: 'large', v: 2 },
      { id: 'b', kind: 'fromTheFuture', size: 'huge' },
    ]);
  });

  it('renders only what this build has, coercing an unsupported size', () => {
    const stored = readStoredFeedWidgets([
      { id: 'a', kind: 'happeningNow', size: 'large', v: 2 },
      { id: 'b', kind: 'streak', size: 'small' },
      { id: 'c', kind: 'fromTheFuture', size: 'small' },
    ]) as FeedWidget[];

    expect(visibleFeedWidgets(stored, sizes)).toEqual([
      { id: 'a', kind: 'happeningNow', size: 'tall', v: 2 },
    ]);
  });

  it('writes a new order back without touching what it could not render', () => {
    const stored = [
      widget('a', FeedWidgetSize.Tall),
      { ...widget('s', FeedWidgetSize.Small), kind: FeedWidgetKind.Streak },
      { ...widget('b', FeedWidgetSize.Tall), v: 3 },
      widget('c', FeedWidgetSize.Tall),
    ];
    const renderableIds = new Set(['a', 'b', 'c']);
    const reordered = [
      widget('c', FeedWidgetSize.Tall),
      widget('a', FeedWidgetSize.Small),
      widget('b', FeedWidgetSize.Tall),
    ];

    // The streak keeps slot two; the rest refill the other slots in order,
    // keeping their stored fields and taking only their new size.
    expect(mergeRenderedFeedWidgets(stored, reordered, renderableIds)).toEqual([
      widget('c', FeedWidgetSize.Tall),
      { ...widget('s', FeedWidgetSize.Small), kind: FeedWidgetKind.Streak },
      widget('a', FeedWidgetSize.Small),
      { ...widget('b', FeedWidgetSize.Tall), v: 3 },
    ]);
  });
});

describe('moveFeedWidget', () => {
  const widgets = ['a', 'b', 'c'].map((id) => widget(id, FeedWidgetSize.Tall));

  it('moves within bounds and returns the same list for a no-op', () => {
    expect(moveFeedWidget(widgets, 'c', 0).map(({ id }) => id)).toEqual([
      'c',
      'a',
      'b',
    ]);
    expect(moveFeedWidget(widgets, 'a', 99).map(({ id }) => id)).toEqual([
      'b',
      'c',
      'a',
    ]);
    expect(moveFeedWidget(widgets, 'a', 0)).toBe(widgets);
    expect(moveFeedWidget(widgets, 'zz', 1)).toBe(widgets);
  });
});

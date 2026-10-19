import type { FeedWidget } from './types';
import { FeedWidgetKind, FeedWidgetSize } from './types';
import {
  buildRailPlacement,
  FEED_WIDGET_AD_COLUMN,
  FEED_WIDGET_AD_KEY,
  moveFeedWidget,
  normalizeFeedWidgets,
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

    // Column 1 is free but columns 1-2 are not, so the Large moves past the ad.
    expect(cellsOf(widgets)).toEqual([
      ['a', 0, 0, 1, 2],
      [FEED_WIDGET_AD_KEY, 2, 0, 1, 2],
      ['big', 3, 0, 2, 2],
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

describe('normalizeFeedWidgets', () => {
  const sizes = (kind: FeedWidgetKind) =>
    kind === FeedWidgetKind.Streak
      ? []
      : [FeedWidgetSize.Tall, FeedWidgetSize.Small];

  it('returns null when nothing was stored', () => {
    expect(normalizeFeedWidgets(undefined, sizes)).toBeNull();
    expect(normalizeFeedWidgets(null, sizes)).toBeNull();
    expect(normalizeFeedWidgets('nope', sizes)).toBeNull();
  });

  it('keeps an emptied rail as empty, not as the default', () => {
    expect(normalizeFeedWidgets([], sizes)).toEqual([]);
  });

  it('drops what this build cannot render and coerces an unsupported size', () => {
    expect(
      normalizeFeedWidgets(
        [
          { id: 'a', kind: 'happeningNow', size: 'large' },
          { id: 'a', kind: 'happeningNow', size: 'tall' },
          { id: 'b', kind: 'streak', size: 'small' },
          { id: 'c', kind: 'bogus', size: 'small' },
          { id: 'd', kind: 'happeningNow', size: 'huge' },
          'garbage',
          {
            id: 'e',
            kind: 'squadUpdates',
            size: 'small',
            config: { sourceId: 'x' },
          },
        ],
        sizes,
      ),
    ).toEqual([
      { id: 'a', kind: 'happeningNow', size: 'tall' },
      { id: 'd', kind: 'happeningNow', size: 'tall' },
      {
        id: 'e',
        kind: 'squadUpdates',
        size: 'small',
        config: { sourceId: 'x' },
      },
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

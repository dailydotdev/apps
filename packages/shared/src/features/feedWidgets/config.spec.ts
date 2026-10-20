import type { FeedWidget } from './types';
import { FeedWidgetKind, FeedWidgetSize } from './types';
import { isValidFeedWidgetConfig, parseFeedWidgetConfig } from './config';
import { mergeRenderedFeedWidgets, visibleFeedWidgets } from './layout';

const sizes = () => [FeedWidgetSize.Tall, FeedWidgetSize.Small];

describe('feed widget config', () => {
  it('passes a valid config to its widget, minus fields it does not know', () => {
    expect(
      parseFeedWidgetConfig(FeedWidgetKind.SquadUpdates, {
        sourceId: 'squad',
        addedByNewerClient: true,
      }),
    ).toEqual({ sourceId: 'squad' });
  });

  it('gives a widget no config when the stored one does not validate', () => {
    expect(
      parseFeedWidgetConfig(FeedWidgetKind.SquadUpdates, { sourceId: 42 }),
    ).toBeUndefined();
    expect(
      parseFeedWidgetConfig(FeedWidgetKind.TopicalDigest, {
        tags: Array.from({ length: 11 }, (_, index) => `tag${index}`),
      }),
    ).toBeUndefined();
    expect(
      parseFeedWidgetConfig(FeedWidgetKind.Weather, { unit: 'kelvin' }),
    ).toBeUndefined();
    // A kind that takes no config gets none, whatever is stored.
    expect(
      parseFeedWidgetConfig(FeedWidgetKind.TopStory, { anything: 1 }),
    ).toBeUndefined();
  });

  it('only lets a valid config be written', () => {
    expect(isValidFeedWidgetConfig(FeedWidgetKind.Weather, { unit: 'c' })).toBe(
      true,
    );
    expect(
      isValidFeedWidgetConfig(FeedWidgetKind.Weather, { unit: 'kelvin' }),
    ).toBe(false);
    expect(isValidFeedWidgetConfig(FeedWidgetKind.TopStory, {})).toBe(false);
  });

  it('renders the checked config and writes the stored one back untouched', () => {
    const stored: FeedWidget[] = [
      {
        id: 'a',
        kind: FeedWidgetKind.SquadUpdates,
        size: FeedWidgetSize.Tall,
        config: {
          sourceId: 'squad',
          addedByNewerClient: true,
        } as unknown as FeedWidget['config'],
      },
      {
        id: 'b',
        kind: FeedWidgetKind.SquadUpdates,
        size: FeedWidgetSize.Tall,
        config: { sourceId: 42 } as unknown as FeedWidget['config'],
      },
    ];

    const visible = visibleFeedWidgets(stored, sizes);
    expect(visible.map(({ config }) => config)).toEqual([
      { sourceId: 'squad' },
      undefined,
    ]);

    // A reorder from this client keeps both stored configs exactly as they
    // were, the invalid one included: it may be a newer client's shape.
    expect(
      mergeRenderedFeedWidgets(
        stored,
        [visible[1], visible[0]],
        new Set(['a', 'b']),
      ),
    ).toEqual([stored[1], stored[0]]);
  });
});

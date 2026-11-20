import type { FeedWidget } from './types';
import { FeedWidgetKind, FeedWidgetSize } from './types';
import { visibleFeedWidgets } from './layout';
import { readStoredFeedRail } from './storedRail';

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
    expect(readStoredFeedRail(undefined)).toBeNull();
    expect(readStoredFeedRail('nope')).toBeNull();
    expect(readStoredFeedRail([])).toBeNull();
    expect(readStoredFeedRail({ version: 1, widgets: [] })).toEqual({
      version: 1,
      widgets: [],
    });
  });

  it('keeps every well-formed item and rail field as stored', () => {
    expect(
      readStoredFeedRail({
        version: 1,
        startedFrom: 'default-3',
        offered: ['streak'],
        widgets: [
          { id: 'a', kind: 'happeningNow', size: 'large', v: 2 },
          { id: 'a', kind: 'happeningNow', size: 'tall' },
          { id: 'b', kind: 'fromTheFuture', size: 'huge' },
          { kind: 'streak', size: 'small' },
          'garbage',
        ],
      }),
    ).toEqual({
      version: 1,
      startedFrom: 'default-3',
      offered: ['streak'],
      widgets: [
        { id: 'a', kind: 'happeningNow', size: 'large', v: 2 },
        { id: 'b', kind: 'fromTheFuture', size: 'huge' },
      ],
    });
  });

  it('renders only what this build has, coercing an unsupported size', () => {
    const stored = readStoredFeedRail({
      version: 1,
      widgets: [
        { id: 'a', kind: 'happeningNow', size: 'large', v: 2 },
        { id: 'b', kind: 'streak', size: 'small' },
        { id: 'c', kind: 'fromTheFuture', size: 'small' },
      ],
    })?.widgets as FeedWidget[];

    expect(visibleFeedWidgets(stored, sizes)).toEqual([
      { id: 'a', kind: 'happeningNow', size: 'tall', v: 2 },
    ]);
  });
});

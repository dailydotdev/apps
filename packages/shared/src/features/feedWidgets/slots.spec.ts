import type { FeedWidget } from './types';
import { FeedWidgetKind, FeedWidgetSize } from './types';
import type { FeedItem } from '../../hooks/useFeed';
import { FeedItemType } from '../../components/cards/common/common';
import {
  findFeedWidgetMoveTarget,
  moveFeedWidgetSlot,
  placeFeedWidget,
  slottedFeedWidgets,
  unplaceFeedWidget,
} from './slots';

const widget = (id: string, slot?: number): FeedWidget => ({
  id,
  kind: FeedWidgetKind.Streak,
  size: FeedWidgetSize.Tall,
  ...(slot === undefined ? {} : { slot }),
});

const slotsOf = (widgets: FeedWidget[]) =>
  widgets.map(({ id, slot }) => [id, slot]);

describe('feed widget slots', () => {
  it('reads only the widgets with a slot, in slot order', () => {
    expect(
      slotsOf(
        slottedFeedWidgets([
          widget('b', 4),
          widget('rail'),
          widget('a', 1),
          widget('bad', -1),
        ]),
      ),
    ).toEqual([
      ['a', 1],
      ['b', 4],
    ]);
  });

  it('places a widget and moves what follows it along a card', () => {
    expect(
      slotsOf(
        placeFeedWidget([widget('a', 1), widget('b', 3)], widget('new'), 3),
      ),
    ).toEqual([
      ['a', 1],
      ['new', 3],
      ['b', 4],
    ]);
  });

  it('reverses a placement on removal', () => {
    const placed = placeFeedWidget(
      [widget('a', 1), widget('b', 3)],
      widget('new'),
      2,
    );

    expect(slotsOf(unplaceFeedWidget(placed, 'new'))).toEqual([
      ['a', 1],
      ['b', 3],
    ]);
  });

  it('moves a widget a card along past a card or another widget', () => {
    expect(
      slotsOf(moveFeedWidgetSlot([widget('a', 1), widget('b', 5)], 'a', 2)),
    ).toEqual([
      ['a', 2],
      ['b', 5],
    ]);
    expect(
      slotsOf(moveFeedWidgetSlot([widget('a', 1), widget('b', 2)], 'b', 1)),
    ).toEqual([
      ['b', 1],
      ['a', 2],
    ]);
  });

  it('steps a move over ads and placeholders, which keep their cells', () => {
    const items = [
      { type: FeedItemType.Post },
      { type: FeedItemType.Ad },
      { type: FeedItemType.Widget },
      { type: FeedItemType.Ad },
      { type: FeedItemType.Placeholder },
    ] as FeedItem[];

    expect(findFeedWidgetMoveTarget(items, 2, -1)).toBe(0);
    expect(findFeedWidgetMoveTarget(items, 2, 1)).toBeUndefined();
  });
});

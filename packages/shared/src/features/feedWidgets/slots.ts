import type { FeedWidget } from './types';
import { builtFeedWidgetKinds } from './types';
import type { FeedItem } from '../../hooks/useFeed';
import { FeedItemType } from '../../components/cards/common/common';

// Kept free of the registry and the widgets: the feed reads the slots on
// every load to place its cards, before any widget code is fetched.

export type SlottedFeedWidget = FeedWidget & { slot: number };

const builtKinds = new Set<string>(builtFeedWidgetKinds);

/**
 * The cards the narrowest laptop grid has in a row, so a slot below this is in
 * the first row whatever the reader's columns.
 */
export const FEED_WIDGET_FIRST_ROW_SLOTS = 3;

export const isSlottedFeedWidget = (
  widget: FeedWidget,
): widget is SlottedFeedWidget =>
  Number.isInteger(widget.slot) && (widget.slot as number) >= 0;

/**
 * The widgets placed in the feed, by slot. Two widgets stored on the same
 * slot both render, one after the other, in their stored order.
 */
export const slottedFeedWidgets = (
  widgets: FeedWidget[],
): SlottedFeedWidget[] =>
  widgets
    .filter(isSlottedFeedWidget)
    .map((widget, order) => ({ widget, order }))
    .sort((a, b) => a.widget.slot - b.widget.slot || a.order - b.order)
    .map(({ widget }) => widget);

/**
 * The list with `widget` placed at `slot`: the feed's items from that slot on,
 * other widgets included, move one card along, so nothing else changes place
 * relative to the posts around it. Widgets without a slot (the old header
 * rail's) are dropped: the feed has nowhere to put them.
 */
export const placeFeedWidget = (
  widgets: FeedWidget[],
  widget: FeedWidget,
  slot: number,
): SlottedFeedWidget[] => {
  const target = Math.max(0, Math.floor(slot));
  const others = slottedFeedWidgets(widgets)
    .filter(({ id }) => id !== widget.id)
    .map((item) =>
      item.slot >= target ? { ...item, slot: item.slot + 1 } : item,
    );

  return slottedFeedWidgets([...others, { ...widget, slot: target }]);
};

/**
 * The list without the widget: the items after it move back one card, so
 * removing is the exact reverse of placing.
 */
export const unplaceFeedWidget = (
  widgets: FeedWidget[],
  id: string,
): SlottedFeedWidget[] => {
  const slotted = slottedFeedWidgets(widgets);
  const removed = slotted.find((item) => item.id === id);
  if (!removed) {
    return slotted;
  }

  return slotted
    .filter((item) => item.id !== id)
    .map((item) =>
      item.slot > removed.slot ? { ...item, slot: item.slot - 1 } : item,
    );
};

/** The widget one card earlier or later, swapping with what is there. */
export const moveFeedWidgetSlot = (
  widgets: FeedWidget[],
  id: string,
  to: number,
): SlottedFeedWidget[] => {
  const widget = slottedFeedWidgets(widgets).find((item) => item.id === id);
  if (!widget) {
    return slottedFeedWidgets(widgets);
  }

  return placeFeedWidget(unplaceFeedWidget(widgets, id), widget, to);
};

/**
 * The placed widgets this build can render. A kind it has no widget for (one
 * a newer client added, or one named here but not built yet) stays stored,
 * but takes no cell, so it never leaves a hole in the grid.
 */
export const seatableFeedWidgets = (
  widgets: FeedWidget[],
): SlottedFeedWidget[] =>
  slottedFeedWidgets(widgets).filter(({ kind }) => builtKinds.has(kind));

/**
 * The nearest item a widget can swap places with, stepping over ads (they
 * keep their cell) and placeholders (still loading).
 */
export const findFeedWidgetMoveTarget = (
  items: FeedItem[],
  index: number,
  step: 1 | -1,
): number | undefined => {
  for (let at = index + step; at >= 0 && at < items.length; at += step) {
    const { type } = items[at];
    if (type !== FeedItemType.Ad && type !== FeedItemType.Placeholder) {
      return at;
    }
  }
  return undefined;
};

import type { FeedWidget } from './types';

// Kept free of the registry and the widgets: the feed reads the slots on
// every load to place its cards, before any widget code is fetched.

export type SlottedFeedWidget = FeedWidget & { slot: number };

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

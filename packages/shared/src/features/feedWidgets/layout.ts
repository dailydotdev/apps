import type { FeedWidget, FeedWidgetKind, FeedWidgetSize } from './types';
import { isNewerFeedWidgetConfig, parseFeedWidgetConfig } from './config';

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

export const createFeedWidgetId = (kind: FeedWidgetKind): string =>
  `${kind}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

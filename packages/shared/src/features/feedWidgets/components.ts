import type { ComponentType } from 'react';
import type {
  FeedWidgetAvailability,
  FeedWidgetComponentProps,
  FeedWidgetDefinition,
} from './registry';
import { feedWidgetRegistry } from './registry';
import type { FeedWidgetKind, FeedWidgetSize } from './types';
import { TopStoryWidget } from './widgets/TopStoryWidget';
import { HappeningNowWidget } from './widgets/HappeningNowWidget';

/**
 * The widgets that exist. A kind the registry names but this map lacks is not
 * built yet: hidden from the gallery, and dropped when it is stored.
 */
export const feedWidgetComponents: {
  [K in FeedWidgetKind]?: ComponentType<FeedWidgetComponentProps<K>>;
} = {
  topStory: TopStoryWidget,
  happeningNow: HappeningNowWidget,
};

export const getFeedWidgetComponent = (
  kind: FeedWidgetKind,
): ComponentType<FeedWidgetComponentProps> | undefined =>
  feedWidgetComponents[kind] as
    | ComponentType<FeedWidgetComponentProps>
    | undefined;

/** Sizes a kind supports; none when the widget is not built. */
export const feedWidgetSizes = (kind: FeedWidgetKind): FeedWidgetSize[] =>
  feedWidgetComponents[kind] ? feedWidgetRegistry[kind].sizes : [];

/** The kinds a reader can add: built, and allowed for their account. */
export const availableFeedWidgets = (
  context: FeedWidgetAvailability,
): FeedWidgetDefinition[] =>
  (Object.values(feedWidgetRegistry) as FeedWidgetDefinition[]).filter(
    (definition) =>
      !!feedWidgetComponents[definition.kind] &&
      (definition.isAvailable?.(context) ?? true),
  );

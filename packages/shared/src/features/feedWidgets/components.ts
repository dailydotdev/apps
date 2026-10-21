import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type {
  FeedWidgetAvailability,
  FeedWidgetComponentProps,
  FeedWidgetDefinition,
} from './registry';
import { feedWidgetRegistry } from './registry';
import type { FeedWidgetKind, FeedWidgetSize } from './types';
import { FeedWidgetLoading } from './FeedWidgetFrame';

// Each widget is its own chunk, loaded the first time one renders, so the
// feed's bundle carries none of them and a reader only downloads the widgets
// on their rail.
const TopStoryWidget = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedWidgetTopStory" */ './widgets/TopStoryWidget'
    ).then((mod) => mod.TopStoryWidget),
  { loading: FeedWidgetLoading },
);

const HappeningNowWidget = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedWidgetHappeningNow" */ './widgets/HappeningNowWidget'
    ).then((mod) => mod.HappeningNowWidget),
  { loading: FeedWidgetLoading },
);

const BriefingWidget = dynamic(
  () =>
    import(
      /* webpackChunkName: "feedWidgetBriefing" */ './widgets/BriefingWidget'
    ).then((mod) => mod.BriefingWidget),
  { loading: FeedWidgetLoading },
);

/**
 * The widgets that exist. A kind the registry names but this map lacks is not
 * built yet: hidden from the gallery, and left out of the rendered rail. The
 * map itself is synchronous, so knowing which kinds exist costs no download.
 */
export const feedWidgetComponents: {
  [K in FeedWidgetKind]?: ComponentType<FeedWidgetComponentProps<K>>;
} = {
  topStory: TopStoryWidget,
  happeningNow: HappeningNowWidget,
  briefing: BriefingWidget,
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

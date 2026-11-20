import { useCallback, useMemo, useRef } from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import {
  featureFeedWidgets,
  featureFeedWidgetsDefault,
} from '../../lib/featureManagement';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import type { FeedWidget } from './types';
import {
  FEED_WIDGET_RAIL_VERSION,
  FEED_WIDGET_UNDO_MS,
  FeedWidgetKind,
} from './types';
import { FEED_WIDGET_FIRST_ROW_SLOTS, seatableFeedWidgets } from './slots';
import {
  customFeedWidgets,
  feedRailFingerprint,
  isFeedWidgetsHidden,
  readStoredFeedRail,
  resolveDefaultFeedRail,
} from './storedRail';
import { useFeedLayout } from '../../hooks/useFeedLayout';
import { useFeedHeroData } from '../../components/feeds/hero/useFeedHeroData';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import type { SettingsFlags } from '../../graphql/settings';
import { SharedFeedPage } from '../../components/utilities/common';

/**
 * What the rail puts on screen that the grid below must not repeat. The feed
 * takes back a slot the moment its widget is removed.
 */
export type FeedWidgetFeedState = {
  /** The widgets placed in the feed, by slot, for the grid to seat. */
  widgets: FeedWidget[];
  /** Posts the widgets show, kept out of the grid. */
  excludedPostIds: string[];
  /**
   * The reader placed Happening Now somewhere in the feed, so the grid drops
   * its own Happening Now card: one is enough, wherever it sits.
   */
  hasHappeningNow: boolean;
  /** The top story leads the first row, so wide cards stay out of it. */
  hasTopStoryFirst: boolean;
};

export const emptyFeedWidgetFeedState: FeedWidgetFeedState = {
  widgets: [],
  excludedPostIds: [],
  hasHappeningNow: false,
  hasTopStoryFirst: false,
};

/**
 * Whether this feed takes widgets: For you and Popular, on a laptop's grid,
 * behind the flag, unless the reader hid them. The one predicate the feed
 * and the header both read.
 */
export const useFeedWidgetRailState = (
  feedName?: string,
): { isFlagOn: boolean; isEnabled: boolean } => {
  const { flags } = useSettingsContext();
  // Widgets take a card's cell, so only a grid has room for them: below
  // laptop, and in list mode on a laptop, the feed is a list, and those
  // readers are never enrolled in the flag.
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isListMode, shouldUseListFeedLayout } = useFeedLayout();
  const isMainFeedPage =
    feedName === SharedFeedPage.MyFeed || feedName === SharedFeedPage.Popular;
  const isEligible =
    isMainFeedPage && isLaptop && !isListMode && !shouldUseListFeedLayout;
  const { value: isFlagOn } = useConditionalFeature({
    feature: featureFeedWidgets,
    shouldEvaluate: isEligible,
  });
  const isOn = isEligible && !!isFlagOn;

  return {
    isFlagOn: isOn,
    isEnabled:
      isOn && !isFeedWidgetsHidden(readStoredFeedRail(flags?.feedWidgets)),
  };
};

/**
 * The widgets the rail will show, as the page around it can know them before
 * the rail's own code loads: the reader's stored rail, or the default for a
 * reader who never customized. The stored rail and the default come straight
 * from the light reader: the registry, the widgets and their config schemas
 * stay out of this bundle, in the rail's own chunk.
 */
const useResolvedFeedWidgets = ({
  enabled,
}: {
  enabled: boolean;
}): FeedWidget[] => {
  const { flags } = useSettingsContext();
  const custom = useMemo(
    () => customFeedWidgets(readStoredFeedRail(flags?.feedWidgets)),
    [flags?.feedWidgets],
  );
  const { value: defaultFlag } = useConditionalFeature({
    feature: featureFeedWidgetsDefault,
    shouldEvaluate: enabled && custom === null,
  });

  return useMemo(
    () =>
      seatableFeedWidgets(
        custom ?? resolveDefaultFeedRail(defaultFlag).widgets,
      ),
    [custom, defaultFlag],
  );
};

/**
 * The widgets the grid seats and what it must not repeat, worked out on the
 * feed's side from what is known before the grid paints: the widgets the
 * reader placed (their settings, or the default) and the top story's lead,
 * held for the session and painted from the last load's payload. Nothing
 * waits on the widgets' own code, so the grid never moves when it lands.
 */
export const useFeedWidgetFeedState = ({
  enabled,
}: {
  enabled: boolean;
}): FeedWidgetFeedState => {
  const widgets = useResolvedFeedWidgets({ enabled });
  const hasTopStory = widgets.some(
    ({ kind }) => kind === FeedWidgetKind.TopStory,
  );
  const hasTopStoryFirst = widgets.some(
    ({ kind, slot }) =>
      kind === FeedWidgetKind.TopStory &&
      (slot ?? 0) < FEED_WIDGET_FIRST_ROW_SLOTS,
  );
  const { shownLeadIds } = useFeedHeroData({
    enabled: enabled && hasTopStory,
  });
  const hasHappeningNow = widgets.some(
    ({ kind }) => kind === FeedWidgetKind.HappeningNow,
  );

  return useMemo(
    () =>
      enabled
        ? {
            widgets,
            excludedPostIds: hasTopStory ? shownLeadIds : [],
            hasHappeningNow,
            hasTopStoryFirst,
          }
        : emptyFeedWidgetFeedState,
    [
      enabled,
      widgets,
      hasTopStory,
      hasTopStoryFirst,
      hasHappeningNow,
      shownLeadIds,
    ],
  );
};

/**
 * The reader's switch for widgets in the feed, held on the stored widgets so
 * it starts fresh from the rail's `feedWidgetsOptOut`. Hiding unmounts the
 * widgets, so the feed owns the write and its Undo, and each write merges
 * into the latest flags: a setter from the render that offered the button
 * would write that render's settings back over anything changed since.
 */
export const useFeedWidgetsOptOut = (): {
  isOptedOut: boolean;
  setOptedOut: (isOptedOut: boolean) => Promise<boolean>;
  hide: () => void;
} => {
  const { flags, setSettings } = useSettingsContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const latest = useRef({ flags, setSettings });
  latest.current = { flags, setSettings };

  const setOptedOut = useCallback(
    (isOptedOut: boolean): Promise<boolean> => {
      // A reader who never saved widgets stays on the default, with only the
      // switch stored over it.
      const rail = readStoredFeedRail(latest.current.flags?.feedWidgets) ?? {
        version: FEED_WIDGET_RAIL_VERSION,
        widgets: [],
        fromDefault: feedRailFingerprint([]),
      };
      return latest.current
        .setSettings({
          flags: {
            ...latest.current.flags,
            feedWidgets: { ...rail, hidden: isOptedOut },
          } as SettingsFlags,
        })
        .then(() => true)
        .catch(() => {
          displayToast('Couldn’t save your widgets. Try again.');
          return false;
        });
    },
    [displayToast],
  );

  const logHide = useCallback(
    (eventName: LogEvent) =>
      logEvent({
        event_name: eventName,
        target_type: TargetType.FeedWidget,
        extra: JSON.stringify({ origin: Origin.FeedWidgets }),
      }),
    [logEvent],
  );

  const hide = useCallback(() => {
    setOptedOut(true).then(
      (isSaved) => isSaved && logHide(LogEvent.HideFeedWidgets),
    );
    displayToast('Widgets hidden. Bring them back in Settings → Appearance', {
      timer: FEED_WIDGET_UNDO_MS,
      action: {
        copy: 'Undo',
        onClick: () =>
          setOptedOut(false).then(
            (isSaved) => isSaved && logHide(LogEvent.UndoHideFeedWidgets),
          ),
      },
    });
  }, [displayToast, logHide, setOptedOut]);

  return {
    isOptedOut: isFeedWidgetsHidden(readStoredFeedRail(flags?.feedWidgets)),
    setOptedOut,
    hide,
  };
};

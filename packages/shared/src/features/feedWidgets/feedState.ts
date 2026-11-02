import { useCallback, useContext, useMemo, useRef } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useFeaturesReadyContext } from '../../components/GrowthBookProvider';
import {
  featureFeedWidgets,
  featureFeedWidgetsDefault,
} from '../../lib/featureManagement';
import FeedContext from '../../contexts/FeedContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIsPhone, useIsPhoneSettled } from '../../hooks/useViewSize';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import type { FeedWidget } from './types';
import {
  FEED_WIDGET_AD_COLUMN,
  FEED_WIDGET_UNDO_MS,
  FeedWidgetKind,
} from './types';
import {
  customFeedWidgets,
  readStoredFeedRail,
  resolveDefaultFeedRail,
} from './storedRail';
import type { Ad } from '../../graphql/posts';
import { useAdQuery } from '../monetization/useAdQuery';
import { useCachedTokenRecovery } from '../../hooks/useCachedTokenRecovery';
import { AdPlacement } from '../../lib/ads';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
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
  /** Posts the rail's cards show, kept out of the grid. */
  excludedPostIds: string[];
  /** The Happening Now rows are on the rail, so the grid drops its card. */
  hasHappeningNow: boolean;
  /** A featured card leads the page, so wide cards stay out of row one. */
  hasTopStory: boolean;
  /**
   * The pinned slot is on screen and not known to be empty, so the grid
   * stands its first ad down.
   */
  isAdVisible: boolean;
};

export const emptyFeedWidgetFeedState: FeedWidgetFeedState = {
  excludedPostIds: [],
  hasHappeningNow: false,
  hasTopStory: false,
  isAdVisible: false,
};

/**
 * Whether the rail renders on this feed: For you and Popular, behind the flag,
 * unless the reader hid it. The page around the rail reads it too, so the
 * shell's own feed tabs step aside wherever the rail brings its own.
 */
export const useFeedWidgetRailState = (
  feedName?: string,
): { isFlagOn: boolean; isEnabled: boolean } => {
  const { flags } = useSettingsContext();
  const isMainFeedPage =
    feedName === SharedFeedPage.MyFeed || feedName === SharedFeedPage.Popular;
  const { value: isFlagOn } = useConditionalFeature({
    feature: featureFeedWidgets,
    shouldEvaluate: isMainFeedPage,
  });
  const isOn = isMainFeedPage && !!isFlagOn;

  return { isFlagOn: isOn, isEnabled: isOn && !flags?.feedWidgetsOptOut };
};

/**
 * Whether our slot sits on the rail: only where it lands on the first screen.
 * Never on a phone (nor before that check settles), not for Plus, and not with
 * fewer columns than its own, where it would sit past the rail's edge.
 * Everywhere else the feed keeps its own first ad. The rail and the feed both
 * read this, so they always agree.
 */
export const useFeedWidgetAdSlot = (): {
  showAd: boolean;
  isSettled: boolean;
  columns: number;
  isPhone: boolean;
} => {
  const { numCards } = useContext(FeedContext);
  const isPhone = useIsPhone();
  const isSettled = useIsPhoneSettled();
  const { isPlus } = usePlusSubscription();
  // `.eco` regardless of the reader's spaciness: the count the grid renders
  // with — see `FeedContainer`.
  const columns = isPhone ? 1 : numCards.eco;

  return {
    showAd: isSettled && !isPhone && !isPlus && columns > FEED_WIDGET_AD_COLUMN,
    isSettled,
    columns,
    isPhone,
  };
};

/**
 * The rail ad's query key, before `useAdQuery` suffixes the consent: a prefix
 * that matches every variant of it.
 */
export const getFeedWidgetAdQueryKey = (
  user: Parameters<typeof generateQueryKey>[1],
): QueryKey => generateQueryKey(RequestKey.Ads, user, 'feed-widgets');

/**
 * The creative for the rail's pinned slot. One per page view, like the hero's.
 * Fetching it logs nothing: the slot logs its impression once it is on screen.
 * The rail and the feed share its query, so both know when it came back empty.
 */
export const useFeedWidgetAd = ({
  enabled,
}: {
  enabled: boolean;
}): { ad?: Ad; isEnabled: boolean; isNoFill: boolean } => {
  const { user, isTokenValid } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const queryKey = getFeedWidgetAdQueryKey(user);
  const isEnabled = enabled && isTokenValid && !isPlus;
  const { data: ad, isFetched } = useAdQuery({
    placement: AdPlacement.Feed,
    queryKey,
    enabled: isEnabled,
    staleTime: StaleTime.OneHour,
  });
  // The ad query suffixes the consent to this key, so it matches as a prefix.
  useCachedTokenRecovery({ queryKey, enabled: isEnabled });

  return {
    ad: ad ?? undefined,
    isEnabled,
    // Answered with nothing (no fill, or an error once retries ran out).
    isNoFill: isEnabled && isFetched && !ad,
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
    () => custom ?? resolveDefaultFeedRail(defaultFlag).widgets,
    [custom, defaultFlag],
  );
};

/**
 * Whether the rail on this feed carries the Shortcuts widget, so the
 * extension's own shortcuts row steps aside only where the rail shows them.
 * `isPending` while the flag or the settings that hold the rail are still on
 * their way, so the row does not paint and then go.
 */
export const useFeedWidgetShortcuts = (
  feedName?: string,
): { hasShortcuts: boolean; isPending: boolean } => {
  const { loadedSettings } = useSettingsContext();
  const { settled } = useFeaturesReadyContext();
  const { isEnabled } = useFeedWidgetRailState(feedName);
  const widgets = useResolvedFeedWidgets({ enabled: isEnabled });
  const isMainFeedPage =
    feedName === SharedFeedPage.MyFeed || feedName === SharedFeedPage.Popular;

  return {
    hasShortcuts:
      isEnabled &&
      widgets.some(({ kind }) => kind === FeedWidgetKind.Shortcuts),
    isPending: isMainFeedPage && (!settled || !loadedSettings),
  };
};

/**
 * What the grid must not repeat, worked out on the feed's side from what is
 * known before the grid paints: the widgets the reader has (their settings,
 * or the default), whether our slot is placed, and the top story's lead, held
 * for the session and painted from the last load's payload. Nothing waits on
 * the rail's own code, so the grid never moves when the rail lands. An empty
 * ad hands the first ad back to the grid once its query answers.
 */
export const useFeedWidgetFeedState = ({
  enabled,
}: {
  enabled: boolean;
}): FeedWidgetFeedState => {
  const widgets = useResolvedFeedWidgets({ enabled });
  const { showAd } = useFeedWidgetAdSlot();
  const { isNoFill } = useFeedWidgetAd({ enabled: enabled && showAd });
  const hasTopStory = widgets.some(
    ({ kind }) => kind === FeedWidgetKind.TopStory,
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
            excludedPostIds: hasTopStory ? shownLeadIds : [],
            hasHappeningNow,
            hasTopStory,
            isAdVisible: showAd && !isNoFill,
          }
        : emptyFeedWidgetFeedState,
    [enabled, hasTopStory, hasHappeningNow, shownLeadIds, showAd, isNoFill],
  );
};

/**
 * The reader's switch for the whole rail. Hiding unmounts the rail, so the
 * feed owns the write and its Undo, and each write merges into the latest
 * flags: a setter from the render that offered the button would write that
 * render's settings back over anything changed since.
 */
export const useFeedWidgetsOptOut = (): {
  isOptedOut: boolean;
  hide: () => void;
} => {
  const { flags, setSettings } = useSettingsContext();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const latest = useRef({ flags, setSettings });
  latest.current = { flags, setSettings };

  const setOptedOut = useCallback(
    (isOptedOut: boolean): Promise<boolean> =>
      latest.current
        .setSettings({
          flags: {
            ...latest.current.flags,
            feedWidgetsOptOut: isOptedOut,
          } as SettingsFlags,
        })
        .then(() => true)
        .catch(() => {
          displayToast('Couldn’t save your widgets. Try again.');
          return false;
        }),
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

  return { isOptedOut: !!flags?.feedWidgetsOptOut, hide };
};

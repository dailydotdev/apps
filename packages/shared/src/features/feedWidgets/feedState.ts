import { useCallback, useMemo, useRef } from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useFeaturesReadyContext } from '../../components/GrowthBookProvider';
import {
  featureFeedWidgets,
  featureFeedWidgetsDefault,
} from '../../lib/featureManagement';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import type { FeedWidget } from './types';
import { FEED_WIDGET_UNDO_MS, FeedWidgetKind } from './types';
import { slottedFeedWidgets } from './slots';
import {
  customFeedWidgets,
  readStoredFeedRail,
  resolveDefaultFeedRail,
} from './storedRail';
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
  /** The Happening Now rows are on the rail, so the grid drops its card. */
  hasHappeningNow: boolean;
  /** A featured card leads the page, so wide cards stay out of row one. */
  hasTopStory: boolean;
};

export const emptyFeedWidgetFeedState: FeedWidgetFeedState = {
  widgets: [],
  excludedPostIds: [],
  hasHappeningNow: false,
  hasTopStory: false,
};

/**
 * Whether this feed takes widgets: For you and Popular, on a laptop's grid,
 * behind the flag, unless the reader hid them.
 */
export const useFeedWidgetRailState = (
  feedName?: string,
): { isFlagOn: boolean; isEnabled: boolean } => {
  const { flags } = useSettingsContext();
  // Below laptop the feed is a list, with no card cells to put a widget in,
  // so phones and tablets are never enrolled in the flag.
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isMainFeedPage =
    feedName === SharedFeedPage.MyFeed || feedName === SharedFeedPage.Popular;
  const { value: isFlagOn } = useConditionalFeature({
    feature: featureFeedWidgets,
    shouldEvaluate: isMainFeedPage && isLaptop,
  });
  const isOn = isLaptop && isMainFeedPage && !!isFlagOn;

  return { isFlagOn: isOn, isEnabled: isOn && !flags?.feedWidgetsOptOut };
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
      slottedFeedWidgets(custom ?? resolveDefaultFeedRail(defaultFlag).widgets),
    [custom, defaultFlag],
  );
};

/**
 * Where shortcuts live on this feed. The extension's row stays above the feed
 * until the reader puts the Shortcuts widget on the rail, so `hasRail` alone
 * never hides it; `hasShortcutsWidget` does. `isPending` while the flag or the
 * settings that hold the rail are still on their way, so the row does not
 * paint and then go.
 */
export const useFeedWidgetShortcuts = (
  feedName?: string,
): { hasRail: boolean; hasShortcutsWidget: boolean; isPending: boolean } => {
  const { loadedSettings } = useSettingsContext();
  const { settled } = useFeaturesReadyContext();
  const { isEnabled } = useFeedWidgetRailState(feedName);
  const widgets = useResolvedFeedWidgets({ enabled: isEnabled });
  const isMainFeedPage =
    feedName === SharedFeedPage.MyFeed || feedName === SharedFeedPage.Popular;

  return {
    hasRail: isEnabled,
    hasShortcutsWidget:
      isEnabled &&
      widgets.some(({ kind }) => kind === FeedWidgetKind.Shortcuts),
    isPending: isMainFeedPage && (!settled || !loadedSettings),
  };
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
            hasTopStory,
          }
        : emptyFeedWidgetFeedState,
    [enabled, widgets, hasTopStory, hasHappeningNow, shownLeadIds],
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

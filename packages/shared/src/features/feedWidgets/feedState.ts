import { useContext, useMemo, useState } from 'react';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureFeedWidgetsDefault } from '../../lib/featureManagement';
import { storageWrapper } from '../../lib/storageWrapper';
import FeedContext from '../../contexts/FeedContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useIsPhone, useIsPhoneSettled } from '../../hooks/useViewSize';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { FEED_WIDGET_AD_COLUMN, FeedWidgetKind } from './types';
import { readStoredFeedRail, resolveDefaultFeedRail } from './storedRail';
import { generateStorageKey, StorageTopic } from '../../lib/storage';

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
  /** The pinned slot is on screen, so the grid stands its first ad down. */
  isAdVisible: boolean;
};

export const emptyFeedWidgetFeedState: FeedWidgetFeedState = {
  excludedPostIds: [],
  hasHappeningNow: false,
  hasTopStory: false,
  isAdVisible: false,
};

const storageKey = (userId?: string): string =>
  generateStorageKey(
    StorageTopic.Settings,
    'feedWidgetFeedState',
    userId ?? 'anonymous',
  );

/**
 * The feed state the rail last settled on, so a returning reader's grid
 * paints in its final shape on the first frame: anything that changes the
 * grid is known before it paints, or it waits for the next load.
 */
export const readCachedFeedWidgetFeedState = (
  userId?: string,
): FeedWidgetFeedState | null => {
  const raw = storageWrapper.getItem(storageKey(userId));
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return {
      excludedPostIds: Array.isArray(parsed.excludedPostIds)
        ? parsed.excludedPostIds.filter(
            (id: unknown): id is string => typeof id === 'string',
          )
        : [],
      hasHappeningNow: parsed.hasHappeningNow === true,
      hasTopStory: parsed.hasTopStory === true,
      isAdVisible: parsed.isAdVisible === true,
    };
  } catch (err) {
    return null;
  }
};

export const writeCachedFeedWidgetFeedState = (
  userId: string | undefined,
  state: FeedWidgetFeedState,
): void => storageWrapper.setItem(storageKey(userId), JSON.stringify(state));

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
 * What the grid must not repeat, worked out on the feed's side from what is
 * known before the grid paints: the widgets the reader has (their settings,
 * or the default), whether our slot is placed, and the lead post the last
 * load settled on, fixed for the session. Nothing waits on the rail's own
 * code or data, so the grid never moves when the rail lands; a reader's own
 * edit is the one thing that changes it mid-session.
 */
export const useFeedWidgetFeedState = ({
  enabled,
}: {
  enabled: boolean;
}): FeedWidgetFeedState => {
  const { user } = useAuthContext();
  const { flags } = useSettingsContext();
  // The stored rail and the default straight from the light reader: the
  // registry, the widgets and their config schemas stay out of the feed's
  // bundle, in the rail's own chunk.
  const saved = useMemo(
    () => readStoredFeedRail(flags?.feedWidgets),
    [flags?.feedWidgets],
  );
  const { value: defaultFlag } = useConditionalFeature({
    feature: featureFeedWidgetsDefault,
    shouldEvaluate: enabled && saved === null,
  });
  const widgets = useMemo(
    () => saved?.widgets ?? resolveDefaultFeedRail(defaultFlag).widgets,
    [saved, defaultFlag],
  );
  const { showAd } = useFeedWidgetAdSlot();
  const [sessionPostId] = useState(
    () => readCachedFeedWidgetFeedState(user?.id)?.excludedPostIds[0],
  );
  const hasTopStory = widgets.some(
    ({ kind }) => kind === FeedWidgetKind.TopStory,
  );
  const hasHappeningNow = widgets.some(
    ({ kind }) => kind === FeedWidgetKind.HappeningNow,
  );

  return useMemo(
    () =>
      enabled
        ? {
            excludedPostIds:
              hasTopStory && sessionPostId ? [sessionPostId] : [],
            hasHappeningNow,
            hasTopStory,
            isAdVisible: showAd,
          }
        : emptyFeedWidgetFeedState,
    [enabled, hasTopStory, hasHappeningNow, sessionPostId, showAd],
  );
};

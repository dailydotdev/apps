import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useMessagesEnabled } from '../messages/hooks/useMessagesEnabled';
import { useLiveChatEnabled } from '../liveChat/hooks/useLiveChatEnabled';
import type { FeedWidgetAvailability } from './registry';
import { availableFeedWidgets } from './components';
import type { FeedWidget } from './types';

/** What this reader's account and settings allow, as the gallery reads it. */
export const useFeedWidgetAvailability = (): FeedWidgetAvailability => {
  const { user, squads } = useAuthContext();
  const { loadedSettings, optOutReadingStreak } = useSettingsContext();
  const { isEnabled: hasMessages } = useMessagesEnabled();
  const { isEnabled: hasLiveChat } = useLiveChatEnabled();
  const isLoggedIn = !!user;
  const hasSquads = !!squads?.length;
  const isReadingStreakOn = !(loadedSettings && optOutReadingStreak);

  return useMemo(
    () => ({
      isLoggedIn,
      hasSquads,
      isReadingStreakOn,
      hasMessages,
      hasLiveChat,
    }),
    [isLoggedIn, hasSquads, isReadingStreakOn, hasMessages, hasLiveChat],
  );
};

/**
 * The widgets of a rail this reader could have added themselves: the ones
 * the gallery offers them, none it would show disabled. The default rail
 * goes through this, so a logged-out reader or one who turned streaks off
 * never gets a Streak tile they can only read an excuse from.
 */
export const usableFeedWidgets = (
  widgets: FeedWidget[],
  availability: FeedWidgetAvailability,
): FeedWidget[] => {
  const usable = new Set(
    availableFeedWidgets(availability)
      .filter((definition) => !definition.disabledReason?.(availability))
      .map(({ kind }) => kind),
  );
  return widgets.filter(({ kind }) => usable.has(kind));
};

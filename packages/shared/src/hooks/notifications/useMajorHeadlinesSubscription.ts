import { useCallback } from 'react';
import type {
  HighlightSignificance,
  ChannelConfiguration,
} from '../../graphql/highlights';
import { useChannelHighlightPreferences } from './useChannelHighlightPreferences';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, NotificationPromptSource } from '../../lib/log';

type MajorHeadlinesOrigin = 'settings' | 'highlights_page' | 'feed_card';

type UseMajorHeadlinesSubscriptionResult = {
  channels: ChannelConfiguration[];
  isAnyChannelSubscribed: boolean;
  isChannelSubscribed: (channel: string) => boolean;
  getMinSignificance: (
    channel: string,
  ) => HighlightSignificance | null | undefined;
  isPushEnabled: boolean;
  isLoading: boolean;
  isPending: boolean;
  subscribeChannel: (
    channel: string,
    minSignificance: HighlightSignificance,
    origin: MajorHeadlinesOrigin,
  ) => Promise<void>;
  unsubscribeChannel: (
    channel: string,
    origin: MajorHeadlinesOrigin,
  ) => Promise<void>;
  subscribeAll: (
    minSignificance: HighlightSignificance,
    origin: MajorHeadlinesOrigin,
  ) => Promise<void>;
};

const ORIGIN_TO_PROMPT_SOURCE: Record<
  MajorHeadlinesOrigin,
  NotificationPromptSource
> = {
  settings: NotificationPromptSource.MajorHeadlinesSettings,
  highlights_page: NotificationPromptSource.MajorHeadlinesPage,
  feed_card: NotificationPromptSource.MajorHeadlinesCard,
};

export const useMajorHeadlinesSubscription =
  (): UseMajorHeadlinesSubscriptionResult => {
    const { user } = useAuthContext();
    const { logEvent } = useLogContext();
    const { isSubscribed: isPushEnabled } = usePushNotificationContext();
    const { onEnablePush } = usePushNotificationMutation();
    const {
      channels,
      isLoading,
      isPending,
      getMinSignificance,
      isChannelSubscribed,
      isAnyChannelSubscribed,
      setChannelPreference,
      subscribeAll: subscribeAllChannels,
    } = useChannelHighlightPreferences();

    const subscribeChannel = useCallback(
      async (
        channel: string,
        minSignificance: HighlightSignificance,
        origin: MajorHeadlinesOrigin,
      ) => {
        if (!user) {
          return;
        }

        await onEnablePush(ORIGIN_TO_PROMPT_SOURCE[origin]);

        await setChannelPreference(channel, minSignificance);

        logEvent({
          event_name: LogEvent.EnableMajorHeadlinesAlerts,
          extra: JSON.stringify({ origin, channel, minSignificance }),
        });
      },
      [user, onEnablePush, setChannelPreference, logEvent],
    );

    const unsubscribeChannel = useCallback(
      async (channel: string, origin: MajorHeadlinesOrigin) => {
        if (!user) {
          return;
        }

        await setChannelPreference(channel, null);

        logEvent({
          event_name: LogEvent.DisableMajorHeadlinesAlerts,
          extra: JSON.stringify({ origin, channel }),
        });
      },
      [user, setChannelPreference, logEvent],
    );

    const subscribeAll = useCallback(
      async (
        minSignificance: HighlightSignificance,
        origin: MajorHeadlinesOrigin,
      ) => {
        if (!user) {
          return;
        }

        await onEnablePush(ORIGIN_TO_PROMPT_SOURCE[origin]);

        await subscribeAllChannels(minSignificance);

        logEvent({
          event_name: LogEvent.EnableMajorHeadlinesAlerts,
          extra: JSON.stringify({ origin, scope: 'all', minSignificance }),
        });
      },
      [user, onEnablePush, subscribeAllChannels, logEvent],
    );

    return {
      channels,
      isAnyChannelSubscribed,
      isChannelSubscribed,
      getMinSignificance,
      isPushEnabled,
      isLoading,
      isPending,
      subscribeChannel,
      unsubscribeChannel,
      subscribeAll,
    };
  };

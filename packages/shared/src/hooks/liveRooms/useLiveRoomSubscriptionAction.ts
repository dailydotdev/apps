import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LiveRoom } from '../../graphql/liveRooms';
import { LiveRoomStatus } from '../../graphql/liveRooms';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import { useToastNotification } from '../useToastNotification';
import { useLiveRoomSubscription } from './useLiveRoomSubscription';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { usePushNotificationMutation } from '../notifications/usePushNotificationMutation';
import { useLogContext } from '../../contexts/LogContext';
import { buildStandupAnalyticsExtra } from '../../lib/liveRoom/analytics';

type BuildLiveRoomSubscriptionExtra = (
  extra: Record<string, unknown>,
) => string | undefined;

type LiveRoomSubscriptionActionRoom = Pick<
  LiveRoom,
  'id' | 'status' | 'scheduledStart' | 'subscribed'
> &
  Partial<Pick<LiveRoom, 'mode'>>;

interface UseLiveRoomSubscriptionActionProps {
  room?: LiveRoomSubscriptionActionRoom | null;
  roomId?: string;
  hostUserId?: string;
  surface: string;
  buildExtra?: BuildLiveRoomSubscriptionExtra;
}

export const useLiveRoomSubscriptionAction = ({
  room,
  roomId,
  hostUserId,
  surface,
  buildExtra,
}: UseLiveRoomSubscriptionActionProps) => {
  const resolvedRoomId = room?.id ?? roomId ?? '';
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { showLogin, user } = useAuthContext();
  const { isPushSupported, isSubscribed: isPushEnabled } =
    usePushNotificationContext();
  const { onEnablePush } = usePushNotificationMutation();
  const { subscribe, unsubscribe } = useLiveRoomSubscription(resolvedRoomId);
  const [subscribed, setSubscribed] = useState(room?.subscribed ?? false);

  useEffect(() => {
    setSubscribed(room?.subscribed ?? false);
  }, [room?.id, room?.subscribed]);

  const buildEventExtra = useMemo<BuildLiveRoomSubscriptionExtra>(() => {
    if (buildExtra) {
      return buildExtra;
    }

    return (extra) =>
      buildStandupAnalyticsExtra(
        {
          roomId: resolvedRoomId,
          authKind: user ? 'authenticated' : 'anonymous',
          roomStatus: room?.status ?? null,
          roomMode: room?.mode ?? null,
        },
        extra,
      );
  }, [buildExtra, resolvedRoomId, room?.mode, room?.status, user]);

  const subscriptionBusy = subscribe.isPending || unsubscribe.isPending;
  const canToggleSubscription =
    room?.status === LiveRoomStatus.Created &&
    !!room.scheduledStart &&
    (!user || !hostUserId || user.id !== hostUserId);

  const toggleSubscription = useCallback(
    async (event?: MouseEvent<HTMLButtonElement>): Promise<void> => {
      event?.preventDefault();
      event?.stopPropagation();

      if (!user) {
        showLogin({ trigger: AuthTriggers.MainButton });
        return;
      }

      try {
        if (!room || !room.scheduledStart) {
          throw new Error(
            'Live room subscription requires a scheduled upcoming room',
          );
        }

        if (room.status !== LiveRoomStatus.Created) {
          throw new Error(
            'Live room subscription is only available before start',
          );
        }

        if (subscribed) {
          await unsubscribe.mutateAsync();
          setSubscribed(false);
          logEvent({
            event_name: LogEvent.UnsubscribeStandup,
            target_id: room.id,
            extra: buildEventExtra({ surface }),
          });
          displayToast('Lobby reminder removed');
          return;
        }

        await subscribe.mutateAsync();
        setSubscribed(true);

        const shouldRequestPush = isPushSupported && !isPushEnabled;
        let pushEnabled = isPushEnabled;
        if (shouldRequestPush) {
          pushEnabled = await onEnablePush(
            NotificationPromptSource.StandupLobby,
          );
        }

        logEvent({
          event_name: LogEvent.SubscribeStandup,
          target_id: room.id,
          extra: buildEventExtra({
            surface,
            pushEnabled,
            pushPermissionRequested: shouldRequestPush,
          }),
        });
        displayToast(
          pushEnabled
            ? "We'll notify you when the standup goes live"
            : 'Reminder saved. Enable browser notifications to get a push.',
        );
      } catch (error) {
        displayToast(error instanceof Error ? error.message : 'Action failed');
      }
    },
    [
      buildEventExtra,
      displayToast,
      isPushEnabled,
      isPushSupported,
      logEvent,
      onEnablePush,
      room,
      showLogin,
      subscribe,
      subscribed,
      surface,
      unsubscribe,
      user,
    ],
  );

  return {
    canToggleSubscription,
    subscribed,
    subscriptionBusy,
    toggleSubscription,
  };
};

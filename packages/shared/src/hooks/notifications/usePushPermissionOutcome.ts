import { useCallback } from 'react';
import {
  nativePushSubscribeTimeoutMs,
  usePushNotificationContext,
} from '../../contexts/PushNotificationContext';
import { isIOSNative } from '../../lib/func';
import type { NotificationPromptSource } from '../../lib/log';
import { usePushNotificationMutation } from './usePushNotificationMutation';

/** How a push ask ended. */
export type PushPermissionOutcome = 'granted' | 'denied' | 'dismissed';

/** Web only: the iOS app asks through its own bridge and has no Notification. */
const getWebPermission = (): NotificationPermission | undefined =>
  isIOSNative() ? undefined : globalThis.Notification?.permission;

/** Reads a refusal from `onEnablePush`'s boolean answer. */
export const getPushPermissionOutcome = (
  isGranted: boolean,
): PushPermissionOutcome => {
  if (isGranted) {
    return 'granted';
  }

  // iOS has no way to close its alert without an answer.
  return isIOSNative() || getWebPermission() === 'denied'
    ? 'denied'
    : 'dismissed';
};

// `onEnablePush` answers one boolean for every refusal, and opens the enable
// popup instead of asking when the browser already blocks notifications, so
// the answer is read from the permission around it.
export const usePushPermissionOutcome = (source: NotificationPromptSource) => {
  const { isSubscribed } = usePushNotificationContext();
  const { onEnablePush } = usePushNotificationMutation();

  /** Notifications are refused on this device: no prompt would show. */
  const isBlocked = useCallback(() => getWebPermission() === 'denied', []);

  const requestPush = useCallback(async (): Promise<PushPermissionOutcome> => {
    if (isSubscribed) {
      return 'granted';
    }

    if (isBlocked()) {
      return 'denied';
    }

    const askedAt = Date.now();
    const isGranted = await onEnablePush(source);
    // The iOS bridge stops waiting for an answer, which is not a block.
    if (
      !isGranted &&
      isIOSNative() &&
      Date.now() - askedAt >= nativePushSubscribeTimeoutMs
    ) {
      return 'dismissed';
    }

    return getPushPermissionOutcome(isGranted);
  }, [isBlocked, isSubscribed, onEnablePush, source]);

  return { isBlocked, requestPush };
};

import { useCallback, useEffect, useState } from 'react';
import usePersistentContext from '../usePersistentContext';
import {
  NotificationCtaKind,
  NotificationPromptSource,
  TargetType,
} from '../../lib/log';
import type { NotificationCtaPlacement } from '../../lib/log';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { checkIsExtension } from '../../lib/func';
import { useNotificationCtaExperiment } from './useNotificationCtaExperiment';
import {
  useNotificationCtaAnalytics,
  useNotificationCtaImpression,
} from './useNotificationCtaAnalytics';

export const DISMISS_PERMISSION_BANNER = 'DISMISS_PERMISSION_BANNER';
export const FORCE_UPVOTE_NOTIFICATION_CTA_SESSION_KEY =
  'force_upvote_notification_cta';

const isTruthySessionFlag = (value: string | null): boolean =>
  value === '1' || value === 'true' || value === 'yes';

interface UseEnableNotificationProps {
  source: NotificationPromptSource;
  placement?: NotificationCtaPlacement;
  ignoreDismissState?: boolean;
  onEnableAction?: () => Promise<unknown> | unknown;
}

interface UseEnableNotification {
  acceptedJustNow: boolean;
  shouldShowCta: boolean;
  onDismiss: () => void;
  onEnable: () => Promise<boolean>;
}

export const useEnableNotification = ({
  source = NotificationPromptSource.NotificationsPage,
  placement,
  ignoreDismissState = false,
  onEnableAction,
}: UseEnableNotificationProps): UseEnableNotification => {
  const { isEnabled: isNotificationCtaExperimentEnabled, isPreviewActive } =
    useNotificationCtaExperiment();
  const isCommentUpvoteSource =
    source === NotificationPromptSource.CommentUpvote;
  const isExtension = checkIsExtension();
  const { logClick, logDismiss } = useNotificationCtaAnalytics();
  const { isInitialized, isPushSupported, isSubscribed, shouldOpenPopup } =
    usePushNotificationContext();
  const [hasCompletedEnableAction, setHasCompletedEnableAction] = useState(
    !onEnableAction,
  );
  const runEnableAction = useCallback(async (): Promise<boolean> => {
    if (!onEnableAction) {
      setHasCompletedEnableAction(true);
      return true;
    }

    try {
      await Promise.resolve(onEnableAction());
      setHasCompletedEnableAction(true);
      return true;
    } catch {
      setHasCompletedEnableAction(false);
      return false;
    }
  }, [onEnableAction]);
  const {
    hasPermissionCache,
    acceptedJustNow: acceptedPushJustNow,
    onEnablePush,
  } = usePushNotificationMutation({
    onPopupGranted: () => {
      runEnableAction().catch(() => null);
    },
  });
  const forceUpvoteNotificationCtaFromSession = isTruthySessionFlag(
    globalThis?.sessionStorage?.getItem(
      FORCE_UPVOTE_NOTIFICATION_CTA_SESSION_KEY,
    ) ?? null,
  );
  const shouldForceUpvoteNotificationCtaForSession =
    source === NotificationPromptSource.CommentUpvote &&
    forceUpvoteNotificationCtaFromSession;
  const [isDismissed, setIsDismissed, isLoaded] = usePersistentContext(
    DISMISS_PERMISSION_BANNER,
    false,
  );
  const shouldIgnoreDismissStateForSource =
    source === NotificationPromptSource.PostTagFollow ||
    source === NotificationPromptSource.NewComment ||
    source === NotificationPromptSource.CommentUpvote ||
    source === NotificationPromptSource.SquadPage;
  const effectiveIsDismissed =
    ignoreDismissState ||
    shouldIgnoreDismissStateForSource ||
    shouldForceUpvoteNotificationCtaForSession ||
    isPreviewActive
      ? false
      : isDismissed;
  useEffect(() => {
    setHasCompletedEnableAction(!onEnableAction);
  }, [onEnableAction]);

  const acceptedJustNow = acceptedPushJustNow && hasCompletedEnableAction;

  const onDismiss = useCallback(() => {
    logDismiss({
      kind: NotificationCtaKind.PushCta,
      targetType: TargetType.EnableNotifications,
      source,
      placement,
    });
    setIsDismissed(true);
  }, [logDismiss, placement, setIsDismissed, source]);

  const onEnable = useCallback(async () => {
    logClick({
      kind: NotificationCtaKind.PushCta,
      targetType: TargetType.EnableNotifications,
      source,
      placement,
    });
    const isEnabled = await onEnablePush(source);

    if (!isEnabled) {
      return false;
    }

    return runEnableAction();
  }, [logClick, onEnablePush, placement, runEnableAction, source]);

  const isRolloutOnlySource =
    source === NotificationPromptSource.CommentUpvote ||
    source === NotificationPromptSource.PostTagFollow;
  const subscribed = isSubscribed || (shouldOpenPopup() && hasPermissionCache);
  const enabledJustNow = subscribed && acceptedJustNow;
  const shouldRequireNotSubscribed =
    source !== NotificationPromptSource.CommentUpvote &&
    !isPreviewActive &&
    !shouldForceUpvoteNotificationCtaForSession;

  const conditions = [
    isLoaded || isPreviewActive,
    shouldRequireNotSubscribed ? !subscribed : true,
    isInitialized,
    isPushSupported || isExtension,
  ];

  const computeShouldShowCta = (): boolean => {
    if (isPreviewActive) {
      return true;
    }

    if (isCommentUpvoteSource) {
      return !effectiveIsDismissed;
    }

    return (
      (conditions.every(Boolean) ||
        (enabledJustNow &&
          source !== NotificationPromptSource.SquadPostModal)) &&
      !effectiveIsDismissed
    );
  };

  const shouldShowCta =
    !isRolloutOnlySource || isNotificationCtaExperimentEnabled
      ? computeShouldShowCta()
      : false;

  useNotificationCtaImpression(
    {
      kind: NotificationCtaKind.PushCta,
      targetType: TargetType.EnableNotifications,
      source,
      placement,
    },
    shouldShowCta,
  );

  return {
    acceptedJustNow,
    shouldShowCta,
    onDismiss,
    onEnable,
  };
};

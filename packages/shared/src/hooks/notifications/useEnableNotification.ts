import { useCallback, useEffect, useRef, useState } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import usePersistentContext from '../usePersistentContext';
import { LogEvent, NotificationPromptSource, TargetType } from '../../lib/log';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { checkIsExtension } from '../../lib/func';
import { useNotificationCtaExperiment } from './useNotificationCtaExperiment';

export const DISMISS_PERMISSION_BANNER = 'DISMISS_PERMISSION_BANNER';
export const FORCE_UPVOTE_NOTIFICATION_CTA_SESSION_KEY =
  'force_upvote_notification_cta';

const isTruthySessionFlag = (value: string | null): boolean =>
  value === '1' || value === 'true' || value === 'yes';

interface UseEnableNotificationProps {
  source: NotificationPromptSource;
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
  ignoreDismissState = false,
  onEnableAction,
}: UseEnableNotificationProps): UseEnableNotification => {
  const { isEnabled: isNotificationCtaExperimentEnabled, isPreviewActive } =
    useNotificationCtaExperiment();
  const isCommentUpvoteSource =
    source === NotificationPromptSource.CommentUpvote;
  const isExtension = checkIsExtension();
  const { logEvent } = useLogContext();
  const hasLoggedImpression = useRef(false);
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
    logEvent({
      event_name: LogEvent.ClickNotificationDismiss,
      extra: JSON.stringify({ origin: source }),
    });
    setIsDismissed(true);
  }, [source, logEvent, setIsDismissed]);

  const onEnable = useCallback(async () => {
    const isEnabled = await onEnablePush(source);

    if (!isEnabled) {
      return false;
    }

    return runEnableAction();
  }, [source, onEnablePush, runEnableAction]);

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

  useEffect(() => {
    if (!shouldShowCta || hasLoggedImpression.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.EnableNotifications,
      extra: JSON.stringify({ origin: source }),
    });
    hasLoggedImpression.current = true;
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowCta]);

  return {
    acceptedJustNow,
    shouldShowCta,
    onDismiss,
    onEnable,
  };
};

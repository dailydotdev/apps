import { useCallback, useEffect, useRef } from 'react';
import { useLogContext } from '../../contexts/LogContext';
import usePersistentContext from '../usePersistentContext';
import { LogEvent, NotificationPromptSource, TargetType } from '../../lib/log';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { checkIsExtension } from '../../lib/func';
import { isDevelopment } from '../../lib/constants';

export const DISMISS_PERMISSION_BANNER = 'DISMISS_PERMISSION_BANNER';
export const FORCE_UPVOTE_NOTIFICATION_CTA_SESSION_KEY =
  'force_upvote_notification_cta';

const isTruthySessionFlag = (value: string | null): boolean =>
  value === '1' || value === 'true' || value === 'yes';

interface UseEnableNotificationProps {
  source: NotificationPromptSource;
  ignoreDismissState?: boolean;
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
}: UseEnableNotificationProps): UseEnableNotification => {
  const isCommentUpvoteSource =
    source === NotificationPromptSource.CommentUpvote;
  const isExtension = checkIsExtension();
  const { logEvent } = useLogContext();
  const hasLoggedImpression = useRef(false);
  const { isInitialized, isPushSupported, isSubscribed, shouldOpenPopup } =
    usePushNotificationContext();
  const { hasPermissionCache, acceptedJustNow, onEnablePush } =
    usePushNotificationMutation();
  const forceUpvoteNotificationCtaFromUrl =
    globalThis?.location?.search?.includes('forceUpvoteNotificationCta=1') ??
    false;
  const forceNotificationCtaFromUrl =
    globalThis?.location?.search?.includes('forceNotificationCta=1') ?? false;
  const forcePopupNotificationCtaFromUrl =
    globalThis?.location?.search?.includes('forcePopupNotificationCta=1') ??
    false;
  const forceSideMenuPromptFromUrl =
    globalThis?.location?.search?.includes('forceSideMenuPrompt=1') ?? false;
  const forceInFeedHeroFromUrl =
    globalThis?.location?.search?.includes('forceInFeedHero=1') ?? false;
  const forceBottomHeroFromUrl =
    globalThis?.location?.search?.includes('forceBottomHero=1') ?? false;
  const forceTopHeroFromUrl =
    globalThis?.location?.search?.includes('forceTopHero=1') ?? false;
  const forceSquadNotificationCtaFromUrl =
    globalThis?.location?.search?.includes('forceSquadNotificationCta=1') ??
    false;
  const forceUpvoteNotificationCtaFromSession = isTruthySessionFlag(
    globalThis?.sessionStorage?.getItem(
      FORCE_UPVOTE_NOTIFICATION_CTA_SESSION_KEY,
    ) ?? null,
  );
  const shouldForceUpvoteNotificationCtaForSession =
    source === NotificationPromptSource.CommentUpvote &&
    (forceUpvoteNotificationCtaFromSession ||
      forceUpvoteNotificationCtaFromUrl);
  const shouldForceSquadNotificationCta =
    source === NotificationPromptSource.SquadPage &&
    forceSquadNotificationCtaFromUrl;
  const shouldForcePopupNotificationCta =
    forcePopupNotificationCtaFromUrl || forceNotificationCtaFromUrl;
  const shouldHideNotificationCtaForBottomHero =
    (forceBottomHeroFromUrl ||
      forceInFeedHeroFromUrl ||
      forceTopHeroFromUrl ||
      forceSideMenuPromptFromUrl) &&
    source === NotificationPromptSource.NotificationsPage &&
    !shouldForcePopupNotificationCta;
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
    shouldForceSquadNotificationCta ||
    shouldForcePopupNotificationCta
      ? false
      : isDismissed;
  const onDismiss = useCallback(() => {
    logEvent({
      event_name: LogEvent.ClickNotificationDismiss,
      extra: JSON.stringify({ origin: source }),
    });
    setIsDismissed(true);
  }, [source, logEvent, setIsDismissed]);

  const onEnable = useCallback(
    () => onEnablePush(source),
    [source, onEnablePush],
  );

  const shouldForceCtaInDevelopment =
    isDevelopment &&
    (source === NotificationPromptSource.NotificationsPage ||
      source === NotificationPromptSource.SquadPage ||
      source === NotificationPromptSource.SourceSubscribe);
  const subscribed = shouldForceCtaInDevelopment
    ? false
    : isSubscribed || (shouldOpenPopup() && hasPermissionCache);
  const enabledJustNow = subscribed && acceptedJustNow;
  const shouldRequireNotSubscribed =
    source !== NotificationPromptSource.PostTagFollow &&
    source !== NotificationPromptSource.NewComment &&
    !shouldForceUpvoteNotificationCtaForSession;

  const conditions = [
    isLoaded,
    shouldRequireNotSubscribed ? !subscribed : true,
    isInitialized,
    isPushSupported || isExtension,
  ];

  const computeShouldShowCta = (): boolean => {
    if (shouldForceCtaInDevelopment) {
      return (
        (shouldForcePopupNotificationCta || isLoaded) && !effectiveIsDismissed
      );
    }

    if (isCommentUpvoteSource) {
      return !effectiveIsDismissed;
    }

    return (
      (shouldForceSquadNotificationCta ||
        conditions.every(Boolean) ||
        (enabledJustNow &&
          source !== NotificationPromptSource.SquadPostModal)) &&
      !effectiveIsDismissed
    );
  };

  const shouldShowCta =
    computeShouldShowCta() && !shouldHideNotificationCtaForBottomHero;

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

import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import {
  cloudinaryNotificationsBrowser,
  cloudinaryNotificationsBrowserEnabled,
} from '../../lib/image';
import { VIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../../hooks/useActions';
import { ActionType } from '../../graphql/actions';
import { useMajorHeadlinesSubscription } from '../../hooks/notifications/useMajorHeadlinesSubscription';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureMajorHeadlinesPush } from '../../lib/featureManagement';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent } from '../../lib/log';
import { useToastNotification } from '../../hooks/useToastNotification';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';

interface EnableHighlightsAlertsProps {
  className?: string;
}

const ORIGIN = 'highlights_page';
const NOTIFICATION_SETTINGS_PATH = '/settings/notifications';

export const EnableHighlightsAlerts = ({
  className,
}: EnableHighlightsAlertsProps): ReactElement | null => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isSubscribed: isPushEnabled } = usePushNotificationContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { isSubscribed, isLoading, subscribe } =
    useMajorHeadlinesSubscription();
  const [isPending, setIsPending] = useState(false);
  const [acceptedJustNow, setAcceptedJustNow] = useState(false);

  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featureMajorHeadlinesPush,
    shouldEvaluate: !!user,
  });

  const isDismissed = checkHasCompleted(
    ActionType.DismissedMajorHeadlinesAlertsBanner,
  );

  const shouldRender =
    isFeatureEnabled &&
    !!user &&
    isActionsFetched &&
    !isSubscribed &&
    !isDismissed;

  useLogEventOnce(
    () => ({
      event_name: LogEvent.ImpressionMajorHeadlinesAlertsBanner,
      extra: JSON.stringify({ origin: ORIGIN }),
    }),
    { condition: shouldRender },
  );

  const handleEnable = useCallback(async () => {
    if (isPending || isLoading) {
      return;
    }
    setIsPending(true);
    try {
      await subscribe(ORIGIN);
      if (isPushEnabled) {
        setAcceptedJustNow(true);
        return;
      }
      displayToast("You'll be the first to know when news breaks.", {
        action: {
          copy: 'Settings',
          onClick: () => router.push(NOTIFICATION_SETTINGS_PATH),
        },
      });
    } finally {
      setIsPending(false);
    }
  }, [isPending, isLoading, subscribe, isPushEnabled, displayToast, router]);

  const handleDismiss = useCallback(() => {
    completeAction(ActionType.DismissedMajorHeadlinesAlertsBanner);
    logEvent({
      event_name: LogEvent.DismissMajorHeadlinesAlertsBanner,
      extra: JSON.stringify({ origin: ORIGIN }),
    });
  }, [completeAction, logEvent]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={classNames(
        'relative w-full overflow-hidden border-accent-cabbage-default bg-surface-float px-6 py-4 typo-callout',
        className,
      )}
    >
      <span className="flex flex-row font-bold">
        {acceptedJustNow && <VIcon className="mr-2" />}
        {`Push notifications${acceptedJustNow ? ' successfully enabled' : ''}`}
      </span>
      <div className="mt-2 flex justify-between gap-2">
        <p className="w-full text-text-tertiary tablet:w-3/5">
          {acceptedJustNow ? (
            <>
              You can change your{' '}
              <button
                type="button"
                className="underline hover:no-underline"
                onClick={() => router.push(NOTIFICATION_SETTINGS_PATH)}
              >
                notification settings
              </button>{' '}
              anytime.
            </>
          ) : (
            'Be the first to know when something major happens in the developer world.'
          )}
        </p>
        <img
          className={classNames(
            'absolute -bottom-2 hidden w-[7.5rem] tablet:flex',
            acceptedJustNow ? 'right-14' : 'right-4',
          )}
          src={
            acceptedJustNow
              ? cloudinaryNotificationsBrowserEnabled
              : cloudinaryNotificationsBrowser
          }
          alt="A sample browser notification"
        />
      </div>
      <div className="mt-4 flex items-center justify-start">
        {!acceptedJustNow && (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            color={ButtonColor.Cabbage}
            className="mr-4"
            onClick={handleEnable}
            disabled={isPending || isLoading}
          >
            Enable notifications
          </Button>
        )}
      </div>
      <CloseButton
        type="button"
        size={ButtonSize.XSmall}
        className="absolute right-1 top-1 laptop:right-3 laptop:top-3"
        onClick={handleDismiss}
        aria-label="Dismiss"
      />
    </div>
  );
};

export default EnableHighlightsAlerts;

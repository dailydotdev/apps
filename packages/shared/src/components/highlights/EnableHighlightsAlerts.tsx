import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { BellIcon } from '../icons';
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

interface EnableHighlightsAlertsProps {
  className?: string;
}

const ORIGIN = 'highlights_page';

export const EnableHighlightsAlerts = ({
  className,
}: EnableHighlightsAlertsProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { isSubscribed, subscribe } = useMajorHeadlinesSubscription();

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
    await subscribe(ORIGIN);
    displayToast("You'll be the first to know when news breaks.");
  }, [subscribe, displayToast]);

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
        'mx-3 mb-3 mt-2 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3 laptop:mx-4',
        className,
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-text-primary">
        <BellIcon />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Callout} bold>
          Get real-time alerts when news breaks
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Be the first to know when major headlines drop.
        </Typography>
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        onClick={handleEnable}
      >
        Turn on alerts
      </Button>
      <CloseButton
        type="button"
        size={ButtonSize.Small}
        onClick={handleDismiss}
        aria-label="Dismiss"
      />
    </div>
  );
};

export default EnableHighlightsAlerts;

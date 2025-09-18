import React, { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { JobIcon } from '../../../components/icons';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { briefButtonBg } from '../../../styles/custom';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { opportunityUrl } from '../../../lib/constants';
import Link from '../../../components/utilities/Link';
import { useActions, useViewSize, ViewSize } from '../../../hooks';
import { useAlertsContext } from '../../../contexts/AlertContext';
import { ActionType } from '../../../graphql/actions';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

type JobOpportunityButtonProps = {
  className?: string;
};

export const JobOpportunityButton = ({
  className,
}: JobOpportunityButtonProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { alerts } = useAlertsContext();
  const { checkHasCompleted } = useActions();
  const { logEvent } = useLogContext();
  const logRef = useRef<typeof logEvent>();
  const hasLoggedRef = useRef(false);
  logRef.current = logEvent;

  const { opportunityId } = alerts;

  const hasSeenWelcomePage = checkHasCompleted(
    ActionType.OpportunityWelcomePage,
  );

  const href = hasSeenWelcomePage
    ? `${opportunityUrl}/${opportunityId}`
    : `${opportunityUrl}/welcome`;

  const logExtraPayload = JSON.stringify({
    count: 1, // always 1 for now
    onboarding: !hasSeenWelcomePage,
  });

  const handleClick = (): void => {
    logRef.current({
      event_name: LogEvent.ClickOpportunityNudge,
      extra: logExtraPayload,
    });
  };

  useEffect(() => {
    if (hasLoggedRef.current) {
      return;
    }

    logRef.current({
      event_name: LogEvent.ImpressionOpportunityNudge,
      extra: logExtraPayload,
    });
    hasLoggedRef.current = true;
  }, [logExtraPayload]);

  return (
    <Tooltip
      content="A personalized job opportunity was matched to your profile. Click to review it privately"
      className="!max-w-80 text-center"
    >
      <Link href={href} passHref>
        <Button
          tag="a"
          icon={<JobIcon />}
          variant={ButtonVariant.Float}
          size={isMobile ? ButtonSize.Small : ButtonSize.Medium}
          style={{
            background: briefButtonBg,
          }}
          className={classNames(className, 'border-none text-black')}
          onClick={handleClick}
        >
          One opportunity is waiting for you here
        </Button>
      </Link>
    </Tooltip>
  );
};

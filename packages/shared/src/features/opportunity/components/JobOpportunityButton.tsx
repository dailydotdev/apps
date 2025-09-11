import type { ReactElement } from 'react';
import React from 'react';
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

type JobOpportunityButtonProps = {
  className?: string;
};

export const JobOpportunityButton = ({
  className,
}: JobOpportunityButtonProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const { alerts } = useAlertsContext();
  const { checkHasCompleted } = useActions();

  const { opportunityId } = alerts;

  const href = checkHasCompleted(ActionType.OpportunityWelcomePage)
    ? `${opportunityUrl}/${opportunityId}`
    : `${opportunityUrl}/welcome`;

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
        >
          One opportunity is waiting for you here
        </Button>
      </Link>
    </Tooltip>
  );
};

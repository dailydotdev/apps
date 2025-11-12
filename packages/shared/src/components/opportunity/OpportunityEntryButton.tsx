import React from 'react';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import { Button } from '../buttons/Button';
import { ButtonIconPosition, ButtonVariant } from '../buttons/common';
import { JobIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { Bubble } from '../tooltips/utils';
import { useAlertsContext } from '../../contexts/AlertContext';

export const OpportunityEntryButton = () => {
  const { alerts } = useAlertsContext();
  const hasOpportunityAlert = !!alerts.opportunityId;
  return (
    <Tooltip side="bottom" content="Jobs">
      <Link href={`${webappUrl}notifications`} passHref>
        <Button
          variant={ButtonVariant.Float}
          className="relative w-10 justify-center"
          tag="a"
          iconPosition={ButtonIconPosition.Top}
          icon={<JobIcon />}
        >
          {hasOpportunityAlert && (
            <Bubble className="-right-1.5 -top-1.5 cursor-pointer !rounded-full !bg-accent-bacon-default px-1">
              1
            </Bubble>
          )}
        </Button>
      </Link>
    </Tooltip>
  );
};

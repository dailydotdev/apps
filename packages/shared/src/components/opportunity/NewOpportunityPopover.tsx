import type { ReactElement } from 'react';
import React from 'react';
import { ArrowIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { FlexCol } from '../utilities';
import { useAlertsContext } from '../../contexts/AlertContext';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import { TargetId } from '../../lib/log';
import { useLogOpportunityNudgeClick } from '../../hooks/log/useLogOpportunityNudgeClick';
import { useLogOpportunityNudgeImpression } from '../../hooks/log/useLogOpportunityNudgeImpression';

export const NewOpportunityPopover = (): ReactElement => {
  const { user } = useAuthContext();
  const { alerts } = useAlertsContext();
  const logOpportunityNudgeClick = useLogOpportunityNudgeClick(
    TargetId.Popover,
  );
  useLogOpportunityNudgeImpression(TargetId.Popover);

  return (
    <FlexCol className="w-80 gap-2">
      <div className="flex flex-row-reverse items-center justify-end gap-2 px-1 pt-1 laptop:flex-row laptop:justify-between">
        <Typography
          type={TypographyType.Body}
          bold
          color={TypographyColor.Primary}
        >
          Your next big move is here!
        </Typography>
        <Link href={`${webappUrl}opportunity/${alerts.opportunityId}`} passHref>
          <Button
            size={ButtonSize.XSmall}
            onClick={logOpportunityNudgeClick}
            icon={
              <ArrowIcon className="-rotate-90 text-text-secondary laptop:rotate-0" />
            }
          />
        </Link>
      </div>
      <FlexCol className="gap-3 px-1 pb-3">
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Primary}
        >
          Hey {user.name}, We&#39;ve found a new opportunity that aligns with
          your experience and what you’ve been exploring lately.
        </Typography>
        <Link href={`${webappUrl}opportunity/${alerts.opportunityId}`} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Primary}
            size={ButtonSize.XSmall}
            onClick={logOpportunityNudgeClick}
            className="mr-auto"
          >
            Let&#39;s check it out →
          </Button>
        </Link>
      </FlexCol>
    </FlexCol>
  );
};

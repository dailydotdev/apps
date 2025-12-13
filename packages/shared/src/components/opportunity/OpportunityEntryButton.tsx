import type { ReactElement } from 'react';
import React from 'react';
import Link from '../utilities/Link';
import { isTesting, webappUrl } from '../../lib/constants';
import { Button } from '../buttons/Button';
import { ButtonIconPosition, ButtonVariant } from '../buttons/common';
import { JobIcon } from '../icons';
import { Bubble } from '../tooltips/utils';
import { useAlertsContext } from '../../contexts/AlertContext';
import { SimpleTooltip } from '../tooltips';
import type { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { NewOpportunityPopover } from './NewOpportunityPopover';
import { useLogOpportunityNudgeClick } from '../../hooks/log/useLogOpportunityNudgeClick';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';

const OpportunityTooltip = ({
  children,
  placement,
}: {
  children: ReactElement;
  placement: TooltipPosition;
}): ReactElement => {
  return (
    <SimpleTooltip
      interactive
      placement={placement}
      forceLoad={!isTesting}
      visible
      showArrow={false}
      container={{
        bgClassName: 'bg-background-popover',
        className: 'border border-accent-onion-default !rounded-12',
      }}
      content={<NewOpportunityPopover />}
    >
      {children}
    </SimpleTooltip>
  );
};

export const OpportunityEntryButton = () => {
  const { alerts } = useAlertsContext();
  const hasOpportunityAlert = !!alerts.opportunityId;
  const { checkHasCompleted } = useActions();
  const hasNotClickedOpportunity = !checkHasCompleted(
    ActionType.ClickedOpportunityNavigation,
  );
  const logOpportunityNudgeClick = useLogOpportunityNudgeClick();
  const RenderTooltip =
    hasOpportunityAlert && hasNotClickedOpportunity
      ? OpportunityTooltip
      : SimpleTooltip;

  return (
    <RenderTooltip content="Jobs" placement="bottom-end">
      <div>
        <Link
          href={`${webappUrl}jobs/${
            hasOpportunityAlert ? alerts.opportunityId : ''
          }`}
          passHref
        >
          <Button
            variant={ButtonVariant.Float}
            className="relative w-10 justify-center"
            tag="a"
            onClick={logOpportunityNudgeClick}
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
      </div>
    </RenderTooltip>
  );
};

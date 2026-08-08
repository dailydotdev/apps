import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { InviteIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { formatUsd } from '../dealsFormat';

interface DealImpactWidgetProps {
  claimedCount: number;
  totalSavedUsd: number;
  invitesDone: number;
  invitesRequired: number;
  onInvite?: () => void;
  className?: string;
}

const Stat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <div className="flex flex-1 flex-col gap-0.5">
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Title2}
      bold
      className="tabular-nums"
    >
      {value}
    </Typography>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
    >
      {label}
    </Typography>
  </div>
);

export const DealImpactWidget = ({
  claimedCount,
  totalSavedUsd,
  invitesDone,
  invitesRequired,
  onInvite,
  className,
}: DealImpactWidgetProps): ReactElement => {
  const invitesLeft = Math.max(0, invitesRequired - invitesDone);
  const progress = invitesRequired
    ? Math.min(100, Math.round((invitesDone / invitesRequired) * 100))
    : 0;

  return (
    <aside
      className={classNames(
        'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4',
        className,
      )}
    >
      <Typography tag={TypographyTag.H2} type={TypographyType.Body} bold>
        Your impact
      </Typography>

      <div className="flex items-start gap-4">
        <Stat label="Deals claimed" value={`${claimedCount}`} />
        <Stat label="Saved so far" value={formatUsd(totalSavedUsd)} />
      </div>

      <div className="flex flex-col gap-2">
        <div
          role="progressbar"
          aria-label="Invites towards the next members only deal"
          aria-valuemin={0}
          aria-valuemax={invitesRequired}
          aria-valuenow={Math.min(invitesDone, invitesRequired)}
          aria-valuetext={`${invitesDone} of ${invitesRequired} invites in`}
          className="h-1 w-full overflow-hidden rounded-8 bg-surface-float"
        >
          <div
            className="h-full rounded-8 bg-action-plus-default"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="tabular-nums"
        >
          {invitesDone} of {invitesRequired} invites in.{' '}
          {invitesLeft
            ? `${invitesLeft} more unlocks the next members only deal.`
            : 'Your next members only deal is unlocked.'}
        </Typography>
      </div>

      <Button
        type="button"
        variant={ButtonVariant.Subtle}
        size={ButtonSize.Small}
        icon={<InviteIcon />}
        onClick={onInvite}
      >
        Invite friends
      </Button>
    </aside>
  );
};

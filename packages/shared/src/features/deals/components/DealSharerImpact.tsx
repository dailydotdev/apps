import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ShareIcon, UserShareIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { formatFullNumber, formatUsd } from '../dealsFormat';

interface DealSharerImpactProps {
  shares: number;
  claimsViaShares: number;
  savedViaSharesUsd: number;
  milestone?: 'first_claim' | null;
  className?: string;
}

const Stat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <div className="flex flex-1 flex-col">
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Title3}
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

export const DealSharerImpact = ({
  shares,
  claimsViaShares,
  savedViaSharesUsd,
  milestone,
  className,
}: DealSharerImpactProps): ReactElement => {
  const isMilestone = milestone === 'first_claim';
  const hasClaims = claimsViaShares > 0;
  const devs = claimsViaShares === 1 ? 'dev' : 'devs';

  const getHeadline = () => {
    if (isMilestone) {
      return 'First claim from your share';
    }

    if (hasClaims) {
      return `${formatFullNumber(
        claimsViaShares,
      )} ${devs} claimed via your link`;
    }

    return 'No claims from your links yet';
  };

  const getSubline = () => {
    if (isMilestone) {
      return 'Someone used a deal you shared. That is real money you saved another dev.';
    }

    if (hasClaims) {
      return 'Every claim through your link keeps the directory worth reading.';
    }

    return 'Share a deal you actually use. The first claim usually lands the same day.';
  };

  return (
    <div
      className={classNames(
        'flex flex-col gap-3 rounded-16 border p-4',
        isMilestone
          ? 'border-status-success bg-action-upvote-float'
          : 'border-border-subtlest-tertiary bg-surface-float',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={classNames(
            'flex size-8 shrink-0 items-center justify-center rounded-10',
            isMilestone ? 'bg-action-upvote-default' : 'bg-surface-secondary',
          )}
        >
          {isMilestone ? (
            <UserShareIcon size={IconSize.Small} secondary />
          ) : (
            <ShareIcon size={IconSize.Small} />
          )}
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            bold
            className="tabular-nums"
          >
            {getHeadline()}
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {getSubline()}
          </Typography>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary pt-3">
        <Stat label="Shares" value={formatFullNumber(shares)} />
        <Stat label="Claims" value={formatFullNumber(claimsViaShares)} />
        <Stat label="Saved for others" value={formatUsd(savedViaSharesUsd)} />
      </div>
    </div>
  );
};

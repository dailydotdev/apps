import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { Deal } from '../types';
import {
  DealBadgeKind,
  formatDealCountdown,
  getDealBadgeKind,
} from '../dealsFormat';

interface DealBadgeProps {
  deal: Deal;
  now: number;
  className?: string;
}

const badgeColor: Record<DealBadgeKind, TypographyColor> = {
  [DealBadgeKind.Expired]: TypographyColor.Quaternary,
  [DealBadgeKind.SoldOut]: TypographyColor.Quaternary,
  [DealBadgeKind.Promoted]: TypographyColor.Quaternary,
  [DealBadgeKind.EndingSoon]: TypographyColor.StatusError,
  [DealBadgeKind.CommunityPick]: TypographyColor.Brand,
  [DealBadgeKind.MembersOnly]: TypographyColor.Plus,
};

const staticBadgeLabel: Partial<Record<DealBadgeKind, string>> = {
  [DealBadgeKind.Expired]: 'Expired',
  [DealBadgeKind.SoldOut]: 'Sold out',
  [DealBadgeKind.Promoted]: 'Promoted',
  [DealBadgeKind.CommunityPick]: 'Community pick',
  [DealBadgeKind.MembersOnly]: 'Members only',
};

/**
 * One status label per deal. Everything the precedence demotes belongs in the
 * metadata line or on the deal page, never stacked next to the value.
 */
export const DealBadge = ({
  deal,
  now,
  className,
}: DealBadgeProps): ReactElement | null => {
  const kind = getDealBadgeKind(deal, now);

  if (!kind) {
    return null;
  }

  const classes = classNames(
    'w-fit',
    kind === DealBadgeKind.EndingSoon && 'tabular-nums',
    className,
  );

  if (kind === DealBadgeKind.EndingSoon && deal.expiresAt) {
    return (
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={badgeColor[kind]}
        bold
        className={classes}
      >
        <time dateTime={deal.expiresAt} aria-live="off">
          {formatDealCountdown(deal.expiresAt, now)}
        </time>
      </Typography>
    );
  }

  return (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      color={badgeColor[kind]}
      bold
      className={classes}
    >
      {staticBadgeLabel[kind]}
    </Typography>
  );
};

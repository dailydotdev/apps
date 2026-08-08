import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { UpvoteIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { DealCommunity } from '../types';
import {
  formatCompactNumber,
  formatDealRelativeShort,
  formatFullNumber,
  formatWorksRate,
  hasRatedWorksRate,
} from '../dealsFormat';
import { MOCK_NOW_MS } from '../mockDeals';

interface DealCommunityProofProps {
  community: DealCommunity;
  isMuted?: boolean;
  /** One scannable line: the works rate and how fresh it is, nothing else. */
  isCompact?: boolean;
  now?: number;
  className?: string;
}

export const DealCommunityProof = ({
  community,
  isMuted,
  isCompact,
  now = MOCK_NOW_MS,
  className,
}: DealCommunityProofProps): ReactElement => {
  const numberColor = isMuted
    ? TypographyColor.Quaternary
    : TypographyColor.Tertiary;
  const isRated = hasRatedWorksRate(community);
  const verifiedLabel = formatDealRelativeShort(community.lastVerifiedAt, now);
  const rateLabel = isRated
    ? `${formatWorksRate(community.worksRate)} of ${formatCompactNumber(
        community.claims,
      )} worked`
    : `${formatFullNumber(community.claims)} reported back`;
  const ariaLabel = `${formatFullNumber(
    community.claims,
  )} developers claimed this. ${
    isRated
      ? `${formatWorksRate(community.worksRate)} reported it worked.`
      : 'Not enough reports yet to rate it.'
  } Last verified ${verifiedLabel}.`;

  if (isCompact) {
    return (
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={numberColor}
        role="group"
        aria-label={ariaLabel}
        className={classNames(
          'flex min-w-0 items-center gap-1.5 tabular-nums',
          className,
        )}
      >
        <VIcon
          size={IconSize.XSmall}
          secondary
          className={isMuted ? 'text-text-quaternary' : 'text-status-success'}
        />
        <span className="truncate">
          {rateLabel} · verified{' '}
          <time dateTime={community.lastVerifiedAt}>{verifiedLabel}</time>
        </span>
      </Typography>
    );
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={classNames(
        'flex flex-wrap items-center gap-x-3 gap-y-1 typo-caption1',
        className,
      )}
    >
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={numberColor}
        className="flex items-center gap-1 tabular-nums"
      >
        <UpvoteIcon size={IconSize.XSmall} />
        {formatCompactNumber(community.upvotes)}
      </Typography>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={numberColor}
        className="tabular-nums"
      >
        {rateLabel}
      </Typography>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={
          isMuted ? TypographyColor.Quaternary : TypographyColor.StatusSuccess
        }
        className="ml-auto flex items-center gap-1 whitespace-nowrap"
      >
        <VIcon size={IconSize.XSmall} secondary />
        Verified{' '}
        <time dateTime={community.lastVerifiedAt}>{verifiedLabel}</time>
      </Typography>
    </div>
  );
};

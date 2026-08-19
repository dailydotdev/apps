import type { ReactElement, ReactNode } from 'react';
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
  formatDealDate,
  getDealVerification,
  hasRatedWorksRate,
} from '../dealsFormat';

export const DEAL_VERIFICATION_HEADING = 'How this was verified';

interface DealVerificationProps {
  deal: Deal;
  now: number;
  headingTag?: TypographyTag.H2 | TypographyTag.H3;
  action?: ReactNode;
  className?: string;
}

const Stat = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-text-tertiary typo-caption1">{label}</dt>
    <dd className="font-bold tabular-nums text-text-primary typo-title3">
      {children}
    </dd>
  </div>
);

export const DealVerification = ({
  deal,
  now,
  headingTag = TypographyTag.H2,
  action,
  className,
}: DealVerificationProps): ReactElement => {
  const verification = getDealVerification(deal, now);
  const isRated = hasRatedWorksRate(deal.community);

  return (
    <div className={classNames('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <Typography tag={headingTag} type={TypographyType.Title3} bold>
          {DEAL_VERIFICATION_HEADING}
        </Typography>
        {action}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border-subtlest-tertiary py-4 tablet:grid-cols-4">
        <Stat label="Developers claimed it">{verification.claimsLabel}</Stat>
        <Stat label={isRated ? 'Reported it worked' : 'Success rate'}>
          {verification.worksRateLabel}
        </Stat>
        <Stat label="Last verified">
          <time dateTime={verification.verifiedAt}>
            {formatDealDate(verification.verifiedAt)}
          </time>
        </Stat>
        <Stat label="Typical saving">{verification.savingLabel}</Stat>
      </dl>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {verification.summary}
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Last verified on{' '}
        <time dateTime={verification.verifiedAt}>
          {formatDealDate(verification.verifiedAt)}
        </time>{' '}
        ({verification.verifiedLabel}). This page was updated on{' '}
        <time dateTime={deal.updatedAt}>{formatDealDate(deal.updatedAt)}</time>.
      </Typography>
    </div>
  );
};

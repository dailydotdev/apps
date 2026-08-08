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
  className?: string;
}

const Stat = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1 rounded-12 bg-surface-float p-3">
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
    >
      {label}
    </Typography>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Title3}
      bold
      className="tabular-nums"
    >
      {children}
    </Typography>
  </div>
);

export const DealVerification = ({
  deal,
  now,
  className,
}: DealVerificationProps): ReactElement => {
  const verification = getDealVerification(deal, now);
  const isRated = hasRatedWorksRate(deal.community);

  return (
    <section className={classNames('flex flex-col gap-3', className)}>
      <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
        {DEAL_VERIFICATION_HEADING}
      </Typography>
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
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
      </div>
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
    </section>
  );
};

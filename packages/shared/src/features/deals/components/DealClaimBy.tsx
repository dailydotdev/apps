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
import { formatDealDate, getDealEndsAt } from '../dealsFormat';

interface DealClaimByProps {
  deal: Deal;
  className?: string;
}

/**
 * The deadline to claim and the end of the offer are two clocks, and collapsing
 * them into one is how a reader misses the first while watching the second.
 */
export const DealClaimBy = ({
  deal,
  className,
}: DealClaimByProps): ReactElement | null => {
  const { claimByAt } = deal;

  if (!claimByAt) {
    return null;
  }

  const endsAt = getDealEndsAt(deal);

  return (
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className={classNames('tabular-nums', className)}
    >
      Claim by <time dateTime={claimByAt}>{formatDealDate(claimByAt)}</time>.
      {endsAt && (
        <>
          {' '}
          The offer itself runs until{' '}
          <time dateTime={endsAt}>{formatDealDate(endsAt)}</time>.
        </>
      )}
    </Typography>
  );
};

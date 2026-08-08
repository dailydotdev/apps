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
import { DEAL_CAVEATS_HEADING, getRankedDealCaveats } from '../dealsFormat';

interface DealCaveatsProps {
  deal: Deal;
  headingTag?: TypographyTag.H2 | TypographyTag.H3;
  className?: string;
}

/**
 * A restriction that decides whether the offer applies to you is part of the
 * offer, not part of the terms, so it renders before the claim controls rather
 * than behind a disclosure triangle.
 */
export const DealCaveats = ({
  deal,
  headingTag = TypographyTag.H2,
  className,
}: DealCaveatsProps): ReactElement | null => {
  const caveats = getRankedDealCaveats(deal);

  if (!caveats.length) {
    return null;
  }

  return (
    <section className={classNames('flex flex-col gap-3', className)}>
      <Typography tag={headingTag} type={TypographyType.Title3} bold>
        {DEAL_CAVEATS_HEADING}
      </Typography>
      <ul className="flex flex-col gap-2">
        {caveats.map(({ kind, label, detail }) => (
          <li key={kind} className="flex flex-col">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
            >
              {label}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {detail}
            </Typography>
          </li>
        ))}
      </ul>
    </section>
  );
};

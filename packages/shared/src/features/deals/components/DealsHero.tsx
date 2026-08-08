import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { DealsDirectoryEvidence } from '../dealsFormat';
import {
  DEAL_AFFILIATE_DISCLOSURE,
  formatFullNumber,
  formatWorksRate,
} from '../dealsFormat';

interface DealsHeroProps {
  heading?: string;
  intro?: string;
  evidence?: DealsDirectoryEvidence;
  className?: string;
}

const getEvidenceLine = ({
  deals,
  claims,
  worksRate,
  isRated,
}: DealsDirectoryEvidence): string => {
  const listed = `${formatFullNumber(deals)} live ${
    deals === 1 ? 'deal' : 'deals'
  }`;
  const claimed = `claimed ${formatFullNumber(claims)} times by developers`;

  if (!isRated) {
    return `${listed}, ${claimed}. Too few reports so far to rate them.`;
  }

  return `${listed}, ${claimed}. ${formatWorksRate(
    worksRate,
  )} of those reports came back working.`;
};

export const DealsHero = ({
  heading = 'Deals for devs',
  intro = 'Coupons, credits and free months on the tools you already use. Verified by the community.',
  evidence,
  className,
}: DealsHeroProps): ReactElement => (
  <section className={classNames('flex flex-col gap-2 py-6', className)}>
    <Typography tag={TypographyTag.H1} type={TypographyType.LargeTitle} bold>
      {heading}
    </Typography>
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Body}
      color={TypographyColor.Tertiary}
      className="max-w-[40rem]"
    >
      {intro}
    </Typography>
    {evidence && (
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="flex items-center gap-2 tabular-nums"
      >
        <span aria-hidden className="size-2 rounded-full bg-status-success" />
        {getEvidenceLine(evidence)}
      </Typography>
    )}
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
    >
      {DEAL_AFFILIATE_DISCLOSURE}
    </Typography>
  </section>
);

import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { SearchField } from '../../../components/fields/SearchField';
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
  query: string;
  onQueryChange: (query: string) => void;
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
  query,
  onQueryChange,
  heading = 'Deals for devs',
  intro = 'Coupons, credits and free months on the tools you already use. Verified by the community.',
  evidence,
  className,
}: DealsHeroProps): ReactElement => (
  <section className={classNames('flex flex-col gap-4 py-6', className)}>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Caption2}
      color={TypographyColor.Tertiary}
      bold
      className="uppercase tracking-wider"
    >
      daily.dev deals
    </Typography>

    <div className="flex flex-col gap-2">
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
    </div>

    <SearchField
      inputId="deals-directory-search"
      placeholder="Search deals, brands or categories"
      aria-label="Search deals"
      value={query}
      valueChanged={onQueryChange}
      className="w-full tablet:max-w-md"
    />
  </section>
);

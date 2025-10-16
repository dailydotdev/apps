import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';
import { Image } from '../../image/Image';
import Link from '../../utilities/Link';
import { getTagPageLink } from '../../../lib';
import { truncateTextClassNames } from '../../utilities';
import { ActivityContainer } from '../ActivitySection';
import { ClickableText } from '../../buttons/ClickableText';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { topReaderBadgeDocs } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';

// Skeleton component
export const BadgesAndAwardsSkeleton = (): ReactElement => {
  return (
    <ActivityContainer data-testid="BadgesAndAwardsSkeleton">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
        className="flex items-center"
      >
        Badges &amp; Awards
      </Typography>
      <ClickableText
        tag="a"
        target="_blank"
        href={topReaderBadgeDocs}
        rel={anchorDefaultRel}
      >
        Learn more
      </ClickableText>

      <div className="my-3 flex gap-3">
        <ElementPlaceholder className="flex flex-1 flex-col items-center rounded-10 p-2">
          <ElementPlaceholder className="h-6 w-8 rounded-4" />
          <ElementPlaceholder className="mt-1 h-4 w-16 rounded-4" />
        </ElementPlaceholder>
        <ElementPlaceholder className="flex flex-1 flex-col items-center rounded-10 p-2">
          <ElementPlaceholder className="h-6 w-8 rounded-4" />
          <ElementPlaceholder className="mt-1 h-4 w-16 rounded-4" />
        </ElementPlaceholder>
      </div>

      <div className="flex flex-col gap-2">
        <ElementPlaceholder className="flex items-center justify-between rounded-6 p-1">
          <ElementPlaceholder className="h-6 w-20 rounded-4" />
          <ElementPlaceholder className="h-4 w-12 rounded-4" />
        </ElementPlaceholder>
      </div>

      {/* Awards section skeleton */}
      <div className="mt-4 grid grid-cols-5 gap-4 laptop:grid-cols-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <ElementPlaceholder
            // eslint-disable-next-line react/no-array-index-key
            key={`skeleton-award-${index}`}
            className="flex flex-col items-center justify-center rounded-6 p-1"
          >
            <ElementPlaceholder className="size-8 rounded-4" />
            <ElementPlaceholder className="mt-1 h-4 w-6 rounded-4" />
          </ElementPlaceholder>
        ))}
      </div>
    </ActivityContainer>
  );
};

// Award component
export type AwardProps = {
  image: string;
  amount: number;
};

export const Award = ({ image, amount }: AwardProps): ReactElement => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image src={image} alt="Award" className="size-8" />
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Primary}
        className="mt-1"
      >
        x{amount}
      </Typography>
    </div>
  );
};

// SummaryCard component
export type SummaryCardProps = {
  count: string | number;
  label: string;
};

export const SummaryCard = ({
  count,
  label,
}: SummaryCardProps): ReactElement => {
  return (
    <div className="flex-1 rounded-10 border border-border-subtlest-tertiary p-2 text-center">
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        {count}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {label}
      </Typography>
    </div>
  );
};

// KeywordBadge component
export type KeywordBadgeProps = {
  badge: {
    id: string;
    keyword: {
      value: string;
      flags?: { title?: string };
    };
    issuedAt: string | Date;
  };
};

export const KeywordBadge = ({ badge }: KeywordBadgeProps): ReactElement => {
  return (
    <div className="flex items-center justify-between">
      <Link
        href={getTagPageLink(badge.keyword.value)}
        passHref
        prefetch={false}
      >
        <Typography
          tag={TypographyTag.Link}
          type={TypographyType.Caption1}
          color={TypographyColor.Primary}
          className={classNames(
            'rounded-6 border border-border-subtlest-tertiary px-1 py-0.5 lowercase transition duration-200 hover:bg-background-popover',
            truncateTextClassNames,
          )}
        >
          {badge.keyword.flags?.title || badge.keyword.value}
        </Typography>
      </Link>
      <Typography
        tag={TypographyTag.Time}
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
        dateTime={new Date(badge.issuedAt).toISOString()}
      >
        {formatDate({
          value: badge.issuedAt,
          type: TimeFormatType.TopReaderBadge,
        })}
      </Typography>
    </div>
  );
};

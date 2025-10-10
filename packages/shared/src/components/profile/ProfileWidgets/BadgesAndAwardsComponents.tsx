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
        className="text-text-quaternary"
      >
        {formatDate({
          value: badge.issuedAt,
          type: TimeFormatType.TopReaderBadge,
        })}
      </Typography>
    </div>
  );
};

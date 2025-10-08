import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { ActivityContainer, ActivitySectionTitle } from './ActivitySection';
import { topReaderBadgeDocs } from '../../lib/constants';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';
import type { PublicProfile } from '../../lib/user';
import { ClickableText } from '../buttons/ClickableText';
import { Image } from '../image/Image';
import { useTopReader } from '../../hooks/useTopReader';
import Link from '../utilities/Link';
import { getTagPageLink } from '../../lib';
import { truncateTextClassNames } from '../utilities';
import {
  userProductSummaryQueryOptions,
  ProductType,
} from '../../graphql/njord';
import { useHasAccessToCores } from '../../hooks/useCoresFeature';

type AwardProps = {
  image: string;
  amount: number;
};

const Award = ({ image, amount }: AwardProps): ReactElement => {
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

type SummaryCardProps = {
  count: number;
  label: string;
};

const SummaryCard = ({ count, label }: SummaryCardProps): ReactElement => {
  return (
    <div className="rounded-10 border-border-subtlest-tertiary flex-1 border p-2 text-center">
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Primary}
        bold
      >
        x{count}
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

type KeywordBadgeProps = {
  badge: {
    id: string;
    keyword: {
      value: string;
      flags?: { title?: string };
    };
    issuedAt: string | Date;
  };
};

const KeywordBadge = ({ badge }: KeywordBadgeProps): ReactElement => {
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
            'rounded-6 border-border-subtlest-tertiary hover:bg-background-popover border px-1 py-0.5 lowercase transition duration-200',
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

export const BadgesAndAwards = ({
  user,
}: {
  user: PublicProfile;
}): ReactElement => {
  const { data: topReaders, isPending: isTopReaderLoading } = useTopReader({
    user,
    limit: 5,
  });

  const hasCoresAccess = useHasAccessToCores();

  const { data: awards, isPending: isAwardsLoading } = useQuery({
    ...userProductSummaryQueryOptions({
      userId: user?.id,
      type: ProductType.Award,
    }),
    enabled: !!user?.id && hasCoresAccess,
  });

  if (isTopReaderLoading || isAwardsLoading) {
    return null;
  }

  if (!topReaders?.length && !awards?.length) {
    return null;
  }

  const totalTopReaderBadges =
    topReaders?.reduce((sum, topReader) => sum + topReader.total, 0) ?? 0;
  const totalAwards = awards?.reduce((sum, award) => sum + award.count, 0) ?? 0;

  return (
    <ActivityContainer>
      <ActivitySectionTitle>Badges & Awards</ActivitySectionTitle>
      <ClickableText tag="a" target="_blank" href={topReaderBadgeDocs}>
        Learn more
      </ClickableText>

      <div className="my-3 flex gap-3">
        <SummaryCard count={totalTopReaderBadges} label="Top reader badge" />
        <SummaryCard count={totalAwards} label="Total Awards" />
      </div>

      {topReaders && topReaders.length > 0 && (
        <div className="flex flex-col gap-2">
          {topReaders.map((badge) => (
            <KeywordBadge key={`badge-${badge.id}`} badge={badge} />
          ))}
        </div>
      )}

      {hasCoresAccess && awards && awards.length > 0 && (
        <div className="laptop:grid-cols-6 mt-4 grid grid-cols-5 gap-4">
          {awards.map((award) => (
            <Award key={award.id} image={award.image} amount={award.count} />
          ))}
        </div>
      )}
    </ActivityContainer>
  );
};

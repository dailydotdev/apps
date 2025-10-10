import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActivityContainer } from '../ActivitySection';
import { topReaderBadgeDocs } from '../../../lib/constants';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import type { PublicProfile } from '../../../lib/user';
import { ClickableText } from '../../buttons/ClickableText';
import { useTopReader } from '../../../hooks/useTopReader';
import {
  userProductSummaryQueryOptions,
  ProductType,
} from '../../../graphql/njord';
import { useHasAccessToCores } from '../../../hooks/useCoresFeature';
import {
  Award,
  SummaryCard,
  KeywordBadge,
  BadgesAndAwardsSkeleton,
} from './BadgesAndAwardsComponents';
import { anchorDefaultRel } from '../../../lib/strings';

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

  const {
    data: awards,
    isPending: isAwardsLoading,
    error: awardsError,
  } = useQuery({
    ...userProductSummaryQueryOptions({
      userId: user?.id,
      type: ProductType.Award,
    }),
    enabled: !!user?.id && hasCoresAccess,
  });

  if (isTopReaderLoading || isAwardsLoading) {
    return <BadgesAndAwardsSkeleton />;
  }

  // Handle error states
  if (awardsError) {
    return null;
  }

  const totalTopReaderBadges =
    topReaders?.reduce((sum, topReader) => sum + (topReader?.total || 0), 0) ??
    0;
  const totalAwards =
    awards?.reduce((sum, award) => sum + (award?.count || 0), 0) ?? 0;

  return (
    <ActivityContainer>
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
        <SummaryCard
          count={`x${totalTopReaderBadges}`}
          label="Top reader badge"
        />
        <SummaryCard count={`x${totalAwards}`} label="Total Awards" />
      </div>

      {topReaders && topReaders.length > 0 && (
        <div
          className="flex flex-col gap-2"
          role="list"
          aria-label="User badges"
        >
          {topReaders.map((badge) => (
            <KeywordBadge key={`badge-${badge.id}`} badge={badge} />
          ))}
        </div>
      )}

      {hasCoresAccess && awards && awards.length > 0 && (
        <div
          className="mt-4 grid grid-cols-5 gap-4 laptop:grid-cols-6"
          role="list"
          aria-label="User awards"
        >
          {awards.map((award) => (
            <Award key={award.id} image={award.image} amount={award.count} />
          ))}
        </div>
      )}
    </ActivityContainer>
  );
};

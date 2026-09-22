import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { CreatorAchievement } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import { CreatorAchievementCard } from './CreatorAchievementCard';
import { describableAchievements } from './achievements';

interface CreatorAchievementsSectionProps {
  achievements: CreatorAchievement[];
  isPending: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const CreatorAchievementsSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 2 }, (_, index) => (
      <ElementPlaceholder
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="h-[4.5rem] w-full rounded-14"
      />
    ))}
  </div>
);

const EmptyState = (): ReactElement => (
  <div className="flex flex-col items-center gap-1 rounded-14 border border-border-subtlest-tertiary px-4 py-8 text-center">
    <Typography
      type={TypographyType.Callout}
      color={TypographyColor.Primary}
      bold
    >
      No achievements yet
    </Typography>
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="max-w-80"
    >
      Recognition you earn for your posts will show up here.
    </Typography>
  </div>
);

/**
 * Earned recognition, newest first.
 *
 * Awards the creator already held before this shipped are shown here like any
 * other — they were earned, so withholding them would understate the record —
 * and the server is what keeps them from also arriving as months-old email.
 */
export const CreatorAchievementsSection = ({
  achievements,
  isPending,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: CreatorAchievementsSectionProps): ReactElement => {
  if (isPending) {
    return <CreatorAchievementsSkeleton />;
  }

  // The empty state answers "has this creator earned anything", which is the
  // unfiltered count. Asking the filtered one would tell a creator whose first
  // page happens to be types this build cannot describe that they have no
  // recognition at all — and hide the button that would reach the awards it
  // can describe.
  if (!achievements.length) {
    return <EmptyState />;
  }

  const describable = describableAchievements(achievements);

  return (
    <div className="flex flex-col gap-3">
      {describable.map((achievement) => (
        <CreatorAchievementCard
          key={achievement.id}
          achievement={achievement}
        />
      ))}
      {/* Tied to `hasNextPage` alone, for the same reason: a page made
          entirely of undescribable awards must still be pageable past. */}
      {hasNextPage && (
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={fetchNextPage}
          loading={isFetchingNextPage}
          className="self-center"
        >
          Show more
        </Button>
      )}
    </div>
  );
};

import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  EyeIcon,
  MedalBadgeIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { CreatorAchievement } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { CreatorAchievementType } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import {
  achievementDateLabel,
  achievementSubtitle,
  achievementTitle,
} from './achievements';

interface CreatorAchievementCardProps {
  achievement: CreatorAchievement;
}

const icons: Record<CreatorAchievementType, typeof MedalBadgeIcon> = {
  [CreatorAchievementType.CategoryRanking]: MedalBadgeIcon,
  [CreatorAchievementType.PostUpvoteMilestone]: UpvoteIcon,
  [CreatorAchievementType.CreatorImpressionMilestone]: EyeIcon,
};

/**
 * One earned award, with everything it was granted on.
 *
 * Every line comes from the record: nothing here recomputes a rank or a total,
 * so the card cannot drift from the notification or the share card that will
 * be built from the same row.
 */
export const CreatorAchievementCard = ({
  achievement,
}: CreatorAchievementCardProps): ReactElement | null => {
  const title = achievementTitle(achievement);

  // An award this build cannot describe is left out rather than rendered as a
  // blank badge. `describableAchievements` filters these before the grid, so
  // this is the belt to that braces.
  if (!title) {
    return null;
  }

  const subtitle = achievementSubtitle(achievement);
  const AchievementIcon = icons[achievement.type];

  return (
    <div className="flex flex-row items-start gap-3 rounded-14 border border-border-subtlest-tertiary p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-surface-float">
        <AchievementIcon
          size={IconSize.Small}
          className="text-text-primary"
          secondary
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          type={TypographyType.Callout}
          tag={TypographyTag.H3}
          color={TypographyColor.Primary}
          bold
        >
          {title}
        </Typography>
        {!!subtitle && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            className="truncate"
          >
            {subtitle}
          </Typography>
        )}
        <div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {achievementDateLabel(achievement)}
          </Typography>
          {!!achievement.post && (
            <>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Quaternary}
                aria-hidden
              >
                ·
              </Typography>
              <Link href={achievement.post.commentsPermalink} passHref>
                <Typography
                  tag={TypographyTag.Link}
                  type={TypographyType.Footnote}
                  color={TypographyColor.Link}
                >
                  View article
                </Typography>
              </Link>
            </>
          )}
          {!!achievement.evidenceUrl && (
            <>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Quaternary}
                aria-hidden
              >
                ·
              </Typography>
              <Link href={achievement.evidenceUrl} passHref>
                <Typography
                  tag={TypographyTag.Link}
                  type={TypographyType.Footnote}
                  color={TypographyColor.Link}
                >
                  See the ranking
                </Typography>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

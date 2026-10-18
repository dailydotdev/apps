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
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ProfilePicture,
  ProfileImageSize,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  EyeIcon,
  MedalBadgeIcon,
  UpvoteIcon,
  ShieldCheckIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { SharedCreatorAchievement } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { CreatorAchievementType } from '@dailydotdev/shared/src/graphql/creatorAchievements';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';
import {
  achievementCategoryLabel,
  achievementContextLabel,
  achievementDateLabel,
  achievementPeriodLabel,
  achievementSubtitle,
  achievementTitle,
} from '../analytics/creator/achievements';

const icons: Record<CreatorAchievementType, typeof MedalBadgeIcon> = {
  [CreatorAchievementType.CategoryRanking]: MedalBadgeIcon,
  [CreatorAchievementType.PostUpvoteMilestone]: UpvoteIcon,
  [CreatorAchievementType.CreatorImpressionMilestone]: EyeIcon,
};

/**
 * How a reader can check the claim for themselves, per type. Only public
 * facts: a milestone states the threshold it crossed and never the creator's
 * actual total.
 */
const verificationCopy = (
  achievement: SharedCreatorAchievement,
): string | null => {
  const date = achievementDateLabel(achievement);

  switch (achievement.type) {
    case CreatorAchievementType.CategoryRanking: {
      const category = achievementCategoryLabel(achievement);
      const period = achievementPeriodLabel(achievement);

      return `This placement is read from the public Best of ${category} ranking${
        period ? ` for ${period}` : ''
      }, which anyone can open.`;
    }
    case CreatorAchievementType.PostUpvoteMilestone:
      return `Counted from upvotes on daily.dev. The article passed ${formatDataTileValue(
        achievement.threshold ?? 0,
      )} upvotes on ${date}.`;
    case CreatorAchievementType.CreatorImpressionMilestone:
      return `Counted from impressions across everything ${achievement.user.name} has published on daily.dev, as recorded on ${date}. Their exact analytics stay private.`;
    default:
      return null;
  }
};

interface SharedAchievementEvidenceProps {
  achievement: SharedCreatorAchievement;
}

/**
 * The public page behind a shared achievement: what was earned, by whom, and
 * where to check it. Readable without an account.
 */
export const SharedAchievementEvidence = ({
  achievement,
}: SharedAchievementEvidenceProps): ReactElement | null => {
  const title = achievementTitle(achievement);

  if (!title) {
    return null;
  }

  const AchievementIcon = icons[achievement.type];
  const context = achievementContextLabel(achievement);
  const subtitle =
    achievement.type === CreatorAchievementType.CreatorImpressionMilestone
      ? achievementSubtitle(achievement, 'public')
      : null;
  const verification = verificationCopy(achievement);
  const { user, post } = achievement;

  return (
    <article className="flex w-full flex-col gap-6 rounded-24 border border-border-subtlest-tertiary p-6 tablet:p-8">
      <header className="flex flex-col gap-4">
        <span className="flex size-14 items-center justify-center rounded-16 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default">
          <AchievementIcon
            size={IconSize.Large}
            className="text-white"
            secondary
          />
        </span>
        <div className="flex flex-col gap-1">
          {!!context && (
            <Typography
              type={TypographyType.Footnote}
              className="text-accent-cabbage-default"
              bold
            >
              {context}
            </Typography>
          )}
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            className="break-words"
            bold
          >
            {title}
          </Typography>
          {!!subtitle && (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {subtitle}
            </Typography>
          )}
        </div>
      </header>

      <Link href={user.permalink} passHref>
        <a className="flex min-w-0 flex-row items-center gap-3 self-start rounded-12 hover:bg-surface-hover">
          <ProfilePicture
            user={{ image: user.image, username: user.username }}
            size={ProfileImageSize.Large}
            nativeLazyLoading
          />
          <span className="flex min-w-0 flex-col">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              className="truncate"
              bold
            >
              {user.name}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Earned {achievementDateLabel(achievement)}
            </Typography>
          </span>
        </a>
      </Link>

      {!!post && (
        <div className="flex flex-col gap-1 rounded-16 bg-surface-float p-4">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Article
          </Typography>
          <Link href={post.commentsPermalink} passHref>
            <Typography
              tag={TypographyTag.Link}
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              className="break-words hover:underline"
              bold
            >
              {post.title ?? 'View the article'}
            </Typography>
          </Link>
        </div>
      )}

      {!!verification && (
        <section
          aria-labelledby="achievement-verification"
          className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6"
        >
          <span className="flex flex-row items-center gap-2">
            <ShieldCheckIcon
              size={IconSize.Small}
              className="text-accent-avocado-default"
              secondary
            />
            <Typography
              id="achievement-verification"
              tag={TypographyTag.H2}
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
            >
              Verified by daily.dev
            </Typography>
          </span>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            {verification}
          </Typography>
          <div className="flex flex-row flex-wrap gap-3">
            {!!achievement.evidenceUrl && (
              <Link href={achievement.evidenceUrl} passHref>
                <Button tag="a" variant={ButtonVariant.Primary}>
                  See the ranking
                </Button>
              </Link>
            )}
            {!!post && (
              <Link href={post.commentsPermalink} passHref>
                <Button
                  tag="a"
                  variant={
                    achievement.evidenceUrl
                      ? ButtonVariant.Float
                      : ButtonVariant.Primary
                  }
                >
                  Read the article
                </Button>
              </Link>
            )}
          </div>
        </section>
      )}
    </article>
  );
};

/**
 * What a link shows once the claim no longer holds — unshared, retracted, or
 * its article gone. It says nothing about the award, so it cannot keep
 * presenting a claim the evidence stopped supporting.
 */
export const SharedAchievementUnavailable = (): ReactElement => (
  <div className="flex w-full flex-col items-center gap-3 rounded-24 border border-border-subtlest-tertiary px-6 py-10 text-center">
    <Typography
      tag={TypographyTag.H1}
      type={TypographyType.Title2}
      color={TypographyColor.Primary}
      bold
    >
      This achievement isn&apos;t available
    </Typography>
    <Typography
      type={TypographyType.Callout}
      color={TypographyColor.Tertiary}
      className="max-w-96"
    >
      Its creator may have stopped sharing it, or the evidence it was based on
      has changed.
    </Typography>
    <Link href="/" passHref>
      <Button tag="a" variant={ButtonVariant.Primary} className="mt-3">
        Explore daily.dev
      </Button>
    </Link>
  </div>
);

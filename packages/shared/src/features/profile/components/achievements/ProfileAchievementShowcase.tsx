import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { PublicProfile } from '../../../../lib/user';
import { useShowcaseAchievements } from '../../../../hooks/profile/useShowcaseAchievements';
import { useProfilePreview } from '../../../../hooks/profile/useProfilePreview';
import { useProfileAchievements } from '../../../../hooks/profile/useProfileAchievements';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { EditIcon, PlusIcon } from '../../../../components/icons';
import { LazyImage } from '../../../../components/LazyImage';
import HoverCard from '../../../../components/cards/common/HoverCard';
import { formatDate, TimeFormatType } from '../../../../lib/dateFormat';
import {
  getAchievementRarityTier,
  AchievementRarityTier,
  rarityGlowClasses,
} from './achievementRarity';
import { RaritySparkles } from './RaritySparkles';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';

interface ProfileAchievementShowcaseProps {
  user: PublicProfile;
}

export function ProfileAchievementShowcase({
  user,
}: ProfileAchievementShowcaseProps): ReactElement | null {
  const { isOwner } = useProfilePreview(user);
  const { showcaseAchievements } = useShowcaseAchievements(user);
  const { achievements } = useProfileAchievements(user);
  const { openModal } = useLazyModal();

  const hasShowcase = showcaseAchievements.length > 0;

  const unlockedAchievements =
    achievements?.filter((a) => a.unlockedAt !== null) ?? [];

  const handleOpenModal = () => {
    openModal({
      type: LazyModal.AchievementShowcase,
      props: { user },
    });
  };

  if (!hasShowcase && !isOwner) {
    return null;
  }

  if (!hasShowcase && isOwner && unlockedAchievements.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          Achievement Showcase
        </Typography>
        {isOwner && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={hasShowcase ? <EditIcon /> : <PlusIcon />}
            onClick={handleOpenModal}
          >
            {hasShowcase ? 'Edit' : 'Add'}
          </Button>
        )}
      </div>

      {hasShowcase ? (
        <div className="flex gap-3">
          {showcaseAchievements.map((userAchievement) => {
            const { achievement, unlockedAt } = userAchievement;
            const rarityTier = getAchievementRarityTier(achievement.rarity);
            const rarityLabel =
              rarityTier === AchievementRarityTier.Emerald
                ? '<1%'
                : `${Math.round(achievement.rarity ?? 0)}%`;

            return (
              <HoverCard
                key={achievement.id}
                sideOffset={8}
                openDelay={300}
                trigger={
                  <button
                    type="button"
                    className={classNames(
                      'relative flex size-16 shrink-0 items-center justify-center rounded-14',
                      rarityTier
                        ? [
                            'overflow-visible border',
                            rarityGlowClasses[rarityTier],
                          ]
                        : 'overflow-hidden',
                    )}
                  >
                    {rarityTier && (
                      <RaritySparkles tier={rarityTier} size="compact" />
                    )}
                    <LazyImage
                      imgSrc={achievement.image}
                      imgAlt={achievement.name}
                      className="size-full rounded-14 object-cover"
                      fallbackSrc="https://daily.dev/default-achievement.png"
                    />
                  </button>
                }
              >
                <div className="flex w-64 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-4">
                  <div className="flex items-start gap-3">
                    <LazyImage
                      imgSrc={achievement.image}
                      imgAlt={achievement.name}
                      className="size-12 rounded-12 object-cover"
                      fallbackSrc="https://daily.dev/default-achievement.png"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Typography
                        type={TypographyType.Callout}
                        color={TypographyColor.Primary}
                        bold
                        className="truncate"
                      >
                        {achievement.name}
                      </Typography>
                      <Typography
                        type={TypographyType.Footnote}
                        color={TypographyColor.Tertiary}
                        className="line-clamp-2"
                      >
                        {achievement.description}
                      </Typography>
                    </div>
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Primary}
                      bold
                    >
                      {achievement.points}
                    </Typography>
                  </div>
                  {unlockedAt && (
                    <div className="flex flex-col">
                      <Typography
                        type={TypographyType.Footnote}
                        color={TypographyColor.Quaternary}
                      >
                        Unlocked{' '}
                        {formatDate({
                          value: unlockedAt,
                          type: TimeFormatType.Post,
                        })}
                      </Typography>
                      {achievement.rarity != null && (
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Quaternary}
                          className="mt-1"
                        >
                          Earned by {rarityLabel} of users
                        </Typography>
                      )}
                    </div>
                  )}
                </div>
              </HoverCard>
            );
          })}
        </div>
      ) : (
        isOwner && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary p-6">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Showcase your achievements on your profile
            </Typography>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={handleOpenModal}
            >
              Add achievements
            </Button>
          </div>
        )
      )}
    </div>
  );
}

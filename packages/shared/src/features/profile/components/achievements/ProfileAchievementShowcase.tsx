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
import {
  getAchievementRarityTier,
  rarityGlowClasses,
} from './achievementRarity';
import { AchievementCard } from './AchievementCard';
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
            const { achievement } = userAchievement;
            const rarityTier = getAchievementRarityTier(achievement.rarity);

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
                <div className="w-80 rounded-16 bg-background-popover">
                  <AchievementCard userAchievement={userAchievement} />
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

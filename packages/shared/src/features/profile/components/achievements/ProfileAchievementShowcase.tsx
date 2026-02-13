import type { ReactElement } from 'react';
import React from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useShowcasedAchievements } from '../../../../hooks/profile/useShowcasedAchievements';
import { useProfilePreview } from '../../../../hooks/profile/useProfilePreview';
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
import { AchievementCard } from './AchievementCard';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { LazyModal } from '../../../../components/modals/common/types';

interface ProfileAchievementShowcaseProps {
  user: PublicProfile;
}

export function ProfileAchievementShowcase({
  user,
}: ProfileAchievementShowcaseProps): ReactElement | null {
  const { achievements, isPending } = useShowcasedAchievements(user);
  const { isOwner } = useProfilePreview(user);
  const { openModal } = useLazyModal();

  const hasShowcased = !!achievements?.length;

  const handleOpenModal = () => {
    openModal({
      type: LazyModal.AchievementShowcase,
      props: { user },
    });
  };

  if (isPending) {
    return null;
  }

  if (!hasShowcased && !isOwner) {
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
        {isOwner && hasShowcased && (
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<EditIcon />}
            onClick={handleOpenModal}
          >
            Edit
          </Button>
        )}
      </div>

      {hasShowcased ? (
        <div className="flex gap-3">
          {achievements.map((ua) => (
            <HoverCard
              key={ua.achievement.id}
              sideOffset={8}
              openDelay={300}
              trigger={
                <button
                  type="button"
                  className="relative flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-14"
                >
                  <LazyImage
                    imgSrc={ua.achievement.image}
                    imgAlt={ua.achievement.name}
                    className="size-14 rounded-14 object-cover"
                    fallbackSrc="https://daily.dev/default-achievement.png"
                  />
                </button>
              }
            >
              <div className="w-72">
                <AchievementCard userAchievement={ua} />
              </div>
            </HoverCard>
          ))}
        </div>
      ) : (
        isOwner && (
          <div className="flex flex-col items-center gap-3 rounded-16 border border-dashed border-border-subtlest-tertiary p-6">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Pin up to 3 achievements on your profile
            </Typography>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              icon={<PlusIcon />}
              onClick={handleOpenModal}
            >
              Select achievements
            </Button>
          </div>
        )
      )}
    </div>
  );
}

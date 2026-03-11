import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { LazyImage } from '../LazyImage';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { VIcon } from '../icons';
import type { PublicProfile } from '../../lib/user';
import { useShowcaseAchievements } from '../../hooks/profile/useShowcaseAchievements';
import { useProfileAchievements } from '../../hooks/profile/useProfileAchievements';
import { useToastNotification } from '../../hooks/useToastNotification';

const MAX_SHOWCASE = 5;

export interface AchievementShowcaseModalProps extends ModalProps {
  user: PublicProfile;
}

export const AchievementShowcaseModal = ({
  user,
  onRequestClose,
  ...props
}: AchievementShowcaseModalProps): ReactElement => {
  const { showcaseAchievements, setShowcase, isSetPending } =
    useShowcaseAchievements(user);
  const { achievements } = useProfileAchievements(user);
  const { displayToast } = useToastNotification();

  const initialSelectedIds = useMemo(
    () => showcaseAchievements.map((sa) => sa.achievement.id),
    [showcaseAchievements],
  );

  const unlockedAchievements = useMemo(
    () => achievements?.filter((a) => a.unlockedAt !== null) ?? [],
    [achievements],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  const sortedAchievements = useMemo(() => {
    const selectedSet = new Set(initialSelectedIds);
    return [...unlockedAchievements].sort((a, b) => {
      const aSelected = selectedSet.has(a.achievement.id);
      const bSelected = selectedSet.has(b.achievement.id);
      if (aSelected !== bSelected) {
        return aSelected ? -1 : 1;
      }
      return b.achievement.points - a.achievement.points;
    });
  }, [unlockedAchievements, initialSelectedIds]);

  const toggleSelection = (achievementId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(achievementId)) {
        return prev.filter((id) => id !== achievementId);
      }
      if (prev.length >= MAX_SHOWCASE) {
        return prev;
      }
      return [...prev, achievementId];
    });
  };

  const handleConfirm = async (e: React.MouseEvent | React.KeyboardEvent) => {
    try {
      await setShowcase(selectedIds);
      displayToast('Achievement showcase updated');
      onRequestClose?.(e);
    } catch {
      displayToast('Failed to update showcase');
    }
  };

  const hasChanges =
    JSON.stringify([...selectedIds].sort()) !==
    JSON.stringify([...initialSelectedIds].sort());

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={onRequestClose} />
      <Modal.Body className="flex flex-col gap-4">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
          Achievement Showcase
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Select up to {MAX_SHOWCASE} unlocked achievements to feature on your
          profile ({selectedIds.length}/{MAX_SHOWCASE} selected)
        </Typography>

        {sortedAchievements.length === 0 && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            No unlocked achievements yet.
          </Typography>
        )}

        {sortedAchievements.length > 0 && (
          <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
            {sortedAchievements.map((userAchievement) => {
              const isSelected = selectedIds.includes(
                userAchievement.achievement.id,
              );
              const isDisabled =
                !isSelected && selectedIds.length >= MAX_SHOWCASE;

              return (
                <button
                  key={userAchievement.achievement.id}
                  type="button"
                  className={classNames(
                    'flex items-center gap-3 rounded-12 border p-3 transition-colors',
                    isSelected
                      ? 'border-accent-cabbage-default bg-surface-float'
                      : 'border-border-subtlest-tertiary bg-surface-float',
                    isDisabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:border-accent-cabbage-default',
                  )}
                  onClick={() =>
                    toggleSelection(userAchievement.achievement.id)
                  }
                  disabled={isDisabled}
                >
                  <LazyImage
                    imgSrc={userAchievement.achievement.image}
                    imgAlt={userAchievement.achievement.name}
                    className="size-10 rounded-10 object-cover"
                    fallbackSrc="https://daily.dev/default-achievement.png"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <Typography
                      type={TypographyType.Callout}
                      bold
                      className="truncate"
                    >
                      {userAchievement.achievement.name}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      className="line-clamp-1"
                    >
                      {userAchievement.achievement.description}
                    </Typography>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {userAchievement.achievement.points} pts
                    </Typography>
                    <div
                      className={classNames(
                        'flex size-6 items-center justify-center rounded-8 border',
                        isSelected
                          ? 'border-accent-cabbage-default bg-accent-cabbage-default'
                          : 'border-border-subtlest-primary',
                      )}
                    >
                      {isSelected && <VIcon className="size-4 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          className="w-full"
          disabled={isSetPending || !hasChanges}
          onClick={handleConfirm}
        >
          {isSetPending ? 'Saving...' : 'Confirm'}
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default AchievementShowcaseModal;

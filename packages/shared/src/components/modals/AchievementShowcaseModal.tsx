import type { MouseEvent, ReactElement } from 'react';
import React, { useState, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonVariant } from '../buttons/Button';
import { LazyImage } from '../LazyImage';
import type { PublicProfile } from '../../lib/user';
import { useProfileAchievements } from '../../hooks/profile/useProfileAchievements';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { updateShowcasedAchievements } from '../../graphql/user/achievements';
import { useShowcasedAchievements } from '../../hooks/profile/useShowcasedAchievements';
import { useToastNotification } from '../../hooks/useToastNotification';
import { VIcon } from '../icons';
import { IconSize } from '../Icon';

const MAX_SHOWCASED = 3;

interface AchievementShowcaseModalProps extends ModalProps {
  user: PublicProfile;
}

const AchievementShowcaseModal = ({
  user,
  onRequestClose,
  ...modalProps
}: AchievementShowcaseModalProps): ReactElement => {
  const { achievements: allAchievements, isPending: isLoadingAll } =
    useProfileAchievements(user);
  const { achievements: currentShowcased } = useShowcasedAchievements(user);
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();

  const unlockedAchievements = useMemo(
    () => allAchievements?.filter((a) => a.unlockedAt !== null) ?? [],
    [allAchievements],
  );

  const initialSelected = useMemo(
    () => new Set(currentShowcased?.map((a) => a.achievement.id) ?? []),
    [currentShowcased],
  );

  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  const toggleSelection = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SHOWCASED) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const hasChanged = useMemo(() => {
    if (selected.size !== initialSelected.size) {
      return true;
    }
    return Array.from(selected).some((id) => !initialSelected.has(id));
  }, [selected, initialSelected]);

  const { mutate: saveShowcase, isPending: isSaving } = useMutation({
    mutationFn: () => updateShowcasedAchievements(Array.from(selected)),
    onSuccess: () => {
      const queryKey = generateQueryKey(
        RequestKey.ShowcasedAchievements,
        user,
        'profile',
      );
      queryClient.invalidateQueries({ queryKey });
      displayToast('Achievement showcase updated');
    },
    onError: () => {
      displayToast('Failed to update showcase');
    },
  });

  const handleConfirm = (e: MouseEvent) => {
    saveShowcase(undefined, {
      onSuccess: () => {
        onRequestClose(e);
      },
    });
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={onRequestClose} />
      <div className="flex flex-col p-6">
        <Typography type={TypographyType.Title3} bold>
          Select Achievements to Showcase
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="mt-1"
        >
          {selected.size}/{MAX_SHOWCASED} selected
        </Typography>

        {isLoadingAll && (
          <div className="mt-4 flex items-center justify-center py-8">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              Loading achievements...
            </Typography>
          </div>
        )}
        {!isLoadingAll && unlockedAchievements.length === 0 && (
          <div className="mt-4 flex items-center justify-center py-8">
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              No unlocked achievements yet
            </Typography>
          </div>
        )}
        {!isLoadingAll && unlockedAchievements.length > 0 && (
          <div className="mt-4 grid max-h-96 grid-cols-1 gap-3 overflow-y-auto tablet:grid-cols-2">
            {unlockedAchievements.map((ua) => {
              const isSelected = selected.has(ua.achievement.id);
              const isDisabled = !isSelected && selected.size >= MAX_SHOWCASED;

              return (
                <button
                  key={ua.achievement.id}
                  type="button"
                  className={classNames(
                    'flex items-center gap-3 rounded-12 border p-3 text-left transition-colors',
                    isSelected
                      ? 'border-accent-cabbage-default bg-surface-float'
                      : 'border-border-subtlest-tertiary',
                    isDisabled
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:border-border-subtlest-secondary',
                  )}
                  onClick={() =>
                    !isDisabled && toggleSelection(ua.achievement.id)
                  }
                  disabled={isDisabled}
                >
                  <div className="relative flex size-10 shrink-0 items-center justify-center">
                    <LazyImage
                      imgSrc={ua.achievement.image}
                      imgAlt={ua.achievement.name}
                      className="size-10 rounded-10 object-cover"
                      fallbackSrc="https://daily.dev/default-achievement.png"
                    />
                    {isSelected && (
                      <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent-cabbage-default">
                        <VIcon
                          className="text-white"
                          secondary={false}
                          size={IconSize.XXSmall}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Primary}
                      bold
                      className="truncate"
                    >
                      {ua.achievement.name}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      className="truncate"
                    >
                      {ua.achievement.points} pts
                    </Typography>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <Button
          className="mt-4"
          variant={ButtonVariant.Primary}
          disabled={!hasChanged || isSaving}
          onClick={handleConfirm}
          loading={isSaving}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default AchievementShowcaseModal;

import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalClose } from '../common/ModalClose';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { ProfilePicture, ProfileImageSize } from '../../ProfilePicture';
import { LazyImage } from '../../LazyImage';
import { Loader } from '../../Loader';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useProfileAchievements } from '../../../hooks/profile/useProfileAchievements';
import type { UserAchievement } from '../../../graphql/user/achievements';
import { getTargetCount } from '../../../graphql/user/achievements';
import { formatDate, TimeFormatType } from '../../../lib/dateFormat';
import type { PublicProfile } from '../../../lib/user';

interface CompareAchievementsModalProps extends ModalProps {
  profileUser: PublicProfile;
  profileAchievements: UserAchievement[];
}

/**
 * Sorts achievements by the logged user's unlock status, matching AchievementsList:
 * 1. Unlocked first
 * 2. Among unlocked: rarest first, then highest points
 * 3. Among locked: highest progress ratio first
 */
const sortByMyStatus = (
  achievements: UserAchievement[],
  myMap: Map<string, UserAchievement>,
): UserAchievement[] => {
  return [...achievements].sort((a, b) => {
    const myA = myMap.get(a.achievement.id);
    const myB = myMap.get(b.achievement.id);
    const aUnlocked = myA?.unlockedAt != null;
    const bUnlocked = myB?.unlockedAt != null;

    if (aUnlocked && !bUnlocked) {
      return -1;
    }
    if (!aUnlocked && bUnlocked) {
      return 1;
    }

    if (aUnlocked && bUnlocked) {
      const rarityA = a.achievement.rarity ?? Infinity;
      const rarityB = b.achievement.rarity ?? Infinity;
      if (rarityA !== rarityB) {
        return rarityA - rarityB;
      }
      return b.achievement.points - a.achievement.points;
    }

    const targetA = getTargetCount(a.achievement);
    const targetB = getTargetCount(b.achievement);
    const progressA = targetA > 0 ? (myA?.progress ?? 0) / targetA : 0;
    const progressB = targetB > 0 ? (myB?.progress ?? 0) / targetB : 0;

    return progressB - progressA;
  });
};

export const CompareAchievementsModal = ({
  profileUser,
  profileAchievements,
  onRequestClose,
  ...props
}: CompareAchievementsModalProps): ReactElement => {
  const { user: loggedUser } = useAuthContext();
  const { achievements: myAchievements, isPending } =
    useProfileAchievements(loggedUser);

  const { sorted, myMap, theirMap } = useMemo(() => {
    const empty = {
      sorted: [] as UserAchievement[],
      myMap: new Map<string, UserAchievement>(),
      theirMap: new Map<string, UserAchievement>(),
    };

    if (!myAchievements) {
      return empty;
    }

    const my = new Map(myAchievements.map((ua) => [ua.achievement.id, ua]));
    const theirs = new Map(
      profileAchievements.map((ua) => [ua.achievement.id, ua]),
    );

    // Build deduplicated list from both sets
    const allIds = new Set([...my.keys(), ...theirs.keys()]);
    const allAchievements = Array.from(allIds).reduce<UserAchievement[]>(
      (acc, id) => {
        const ua = my.get(id) ?? theirs.get(id);
        if (ua) {
          acc.push(ua);
        }
        return acc;
      },
      [],
    );

    return {
      sorted: sortByMyStatus(allAchievements, my),
      myMap: my,
      theirMap: theirs,
    };
  }, [myAchievements, profileAchievements]);

  const handleClose = (event?: React.MouseEvent | React.KeyboardEvent): void =>
    onRequestClose?.(event);

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={handleClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={handleClose} />
      <Modal.Body className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col items-center gap-1">
            <ProfilePicture user={loggedUser} size={ProfileImageSize.Large} />
            <Typography
              type={TypographyType.Callout}
              bold
              className="text-accent-cheese-default"
            >
              {loggedUser?.name ?? 'You'}
            </Typography>
          </div>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Tertiary}
            bold
          >
            vs
          </Typography>
          <div className="flex flex-col items-center gap-1">
            <ProfilePicture user={profileUser} size={ProfileImageSize.Large} />
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
              bold
            >
              {profileUser.name}
            </Typography>
          </div>
        </div>

        {isPending && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader className="size-8" />
            <Typography type={TypographyType.Callout} bold>
              Loading achievements...
            </Typography>
          </div>
        )}

        {!isPending && sorted.length > 0 && (
          <div className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto">
            {sorted.map((ua) => {
              const myUa = myMap.get(ua.achievement.id);
              const theirUa = theirMap.get(ua.achievement.id);
              const eitherUnlocked =
                myUa?.unlockedAt != null || theirUa?.unlockedAt != null;

              return (
                <div
                  key={ua.achievement.id}
                  className="flex gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3"
                >
                  <div
                    className={classNames(
                      'flex size-10 shrink-0 items-center justify-center rounded-10',
                      !eitherUnlocked && 'opacity-50 grayscale',
                    )}
                  >
                    <LazyImage
                      imgSrc={ua.achievement.image}
                      imgAlt={ua.achievement.name}
                      className="size-10 rounded-10 object-cover"
                      fallbackSrc="https://daily.dev/default-achievement.png"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Typography
                        type={TypographyType.Callout}
                        tag={TypographyTag.Span}
                        color={
                          eitherUnlocked
                            ? TypographyColor.Primary
                            : TypographyColor.Tertiary
                        }
                        bold
                        className="truncate"
                      >
                        {ua.achievement.name}
                      </Typography>
                      <Typography
                        type={TypographyType.Footnote}
                        color={TypographyColor.Tertiary}
                        bold
                        className="shrink-0"
                      >
                        {ua.achievement.points} pts
                      </Typography>
                    </div>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      className="line-clamp-1"
                    >
                      {ua.achievement.description}
                    </Typography>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {myUa?.unlockedAt && (
                        <Typography
                          type={TypographyType.Caption1}
                          className="text-accent-cheese-default"
                        >
                          {loggedUser?.name ?? 'You'} &middot; Unlocked{' '}
                          {formatDate({
                            value: myUa.unlockedAt,
                            type: TimeFormatType.Post,
                          })}
                        </Typography>
                      )}
                      {theirUa?.unlockedAt && (
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                        >
                          {profileUser.name} &middot; Unlocked{' '}
                          {formatDate({
                            value: theirUa.unlockedAt,
                            type: TimeFormatType.Post,
                          })}
                        </Typography>
                      )}
                      {!myUa?.unlockedAt && !theirUa?.unlockedAt && (
                        <Typography
                          type={TypographyType.Caption1}
                          color={TypographyColor.Tertiary}
                        >
                          Locked
                        </Typography>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isPending && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
            >
              No achievements to compare
            </Typography>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CompareAchievementsModal;

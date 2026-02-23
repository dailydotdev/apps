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

interface MergedAchievement {
  achievementId: string;
  name: string;
  description: string;
  image: string;
  points: number;
  myUnlockedAt: string | null;
  theirUnlockedAt: string | null;
  myProgress: number;
  targetCount: number;
}

const sortMergedAchievements = (
  achievements: MergedAchievement[],
): MergedAchievement[] => {
  return [...achievements].sort((a, b) => {
    const aUnlocked = a.myUnlockedAt !== null;
    const bUnlocked = b.myUnlockedAt !== null;

    if (aUnlocked && !bUnlocked) {
      return -1;
    }
    if (!aUnlocked && bUnlocked) {
      return 1;
    }

    if (aUnlocked && bUnlocked) {
      return b.points - a.points;
    }

    const progressA = a.targetCount > 0 ? a.myProgress / a.targetCount : 0;
    const progressB = b.targetCount > 0 ? b.myProgress / b.targetCount : 0;

    return progressB - progressA;
  });
};

const mergeAchievements = (
  myAchievements: UserAchievement[],
  profileAchievements: UserAchievement[],
): MergedAchievement[] => {
  const myMap = new Map(myAchievements.map((ua) => [ua.achievement.id, ua]));
  const theirMap = new Map(
    profileAchievements.map((ua) => [ua.achievement.id, ua]),
  );

  const allIds = new Set([...myMap.keys(), ...theirMap.keys()]);

  return sortMergedAchievements(
    Array.from(allIds).reduce<MergedAchievement[]>((items, id) => {
      const mine = myMap.get(id);
      const theirs = theirMap.get(id);
      const achievement = mine?.achievement ?? theirs?.achievement;

      if (!achievement) {
        return items;
      }

      items.push({
        achievementId: id,
        name: achievement.name,
        description: achievement.description,
        image: achievement.image,
        points: achievement.points,
        myUnlockedAt: mine?.unlockedAt ?? null,
        theirUnlockedAt: theirs?.unlockedAt ?? null,
        myProgress: mine?.progress ?? 0,
        targetCount: getTargetCount(achievement),
      });

      return items;
    }, []),
  );
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

  const merged = useMemo(() => {
    if (!myAchievements) {
      return [];
    }

    return mergeAchievements(myAchievements, profileAchievements);
  }, [myAchievements, profileAchievements]);

  const handleClose = (event?: React.MouseEvent | React.KeyboardEvent): void =>
    onRequestClose?.(event);

  const isEitherUnlocked = (item: MergedAchievement): boolean =>
    item.myUnlockedAt !== null || item.theirUnlockedAt !== null;

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

        {!isPending && merged.length > 0 && (
          <div className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto">
            {merged.map((item) => (
              <div
                key={item.achievementId}
                className="flex gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3"
              >
                <div
                  className={classNames(
                    'flex size-10 shrink-0 items-center justify-center rounded-10',
                    !isEitherUnlocked(item) && 'opacity-50 grayscale',
                  )}
                >
                  <LazyImage
                    imgSrc={item.image}
                    imgAlt={item.name}
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
                        isEitherUnlocked(item)
                          ? TypographyColor.Primary
                          : TypographyColor.Tertiary
                      }
                      bold
                      className="truncate"
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                      bold
                      className="shrink-0"
                    >
                      {item.points} pts
                    </Typography>
                  </div>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                    className="line-clamp-1"
                  >
                    {item.description}
                  </Typography>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {item.myUnlockedAt && (
                      <Typography
                        type={TypographyType.Caption1}
                        className="text-accent-cheese-default"
                      >
                        {loggedUser?.name ?? 'You'} &middot; Unlocked{' '}
                        {formatDate({
                          value: item.myUnlockedAt,
                          type: TimeFormatType.Post,
                        })}
                      </Typography>
                    )}
                    {item.theirUnlockedAt && (
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        {profileUser.name} &middot; Unlocked{' '}
                        {formatDate({
                          value: item.theirUnlockedAt,
                          type: TimeFormatType.Post,
                        })}
                      </Typography>
                    )}
                    {!item.myUnlockedAt && !item.theirUnlockedAt && (
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
            ))}
          </div>
        )}

        {!isPending && merged.length === 0 && (
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

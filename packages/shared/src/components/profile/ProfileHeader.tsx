import React from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon, EditIcon } from '../icons';
import type { PublicProfile } from '../../lib/user';
import type { UserStatsProps } from './UserStats';
import { UserStats } from './UserStats';
import JoinedDate from './JoinedDate';
import { Separator } from '../cards/common/common';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize } from '../ProfilePicture';
import { VerifiedCompanyUserBadge } from '../VerifiedCompanyUserBadge';
import { locationToString } from '../../lib/utils';
import { IconSize } from '../Icon';
import { fallbackImages } from '../../lib/config';
import { ProfileDesktopPwaBackButton } from './ProfileBackButton';
import { ProfileShareButton } from './ProfileShareButton';
import { useShareProfileEnabled } from '../../hooks/profile/useShareProfileEnabled';

import { ElementPlaceholder } from '../ElementPlaceholder';

const ProfileActionsSkeleton = () => (
  <div className="flex h-12 items-center gap-2">
    <ElementPlaceholder className="h-12 w-18 rounded-16" />
    <ElementPlaceholder className="h-12 w-18 rounded-16" />
  </div>
);

const ProfileActions = dynamic(
  () =>
    import(
      /* webpackChunkName: "profileActions" */
      './ProfileActions'
    ),
  {
    ssr: false,
    loading: ProfileActionsSkeleton,
  },
);

type ProfileHeaderProps = {
  user: PublicProfile;
  userStats: Omit<UserStatsProps['stats'], 'reputation'>;
  isSameUser?: boolean;
  isPreviewMode?: boolean;
};

const ProfileHeader = ({
  user,
  userStats,
  isSameUser: propIsSameUser,
  isPreviewMode,
}: ProfileHeaderProps) => {
  const { name, username, bio, image, cover, isPlus } = user;
  const { user: loggedUser } = useAuthContext();
  const isSameUser = propIsSameUser ?? loggedUser?.id === user.id;
  const isShareEnabled = useShareProfileEnabled();

  return (
    <div className="relative w-full overflow-hidden laptop:rounded-t-16">
      <ProfileDesktopPwaBackButton className="absolute left-4 top-4 z-1" />
      <div className="h-36">
        <Image src={cover} alt="Cover" className="h-full w-full object-cover" />
      </div>
      <Image
        src={image}
        fallbackSrc={fallbackImages.avatar}
        alt="Avatar"
        className="absolute left-6 top-16 h-[7.5rem] w-[7.5rem] rounded-16 object-cover"
      />
      <div className="flex flex-col gap-3 px-6">
        {/* Bottom-anchored to the avatar rather than spaced off the cover:
            the cover is h-36 (9rem) and the avatar hangs down to 11.5rem, so
            a 2.5rem row ending flush puts the controls on the avatar's bottom
            edge at any button height. Control keeps today's centred row. */}
        <div
          className={classNames(
            'mb-4 ml-auto flex gap-2',
            isShareEnabled ? 'h-10 items-end' : 'mt-2 items-center',
          )}
        >
          {isShareEnabled && (
            <ProfileShareButton user={user} isSameUser={isSameUser} />
          )}
          {/* On public profiles the edit button only reserves the slot's
              height; the share button now fills it, so drop the placeholder. */}
          {(isSameUser || !isShareEnabled) && (
            <Link passHref href={`${webappUrl}settings/profile`}>
              <Button
                className={classNames(
                  !isShareEnabled && 'text-text-secondary',
                  !isSameUser && 'invisible',
                )}
                tag="a"
                disabled={!isSameUser}
                // Matches the share control beside it. Control users, who get
                // no share button, keep the Float Medium button that ships
                // today.
                variant={
                  isShareEnabled ? ButtonVariant.Subtle : ButtonVariant.Float
                }
                size={isShareEnabled ? ButtonSize.Small : ButtonSize.Medium}
                icon={<EditIcon />}
                aria-label="Edit profile"
              />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Typography type={TypographyType.Title2} bold>
            {name}
          </Typography>
          {isPlus && (
            <DevPlusIcon
              className="text-action-plus-default"
              size={IconSize.Size16}
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          {bio && <Typography type={TypographyType.Body}>{bio}</Typography>}
          <div className="flex items-center">
            {!!user?.companies?.length && (
              <VerifiedCompanyUserBadge
                size={ProfileImageSize.XSmall}
                user={user}
                showCompanyName
                showVerified={false}
                companyNameTypography={{
                  type: TypographyType.Subhead,
                }}
              />
            )}
            {!!user?.companies?.length && user?.location && (
              <Separator className="text-text-secondary" />
            )}
            {user?.location && (
              <Typography
                type={TypographyType.Subhead}
                color={TypographyColor.Secondary}
              >
                {locationToString(user.location)}
              </Typography>
            )}
          </div>
          <div className="flex items-center">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Secondary}
            >
              @{username}
            </Typography>
            <Separator className="text-text-secondary" />
            <JoinedDate
              className="text-text-secondary typo-subhead"
              date={new Date(user.createdAt)}
              dateFormat="MMM d. yyyy"
            />
          </div>
          {!isSameUser && (
            <ProfileActions user={user} isPreviewMode={isPreviewMode} />
          )}
          <UserStats
            userId={user.id}
            stats={{ ...userStats, reputation: user.reputation }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

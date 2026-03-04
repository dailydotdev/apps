import React from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon, EditIcon, SparkleIcon } from '../icons';
import type { PublicProfile } from '../../lib/user';
import type { UserStatsProps } from './UserStats';
import { UserStats } from './UserStats';
import JoinedDate from './JoinedDate';
import { Separator } from '../cards/common/common';
import { Button, ButtonVariant, ButtonSize } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize } from '../ProfilePicture';
import { VerifiedCompanyUserBadge } from '../VerifiedCompanyUserBadge';
import { locationToString } from '../../lib/utils';
import { IconSize } from '../Icon';
import { fallbackImages } from '../../lib/config';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

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
  const { name, username, bio, image, cover, isPlus, activeDecoration } = user;
  const { user: loggedUser } = useAuthContext();
  const { openModal } = useLazyModal();
  const isSameUser = propIsSameUser ?? loggedUser?.id === user.id;

  const handleOpenDecorationModal = () => {
    openModal({ type: LazyModal.DecorationSelection });
  };

  return (
    <div className="relative w-full overflow-hidden laptop:rounded-t-16">
      <div className="h-36">
        <Image src={cover} alt="Cover" className="h-full w-full object-cover" />
      </div>
      <div className="absolute left-6 top-16 flex flex-col items-center gap-2">
        <span className="relative inline-flex items-center justify-center">
          {activeDecoration && (
            <img
              src={activeDecoration.media}
              alt=""
              className="pointer-events-none absolute z-modal"
              aria-hidden="true"
            />
          )}
          <Image
            src={image}
            fallbackSrc={fallbackImages.avatar}
            alt="Avatar"
            className="h-[7.5rem] w-[7.5rem] rounded-16 object-cover"
          />
        </span>
        {isSameUser && !isPreviewMode && (
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.XSmall}
            icon={<SparkleIcon />}
            onClick={handleOpenDecorationModal}
            aria-label="Edit avatar decoration"
          />
        )}
      </div>
      <div className="flex flex-col gap-3 px-6">
        <Link passHref href={`${webappUrl}settings/profile`}>
          <Button
            className={classNames(
              'mb-4 ml-auto mt-2 text-text-secondary',
              !isSameUser && 'invisible',
            )}
            tag="a"
            disabled={!isSameUser}
            type={ButtonVariant.Float}
            icon={<EditIcon />}
            aria-label="Edit profile"
          />
        </Link>
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
            {user?.companies?.length > 0 && (
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
            {user?.companies?.length > 0 && user?.location && (
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

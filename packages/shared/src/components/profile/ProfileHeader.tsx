import React from 'react';
import dynamic from 'next/dynamic';
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
import { Button, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import Link from '../utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { ProfileImageSize } from '../ProfilePicture';
import { VerifiedCompanyUserBadge } from '../VerifiedCompanyUserBadge';
import { locationToString } from '../../lib/utils';
import { IconSize } from '../Icon';

const ProfileActions = dynamic(
  () =>
    import(
      /* webpackChunkName: "profileActions" */
      './ProfileActions'
    ),
  {
    ssr: false,
  },
);

type ProfileHeaderProps = {
  user: PublicProfile;
  userStats: Omit<UserStatsProps['stats'], 'reputation'>;
};

const ProfileHeader = ({ user, userStats }: ProfileHeaderProps) => {
  const { name, username, bio, image, cover, isPlus } = user;
  const { user: loggedUser } = useAuthContext();
  const isSameUser = loggedUser?.id === user.id;
  return (
    <div className="relative w-full overflow-hidden laptop:rounded-t-16">
      <div className="h-24">
        <Image src={cover} alt="Cover" className="h-full w-full object-cover" />
      </div>
      <Image
        src={image}
        alt="Avatar"
        className="absolute left-6 top-6 h-[7.5rem] w-[7.5rem] rounded-16 object-cover"
      />
      <div className="flex flex-col gap-3 px-6">
        <Link passHref href={`${webappUrl}/settings/profile`}>
          <Button
            className="mb-4 ml-auto mt-2 text-text-secondary"
            tag="a"
            type={ButtonVariant.Float}
            icon={<EditIcon />}
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
          {!isSameUser && <ProfileActions user={user} />}
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

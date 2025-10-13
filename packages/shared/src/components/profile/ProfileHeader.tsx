import React from 'react';
import { Image } from '../image/Image';
import { Typography, TypographyType } from '../typography/Typography';
import { EditIcon, PlusIcon } from '../icons';
import type { PublicProfile } from '../../lib/user';
import type { UserStatsProps } from './UserStats';
import { UserStats } from './UserStats';
import JoinedDate from './JoinedDate';
import { Separator } from '../cards/common/common';
import { Button, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import Link from '../utilities/Link';

type ProfileHeaderProps = {
  user: PublicProfile;
  userStats?: UserStatsProps['stats'];
};

const ProfileHeader = ({ user, userStats }: ProfileHeaderProps) => {
  const { name, username, bio, image, cover, isPlus } = user;
  return (
    <div className="relative w-full overflow-hidden rounded-t-16">
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
        <div className="flex gap-1">
          <Typography type={TypographyType.Title2} bold>
            {name}
          </Typography>
          {isPlus && <PlusIcon />}
        </div>
        <div className="flex flex-col gap-2">
          {bio && <Typography type={TypographyType.Body}>{bio}</Typography>}
          {/* TODO: Implement company badge from experience when implemented. We will have to either update the VerifiedCompanyUserBadge component, or add the badge + job separately here */}
          {/* {user?.companies?.length > 0 && (
            <div className="flex">
              <VerifiedCompanyUserBadge
                size={ProfileImageSize.Small}
                user={user}
                showCompanyName
                showVerified
              />
            </div>
          )} */}
          <div className="flex items-center">
            <Typography type={TypographyType.Subhead}>@{username}</Typography>
            <Separator />
            <JoinedDate
              className="text-text-secondary typo-subhead"
              date={new Date(user.createdAt)}
              dateFormat="MMM d. yyyy"
            />
          </div>
          <UserStats userId={user.id} stats={userStats} />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

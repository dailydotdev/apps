import React from 'react';
import type { UserShortProfile } from '../../../lib/user';
import EntityCard from './EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { DevPlusIcon } from '../../icons';
import { VerifiedCompanyUserBadge } from '../../VerifiedCompanyUserBadge';
import { ProfileImageSize } from '../../ProfilePicture';
import { ReputationUserBadge } from '../../ReputationUserBadge';
import { IconSize } from '../../Icon';
import JoinedDate from '../../profile/JoinedDate';

type Props = {
  user: UserShortProfile;
};

const UserEntityCard = ({ user }: Props) => {
  return (
    <EntityCard
      image={user.image}
      type="user"
      entityId={user.id}
      entityName={user.username}
    >
      <div className="flex w-full flex-col gap-2">
        <Typography
          className="flex"
          type={TypographyType.Body}
          color={TypographyColor.Primary}
          bold
        >
          {user.name ?? user.username}
          {user.isPlus && (
            <DevPlusIcon className="ml-1 text-action-plus-default" />
          )}
        </Typography>
        <div className="flex items-center gap-1">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            @{user.username}
          </Typography>
          <JoinedDate
            className="text-text-quaternary typo-footnote"
            date={new Date(user.createdAt)}
            dateFormat="MMM d. yyyy"
          />
        </div>
        <div className="flex gap-2">
          <div className="rounded-8 border border-border-subtlest-tertiary px-2">
            <ReputationUserBadge
              iconProps={{
                size: IconSize.Small,
                className: 'text-accent-onion-default',
              }}
              user={user}
            />
          </div>
          <div className="flex items-center gap-1">
            <VerifiedCompanyUserBadge
              size={ProfileImageSize.Small}
              user={user}
            />
          </div>
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {user.bio}
        </Typography>
      </div>
    </EntityCard>
  );
};

export default UserEntityCard;

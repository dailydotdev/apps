import React, { useContext } from 'react';
import Link from '../../utilities/Link';
import type { UserShortProfile } from '../../../lib/user';
import { fallbackImages } from '../../../lib/config';
import EntityCard from './EntityCard';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { DevPlusIcon } from '../../icons';
import { VerifiedCompanyUserBadge } from '../../VerifiedCompanyUserBadge';
import { ProfileImageSize } from '../../ProfilePicture';
import { ReputationUserBadge } from '../../ReputationUserBadge';
import { IconSize } from '../../Icon';
import JoinedDate from '../../profile/JoinedDate';
import { FollowButton } from '../../contentPreference/FollowButton';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import { useContentPreferenceStatusQuery } from '../../../hooks/contentPreference/useContentPreferenceStatusQuery';
import AuthContext from '../../../contexts/AuthContext';
import { ButtonVariant } from '../../buttons/Button';
import EntityDescription from './EntityDescription';
import useShowFollowAction from '../../../hooks/useShowFollowAction';

type Props = {
  user?: UserShortProfile;
  className?: {
    container?: string;
  };
};

const UserEntityCard = ({ user, className }: Props) => {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === user?.id;
  const userId = user?.id ?? '';
  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: userId,
    entity: ContentPreferenceType.User,
  });
  const { isLoading } = useShowFollowAction({
    entityId: userId,
    entityType: ContentPreferenceType.User,
  });

  const { username, bio, name, image, isPlus, createdAt, id, permalink } =
    user || {};

  const showActionBtns = !!user && !isLoading && !isSameUser;

  if (!user || !id || !username || !permalink || !createdAt) {
    return null;
  }

  return (
    <EntityCard
      permalink={permalink}
      image={image || fallbackImages.avatar}
      type="user"
      className={{
        image: 'size-16 rounded-20',
        container: className?.container,
      }}
      entityName={username}
      actionButtons={
        showActionBtns && (
          <FollowButton
            variant={ButtonVariant.Primary}
            entityId={id}
            status={contentPreference?.status}
            showSubscribe={false}
            type={ContentPreferenceType.User}
            entityName={username}
          />
        )
      }
    >
      <div className="mt-2 flex w-full flex-col gap-3">
        <Link passHref href={permalink}>
          <Typography
            tag={TypographyTag.Link}
            className="flex"
            type={TypographyType.Body}
            color={TypographyColor.Primary}
            bold
          >
            {name ?? username}
            {isPlus && (
              <DevPlusIcon className="ml-1 text-action-plus-default" />
            )}
          </Typography>
        </Link>
        <div className="flex items-center gap-1">
          <Link passHref href={permalink}>
            <Typography
              tag={TypographyTag.Link}
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
            >
              @{username}
            </Typography>
          </Link>
          <JoinedDate
            className="text-text-quaternary typo-footnote"
            date={new Date(createdAt)}
            dateFormat="MMM d. yyyy"
          />
        </div>
        <div className="flex min-w-0 gap-2">
          {!!user?.reputation && (
            <div className="rounded-8 border border-border-subtlest-tertiary px-2">
              <ReputationUserBadge
                iconProps={{
                  size: IconSize.Small,
                  className: 'text-accent-onion-default',
                }}
                user={user}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <VerifiedCompanyUserBadge
              size={ProfileImageSize.Small}
              user={user}
              showCompanyName
              showVerified
            />
          </div>
        </div>
        {bio && <EntityDescription copy={bio} length={100} />}
      </div>
    </EntityCard>
  );
};

export default UserEntityCard;

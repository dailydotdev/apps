import React, { type ReactElement } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useAuthContext } from '../contexts/AuthContext';
import { useUserShortByIdQuery } from '../hooks/user/useUserShortByIdQuery';
import { ProfileImageSize, ProfilePicture } from './ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from './typography/Typography';
import { FollowButton } from './contentPreference/FollowButton';
import { ContentPreferenceType } from '../graphql/contentPreference';
import { Origin } from '../lib/log';
import { ButtonVariant } from './buttons/Button';
import { LoggedUser } from '../lib/user';
import { WithClassNameProps } from './utilities';

export const SharedByUserBanner = ({
  className,
}: WithClassNameProps): ReactElement => {
  const { user: currentUser } = useAuthContext();
  const { query } = useRouter();
  const userid = (query?.userid as string) || null;

  const { data: user } = useUserShortByIdQuery({ id: userid });

  if (!userid || userid === currentUser?.id || !user) {
    return null;
  }

  return (
    <div
      className={classNames(
        'mt-5 flex items-center gap-2 rounded-14 border border-brand-float bg-background-subtle p-2 laptop:mt-0',
        className,
      )}
    >
      <ProfilePicture
        user={user}
        size={ProfileImageSize.Large}
        nativeLazyLoading
      />
      <Typography
        truncate
        type={TypographyType.Subhead}
        color={TypographyColor.Secondary}
      >
        <strong>{user.name}</strong> Shared this post
      </Typography>
      <FollowButton
        className="ml-auto"
        userId={userid}
        type={ContentPreferenceType.User}
        entityName={`@${user.username}`}
        status={(user as LoggedUser).contentPreference?.status}
        origin={Origin.PostSharedBy}
        variant={ButtonVariant.Primary}
      />
    </div>
  );
};

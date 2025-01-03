import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useAuthContext } from '../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from './ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from './typography/Typography';
import { FollowButton } from './contentPreference/FollowButton';
import { ContentPreferenceType } from '../graphql/contentPreference';
import { Origin } from '../lib/log';
import type { WithClassNameProps } from './utilities';
import { useUserShortByIdQuery } from '../hooks/user/useUserShortByIdQuery';
import { useContentPreferenceStatusQuery } from '../hooks/contentPreference/useContentPreferenceStatusQuery';

export const SharedByUserBanner = ({
  className,
}: WithClassNameProps): ReactElement => {
  const { user: currentUser } = useAuthContext();
  const { query } = useRouter();
  const userid = (query?.userid as string) || null;

  const { data: contentPreference } = useContentPreferenceStatusQuery({
    id: userid,
    entity: ContentPreferenceType.User,
    queryOptions: { enabled: !!userid && userid !== currentUser?.id },
  });
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
        entityId={userid}
        type={ContentPreferenceType.User}
        entityName={`@${user.username}`}
        status={contentPreference?.status}
        origin={Origin.PostSharedBy}
      />
    </div>
  );
};

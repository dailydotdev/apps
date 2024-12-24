import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import type { ProfileLinkProps } from './ProfileLink';
import { ProfileLink } from './ProfileLink';
import type { ProfilePictureProps } from '../ProfilePicture';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import type { Author } from '../../graphql/comments';

interface ProfileImageLinkProps extends ProfileLinkProps {
  picture?: Omit<ProfilePictureProps, 'user'>;
  ref?: Ref<HTMLAnchorElement>;
  user: Pick<Author, 'id' | 'username' | 'permalink' | 'image'>;
}

function ProfileImageLinkComponent(
  {
    picture = { size: ProfileImageSize.Large },
    user,
    ...props
  }: ProfileImageLinkProps,
  ref?: Ref<HTMLAnchorElement>,
): ReactElement {
  return (
    <ProfileLink {...props} href={user.permalink} ref={ref}>
      <ProfilePicture {...picture} ref={null} user={user} nativeLazyLoading />
    </ProfileLink>
  );
}

export const ProfileImageLink = forwardRef(ProfileImageLinkComponent);

import React, { forwardRef, ReactElement, Ref } from 'react';

import { Author } from '../../graphql/comments';
import {
  ProfileImageSize,
  ProfilePicture,
  ProfilePictureProps,
} from '../ProfilePicture';
import { ProfileLink, ProfileLinkProps } from './ProfileLink';

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

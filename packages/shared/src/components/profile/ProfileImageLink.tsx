import React, { ReactElement } from 'react';
import { ProfileLink, ProfileLinkProps } from './ProfileLink';
import { ProfilePicture, ProfilePictureProps } from '../ProfilePicture';

interface ProfileImageLinkProps extends ProfileLinkProps {
  picture?: Omit<ProfilePictureProps, 'user'>;
}

export function ProfileImageLink({
  picture = { size: 'large' },
  ...props
}: ProfileImageLinkProps): ReactElement {
  return (
    <ProfileLink {...props}>
      <ProfilePicture {...picture} user={props.user} />
    </ProfileLink>
  );
}

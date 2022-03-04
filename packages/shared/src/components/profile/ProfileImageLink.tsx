import React, { forwardRef, ReactElement, Ref } from 'react';
import { ProfileLink, ProfileLinkProps } from './ProfileLink';
import { ProfilePicture, ProfilePictureProps } from '../ProfilePicture';

interface ProfileImageLinkProps extends ProfileLinkProps {
  picture?: Omit<ProfilePictureProps, 'user'>;
  ref?: Ref<HTMLAnchorElement>;
}

function ProfileImageLinkComponent(
  { picture = { size: 'large' }, ...props }: ProfileImageLinkProps,
  ref?: Ref<HTMLAnchorElement>,
): ReactElement {
  return (
    <ProfileLink {...props} ref={ref}>
      <ProfilePicture {...picture} user={props.user} />
    </ProfileLink>
  );
}

export const ProfileImageLink = forwardRef(ProfileImageLinkComponent);

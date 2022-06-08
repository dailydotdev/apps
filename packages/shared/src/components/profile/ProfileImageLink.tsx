import React, { forwardRef, ReactElement, Ref } from 'react';
import { ProfileLink, ProfileLinkProps } from './ProfileLink';
import { ProfilePicture, ProfilePictureProps } from '../ProfilePicture';
import { Author } from '../../graphql/comments';

interface ProfileImageLinkProps extends ProfileLinkProps {
  picture?: Omit<ProfilePictureProps, 'user'>;
  ref?: Ref<HTMLAnchorElement>;
  user: Author;
}

function ProfileImageLinkComponent(
  { picture = { size: 'large' }, ...props }: ProfileImageLinkProps,
  ref?: Ref<HTMLAnchorElement>,
): ReactElement {
  return (
    <ProfileLink {...props} ref={ref}>
      <ProfilePicture
        {...picture}
        ref={null}
        user={props.user}
        nativeLazyLoading
      />
    </ProfileLink>
  );
}

export const ProfileImageLink = forwardRef(ProfileImageLinkComponent);

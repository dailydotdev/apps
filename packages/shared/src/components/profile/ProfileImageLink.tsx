import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import type { ProfileLinkProps } from './ProfileLink';
import { ProfileLink } from './ProfileLink';
import { ProfileImageSize } from '../ProfilePicture';
import type { Author } from '../../graphql/comments';
import type { ProfilePictureWithDecorationProps } from './ProfilePictureWithDecoration';
import { ProfilePictureWithDecoration } from './ProfilePictureWithDecoration';
import type { Decoration } from '../../graphql/decorations';

interface ProfileImageLinkProps extends ProfileLinkProps {
  picture?: Omit<ProfilePictureWithDecorationProps, 'user' | 'decoration'>;
  ref?: Ref<HTMLAnchorElement>;
  user: Pick<Author, 'id' | 'username' | 'permalink' | 'image'> & {
    activeDecoration?: Pick<Decoration, 'id' | 'media'> | null;
  };
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
      <ProfilePictureWithDecoration
        {...picture}
        ref={null}
        user={user}
        decoration={user.activeDecoration}
        nativeLazyLoading
      />
    </ProfileLink>
  );
}

export const ProfileImageLink = forwardRef(ProfileImageLinkComponent);

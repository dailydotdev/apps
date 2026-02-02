import type { ReactElement } from 'react';
import React from 'react';
import { ProfileImageSize } from '../ProfilePicture';
import type { UserImageProps } from '../ProfilePicture';
import { useProfileCompletionIndicator } from '../../hooks/profile/useProfileCompletionIndicator';
import { ProfilePictureWithDecoration } from './ProfilePictureWithDecoration';
import type { Decoration } from '../../graphql/decorations';

interface ProfilePictureWithIndicatorProps {
  user: UserImageProps & {
    activeDecoration?: Pick<Decoration, 'id' | 'media'> | null;
  };
  size?: ProfileImageSize;
  className?: string;
  wrapperClassName?: string;
}

export function ProfilePictureWithIndicator({
  user,
  size = ProfileImageSize.Medium,
  className,
  wrapperClassName = 'relative',
}: ProfilePictureWithIndicatorProps): ReactElement {
  const { showIndicator } = useProfileCompletionIndicator();

  return (
    <span className={wrapperClassName}>
      <ProfilePictureWithDecoration
        user={user}
        size={size}
        decoration={user.activeDecoration}
        nativeLazyLoading
        className={className}
      />
      {showIndicator && (
        <div className="absolute bottom-0 left-0 size-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent-cheese-default" />
      )}
    </span>
  );
}

import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ProfilePictureProps } from '../ProfilePicture';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import type { Decoration } from '../../graphql/decorations';

export interface ProfilePictureWithDecorationProps extends ProfilePictureProps {
  decoration?: Pick<Decoration, 'id' | 'media'> | null;
}

// Sizes that support decorations (Medium/32px and above)
const sizesWithDecorations: ProfileImageSize[] = [
  ProfileImageSize.Medium,
  ProfileImageSize.Large,
  ProfileImageSize.XLarge,
  ProfileImageSize.XXLarge,
  ProfileImageSize.XXXLarge,
  ProfileImageSize.XXXXLarge,
];

export const ProfilePictureWithDecoration = ({
  decoration,
  size = ProfileImageSize.XLarge,
  className,
  ...props
}: ProfilePictureWithDecorationProps): ReactElement => {
  const shouldShowDecoration =
    decoration && sizesWithDecorations.includes(size);

  if (!shouldShowDecoration) {
    return <ProfilePicture size={size} className={className} {...props} />;
  }

  return (
    <span
      className={classNames(
        'relative inline-flex items-center justify-center overflow-visible',
        className,
      )}
    >
      <img
        src={decoration.media}
        alt=""
        className="pointer-events-none absolute z-modal overflow-visible"
        aria-hidden="true"
      />
      <ProfilePicture size={size} {...props} />
    </span>
  );
};

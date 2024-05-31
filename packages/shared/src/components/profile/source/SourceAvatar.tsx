import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Image, ImageType } from '../../image/Image';
import { Source } from '../../../graphql/sources';
import { ProfileImageSize, sizeClasses } from '../../ProfilePicture';

export type SourceAvatarProps = {
  source: Pick<Source, 'image' | 'handle'>;
  className?: string;
  size?: ProfileImageSize;
};

export function SourceAvatar({
  source,
  size = ProfileImageSize.Large,
  className,
}: SourceAvatarProps): ReactElement {
  if (!source) {
    return null;
  }

  return (
    <Image
      className={classNames(
        'mr-2 rounded-full object-cover',
        sizeClasses[size],
        className,
      )}
      src={source.image}
      alt={`Avatar of ${source.handle}`}
      type={ImageType.Squad}
    />
  );
}

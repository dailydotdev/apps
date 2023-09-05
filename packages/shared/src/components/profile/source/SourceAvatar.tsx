import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Image } from '../../image/Image';
import { Source } from '../../../graphql/sources';
import { ProfileImageSize, sizeClasses } from '../../ProfilePicture';

interface SourceAvatarProps {
  source: Source;
  className?: string;
  size?: ProfileImageSize;
}

export function SourceAvatar({
  source,
  size = 'large',
  className,
}: SourceAvatarProps): ReactElement {
  if (!source) {
    return null;
  }

  return (
    <Image
      className={classNames(
        'object-cover mr-2 rounded-full',
        sizeClasses[size],
        className,
      )}
      src={source.image}
      alt={`Avatar of ${source.handle}`}
    />
  );
}

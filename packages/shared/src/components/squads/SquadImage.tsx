import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Squad } from '../../graphql/sources';
import { Image } from '../image/Image';
import { cloudinarySquadsImageFallback } from '../../lib/image';

interface SquadImageProps extends Squad {
  className?: string;
}

export const SquadImage = ({
  className,
  image,
  name,
  handle,
}: SquadImageProps): ReactElement => (
  <Image
    title={name}
    src={image ?? cloudinarySquadsImageFallback}
    alt={`${handle}'s logo`}
    fallbackSrc={cloudinarySquadsImageFallback}
    className={classNames('rounded-full object-cover', className)}
    loading="lazy"
  />
);

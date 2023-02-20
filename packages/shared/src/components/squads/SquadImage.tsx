import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Squad } from '../../graphql/squads';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';

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
    src={image ?? cloudinary.squads.imageFallback}
    alt={`${handle}'s logo`}
    fallbackSrc={cloudinary.squads.imageFallback}
    className={classNames('object-cover rounded-full', className)}
    loading="lazy"
  />
);

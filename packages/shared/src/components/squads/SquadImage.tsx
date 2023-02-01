import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Squad } from '../../graphql/squads';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';

export const SquadImage = ({
  className,
  image,
  name,
}: Squad & { className?: string }): ReactElement => (
  <Image
    title={name}
    src={image ?? cloudinary.squads.imageFallback}
    fallbackSrc={cloudinary.squads.imageFallback}
    className={classNames('object-cover rounded-full', className)}
    loading="lazy"
  />
);

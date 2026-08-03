import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { IconItemType, IconProps } from '../../Icon';
import Icon from '../../Icon';
import { Image } from '../../image/Image';
import { coreImage, disabledCoreImage } from '../../../lib/image';

// Unlike every other icon in the set this one is a raster <img>, so it inherits
// preflight's `img { max-width: 100% }`. In any box narrower than the requested
// icon size that caps the width while the size class keeps the height, and the
// default `object-fit: fill` stretches the art to match. `max-w-none` opts out
// of the cap and `object-contain` guarantees the aspect ratio regardless.
const coreImageClass = 'max-w-none object-contain';

const IconPrimary: IconItemType = ({ className, ...props }) => (
  <Image
    {...props}
    className={classNames(className, coreImageClass)}
    src={coreImage}
    alt="Core"
    fallbackSrc=""
  />
);

const IconSecondary: IconItemType = ({ className, ...props }) => (
  <Image
    {...props}
    className={classNames(className, coreImageClass)}
    src={disabledCoreImage}
    alt="Core"
    fallbackSrc=""
  />
);

export const CoreIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={IconPrimary} IconSecondary={IconSecondary} />
);

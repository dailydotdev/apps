import type { ReactElement } from 'react';
import React from 'react';
import type { IconItemType, IconProps } from '../../Icon';
import Icon from '../../Icon';
import { Image } from '../../image/Image';
import { coreImage, disabledCoreImage } from '../../../lib/image';

const IconPrimary: IconItemType = (props) => {
  return <Image {...props} src={coreImage} alt="Core" />;
};

const IconSecondary: IconItemType = (props) => {
  return <Image {...props} src={disabledCoreImage} alt="Core" />;
};

export const CoreIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={IconPrimary} IconSecondary={IconSecondary} />
);

import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import IconImage from './loader.svg';

export const LoaderIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={IconImage} IconSecondary={IconImage} />
);

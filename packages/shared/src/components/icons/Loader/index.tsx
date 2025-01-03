import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import IconImage from './loader.svg';

export const LoaderIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={IconImage} IconSecondary={IconImage} />
);

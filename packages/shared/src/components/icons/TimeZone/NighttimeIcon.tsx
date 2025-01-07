import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import SvgIcon from './timezone_nighttime.svg';

export const NighttimeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={SvgIcon} IconSecondary={SvgIcon} />
);

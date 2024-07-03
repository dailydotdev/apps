import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import SvgIcon from './timezone_nighttime.svg';

export const NighttimeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={SvgIcon} IconSecondary={SvgIcon} />
);

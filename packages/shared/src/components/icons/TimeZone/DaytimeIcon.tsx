import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import SvgIcon from './timezone_daytime.svg';

export const DaytimeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={SvgIcon} IconSecondary={SvgIcon} />
);

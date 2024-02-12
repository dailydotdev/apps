import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import PrimaryIcon from './primary.svg';
import SecondaryIcon from './secondary.svg';

export const DailyIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={PrimaryIcon} IconSecondary={SecondaryIcon} />
);

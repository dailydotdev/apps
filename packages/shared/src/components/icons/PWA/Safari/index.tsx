import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../../Icon';
import OutlinedIcon from './pwa.svg';

export const PWASafariIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={OutlinedIcon} />
);

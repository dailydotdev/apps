import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import MonoIcon from './mono.svg';
import ColorIcon from './color.svg';

export const YoutubeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={MonoIcon} IconSecondary={ColorIcon} />
);

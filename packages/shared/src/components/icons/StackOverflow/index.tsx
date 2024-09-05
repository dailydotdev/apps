import React, { ReactElement } from 'react';

import Icon, { IconProps } from '../../Icon';
import ColorIcon from './color.svg';
import MonoIcon from './mono.svg';

export const StackOverflowIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={MonoIcon} IconSecondary={ColorIcon} />
);

import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import MonoIcon from './mono.svg';

export const RoadmapIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={MonoIcon} IconSecondary={MonoIcon} />
);

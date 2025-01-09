import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import MonoIcon from './mono.svg';
import ColorIcon from './color.svg';

export const StackOverflowIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={MonoIcon} IconSecondary={ColorIcon} />
);

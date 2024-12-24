import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import ColorIcon from './color.svg';

export const SlackIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={ColorIcon} IconSecondary={ColorIcon} />
);

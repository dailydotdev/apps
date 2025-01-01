import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import Arrow from './arrow.svg';

export const DrawnArrowIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Arrow} IconSecondary={Arrow} />
);

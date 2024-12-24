import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../../Icon';
import Icon from '../../../Icon';
import Edge from './edge.svg';

export const EdgeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Edge} IconSecondary={Edge} />
);

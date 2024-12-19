import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../../Icon';
import Edge from './edge.svg';

export const EdgeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Edge} IconSecondary={Edge} />
);

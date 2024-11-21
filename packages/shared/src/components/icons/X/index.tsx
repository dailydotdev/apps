import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import Primary from './primary.svg';

export const XIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Primary} IconSecondary={Primary} />
);

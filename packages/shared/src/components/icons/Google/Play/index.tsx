import React, { ReactElement } from 'react';
import Primary from './primary.svg';
import type { IconProps } from '../../../Icon';
import Icon from '../../../Icon';

export const GooglePlayIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Primary} IconSecondary={Primary} />
);

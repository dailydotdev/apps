import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import WhiteIcon from './white.svg';

export const HashnodeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={WhiteIcon} IconSecondary={WhiteIcon} />
);

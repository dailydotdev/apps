import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import WhiteIcon from './white.svg';

export const HashnodeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={WhiteIcon} IconSecondary={WhiteIcon} />
);

import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import ColorIcon from './color.svg';

export const SlackIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={ColorIcon} IconSecondary={ColorIcon} />
);

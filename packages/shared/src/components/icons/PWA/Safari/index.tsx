import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../../Icon';
import Icon from '../../../Icon';
import OutlinedIcon from './pwa.svg';

export const PWASafariIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={OutlinedIcon} />
);

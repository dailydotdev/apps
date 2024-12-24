import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import OutlinedIcon from './outlined.svg';

export const AlertIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={OutlinedIcon} />
);

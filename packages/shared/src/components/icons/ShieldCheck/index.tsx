import type { type ReactElement } from 'react';
import React from 'react';
import type { type IconProps } from '../../Icon';
import Icon from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

export const ShieldCheckIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);

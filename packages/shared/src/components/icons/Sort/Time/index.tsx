import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

export const TimeSortIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);

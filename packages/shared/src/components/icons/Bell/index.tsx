import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

export const BellIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);
export * from './Add';
export * from './Disabled';
export * from './Notify';
export * from './Subscribed';

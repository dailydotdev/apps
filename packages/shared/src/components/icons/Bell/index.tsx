import React, { ReactElement } from 'react';

import Icon, { IconProps } from '../../Icon';
import FilledIcon from './filled.svg';
import OutlinedIcon from './outlined.svg';

export const BellIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);
export * from './Add';
export * from './Disabled';
export * from './Notify';
export * from './Subscribed';

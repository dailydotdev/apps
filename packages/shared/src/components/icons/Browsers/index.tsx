import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import Group from './group.svg';

export const BrowserGroupIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Group} IconSecondary={Group} />
);

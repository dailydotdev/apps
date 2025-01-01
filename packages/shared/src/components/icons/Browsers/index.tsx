import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import Group from './group.svg';

export const BrowserGroupIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Group} IconSecondary={Group} />
);

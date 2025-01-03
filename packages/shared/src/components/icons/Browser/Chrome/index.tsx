import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../../Icon';
import Icon from '../../../Icon';
import Chrome from './chrome.svg';

export const ChromeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Chrome} IconSecondary={Chrome} />
);

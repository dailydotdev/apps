import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../../Icon';
import Chrome from './chrome.svg';

export const ChromeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Chrome} IconSecondary={Chrome} />
);

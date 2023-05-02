import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import PrimaryIcon from './primary.svg';

const BrowsersIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={PrimaryIcon} IconSecondary={PrimaryIcon} />
);

export default BrowsersIcon;

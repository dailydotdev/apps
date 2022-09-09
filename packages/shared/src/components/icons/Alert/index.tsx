import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';

const AlertIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={OutlinedIcon} />
);

export default AlertIcon;

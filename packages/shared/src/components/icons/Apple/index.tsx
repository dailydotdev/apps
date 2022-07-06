import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import WhiteIcon from './white.svg';

const AppleIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconOutlined={WhiteIcon} IconFilled={WhiteIcon} />
);

export default AppleIcon;

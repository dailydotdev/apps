import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import WhiteIcon from './white.svg';
import ColorIcon from './color.svg';

const GoogleIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconOutlined={WhiteIcon} IconFilled={ColorIcon} />
);

export default GoogleIcon;

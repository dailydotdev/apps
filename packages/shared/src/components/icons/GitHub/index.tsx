import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import WhiteIcon from './white.svg';

const GitHubIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconFilled={WhiteIcon} IconOutlined={WhiteIcon} />
);

export default GitHubIcon;

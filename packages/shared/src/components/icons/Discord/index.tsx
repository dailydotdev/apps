import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import ColorIcon from './color.svg';

const DiscordIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconFilled={ColorIcon} IconOutlined={ColorIcon} />
);

export default DiscordIcon;

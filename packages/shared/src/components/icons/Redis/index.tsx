import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import WhiteIcon from './white.svg';

const RedisIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={WhiteIcon} IconSecondary={WhiteIcon} />
);

export default RedisIcon;

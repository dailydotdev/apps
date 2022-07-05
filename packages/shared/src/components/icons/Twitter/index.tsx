import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';

import WhiteIcon from './white.svg';
import ColorIcon from './color.svg';

const TwitterIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconFilled={ColorIcon} IconOutlined={WhiteIcon} />
);

export default TwitterIcon;

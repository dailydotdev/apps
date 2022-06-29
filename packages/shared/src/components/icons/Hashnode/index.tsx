import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import FilledIcon from './filled.svg';

const HashnodeIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconFilled={FilledIcon} />
);

export default HashnodeIcon;

import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

const AtIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);

export default AtIcon;

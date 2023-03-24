import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import FilledIcon from './filled.svg';
import OutlinedIcon from './outlined.svg';

const MegaphoneIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);

export default MegaphoneIcon;

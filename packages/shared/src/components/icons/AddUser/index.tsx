import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import FilledIcon from './filled.svg';
import OutlinedIcon from './outlined.svg';

const AddUserIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);

export default AddUserIcon;

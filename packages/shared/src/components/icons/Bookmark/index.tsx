import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';

const BookmarkIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconOutlined={OutlinedIcon} IconFilled={FilledIcon} />
);

export default BookmarkIcon;

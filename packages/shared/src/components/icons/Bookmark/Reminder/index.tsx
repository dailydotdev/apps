import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../../Icon';
import OutlinedIcon from './outlined.svg';

export const BookmarkReminderIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={OutlinedIcon} />
);

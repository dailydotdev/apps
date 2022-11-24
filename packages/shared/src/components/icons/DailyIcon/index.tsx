import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import DarkIcon from './primary.svg';

const DailyIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={DarkIcon} IconSecondary={DarkIcon} />
);

export default DailyIcon;

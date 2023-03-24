import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import Arrow from './arrow.svg';

const DrawnArrowIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={Arrow} IconSecondary={Arrow} />
);

export default DrawnArrowIcon;

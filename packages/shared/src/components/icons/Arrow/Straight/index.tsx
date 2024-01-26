import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../../Icon';
import FilledIcon from './filled.svg';

const StraightArrowIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={FilledIcon} IconSecondary={FilledIcon} />
);

export default StraightArrowIcon;

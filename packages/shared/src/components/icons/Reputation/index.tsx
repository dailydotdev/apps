import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import FilledIcon from './filled.svg';

export const ReputationIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={FilledIcon} IconSecondary={FilledIcon} />
);

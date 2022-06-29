import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import FilledIcon from './filled.svg';

const GitHubIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconFilled={FilledIcon} />
);

export default GitHubIcon;

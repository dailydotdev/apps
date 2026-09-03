import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import OutlinedIcon from './outlined.svg';
import FilledIcon from './filled.svg';
import OutlinedIconV2 from './outlined-v2.svg';
import FilledIconV2 from './filled-v2.svg';

export const DiscussIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIcon} IconSecondary={FilledIcon} />
);

export const DiscussIconV2 = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={OutlinedIconV2} IconSecondary={FilledIconV2} />
);

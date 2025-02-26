import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import SvgIcon from './outline.svg';

export const TipIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={SvgIcon} IconSecondary={SvgIcon} />
);

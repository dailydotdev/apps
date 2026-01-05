import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import IconSvg from './icon.svg';

export const SuperAgentIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={IconSvg} IconSecondary={IconSvg} />
);

import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import SquadIcon from './primary.svg';

export const DefaultSquadIcon = (props: IconProps): ReactElement => (
  <Icon
    className="text-white"
    {...props}
    IconPrimary={SquadIcon}
    IconSecondary={SquadIcon}
  />
);

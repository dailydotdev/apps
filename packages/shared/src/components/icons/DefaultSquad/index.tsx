import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import SquadIcon from './primary.svg';

export const DefaultSquadIcon = (props: IconProps): ReactElement => (
  <Icon
    className="text-white"
    {...props}
    IconPrimary={SquadIcon}
    IconSecondary={SquadIcon}
  />
);

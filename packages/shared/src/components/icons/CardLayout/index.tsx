import type { ReactElement } from 'react';
import React from 'react';
import type { IconProps } from '../../Icon';
import Icon from '../../Icon';
import CardsIcon from './cards.svg';
import ListIcon from './list.svg';

export const CardLayout = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={CardsIcon} IconSecondary={ListIcon} />
);

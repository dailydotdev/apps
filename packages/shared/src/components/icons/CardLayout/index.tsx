import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import CardsIcon from './cards.svg';
import ListIcon from './list.svg';

const CardLayout = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={CardsIcon} IconSecondary={ListIcon} />
);

export default CardLayout;

import React, { ReactElement } from 'react';
import Icon, { IconProps } from '../../Icon';
import WhiteIcon from './white.svg';
import ColorIcon from './color.svg';
import TertiaryIcon from './tertiary.svg';

const WhatsappIcon = (props: IconProps): ReactElement => (
  <Icon
    {...props}
    IconPrimary={WhiteIcon}
    IconSecondary={ColorIcon}
    IconTertiary={TertiaryIcon}
  />
);

export default WhatsappIcon;

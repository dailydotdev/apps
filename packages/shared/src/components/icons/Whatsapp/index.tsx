import React, { ReactElement } from 'react';

import Icon, { IconProps } from '../../Icon';
import ColorIcon from './color.svg';
import WhiteIcon from './white.svg';

export const WhatsappIcon = (props: IconProps): ReactElement => (
  <Icon {...props} IconPrimary={WhiteIcon} IconSecondary={ColorIcon} />
);

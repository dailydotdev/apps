import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { MenuIcon } from '../icons';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './Button';

type OptionsButtonProps = ButtonProps<AllowedTags> & {
  tooltipPlacement?: TooltipPosition;
};

const OptionsButton = ({
  className,
  tooltipPlacement = 'left',
  size = ButtonSize.Small,
  icon = <MenuIcon />,
  ...props
}: OptionsButtonProps): ReactElement => (
  <SimpleTooltip placement={tooltipPlacement} content="Options">
    <Button
      {...props}
      className={classNames('my-auto', className)}
      variant={ButtonVariant.Tertiary}
      icon={icon}
      size={size}
    />
  </SimpleTooltip>
);

export default OptionsButton;

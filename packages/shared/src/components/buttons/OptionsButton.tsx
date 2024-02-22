import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  AllowedTags,
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './Button';
import { MenuIcon } from '../icons';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';

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

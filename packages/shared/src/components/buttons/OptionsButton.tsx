import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { AllowedTags, ButtonProps } from './Button';
import { Button, ButtonSize, ButtonVariant } from './Button';
import { MenuIcon } from '../icons';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import type { TooltipPosition } from '../tooltips/BaseTooltipContainer';

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
      variant={ButtonVariant.Tertiary}
      {...props}
      className={classNames('my-auto', className)}
      icon={icon}
      size={size}
    />
  </SimpleTooltip>
);

export default OptionsButton;

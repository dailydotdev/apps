import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { AllowedTags, ButtonProps } from './Button';
import { Button, ButtonSize, ButtonVariant } from './Button';
import { MenuIcon } from '../icons';
import type { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { Tooltip } from '../tooltip/Tooltip';

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
  <Tooltip side={tooltipPlacement} content="Options">
    <Button
      variant={ButtonVariant.Tertiary}
      {...props}
      className={classNames('my-auto', className)}
      icon={icon}
      size={size}
    />
  </Tooltip>
);

export default OptionsButton;

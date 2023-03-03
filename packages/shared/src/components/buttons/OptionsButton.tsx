import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { AllowedTags, Button, ButtonProps, ButtonSize } from './Button';
import MenuIcon from '../icons/Menu';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { IconSize } from '../Icon';

type OptionsButtonProps = ButtonProps<AllowedTags> & {
  tooltipPlacement?: TooltipPosition;
};

const OptionsButton = ({
  className,
  tooltipPlacement = 'left',
  buttonSize = ButtonSize.Small,
  ...props
}: OptionsButtonProps): ReactElement => (
  <SimpleTooltip placement={tooltipPlacement} content="Options">
    <Button
      {...props}
      className={classNames('my-auto btn-tertiary', className)}
      icon={<MenuIcon />}
      buttonSize={buttonSize}
    />
  </SimpleTooltip>
);

export default OptionsButton;

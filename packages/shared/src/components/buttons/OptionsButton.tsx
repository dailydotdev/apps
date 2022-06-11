import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { AllowedTags, Button, ButtonProps } from './Button';
import MenuIcon from '../icons/Menu';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';

type OptionsButtonProps = ButtonProps<AllowedTags> & {
  tooltipPlacement?: TooltipPosition;
};

const OptionsButton = ({
  className,
  tooltipPlacement = 'left',
  ...props
}: OptionsButtonProps): ReactElement => (
  <SimpleTooltip placement={tooltipPlacement} content="Options">
    <Button
      {...props}
      className={classNames('my-auto btn-tertiary', className)}
      icon={<MenuIcon size="medium" />}
      buttonSize="small"
    />
  </SimpleTooltip>
);

export default OptionsButton;

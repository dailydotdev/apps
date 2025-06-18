import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { TooltipContentProps } from '@radix-ui/react-tooltip';
import type { AllowedTags, ButtonProps } from './Button';
import { Button, ButtonSize, ButtonVariant } from './Button';
import { MenuIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';

type OptionsButtonProps = ButtonProps<AllowedTags> &
  Pick<TooltipContentProps, 'side'>;

const OptionsButton = ({
  className,
  side = 'left',
  size = ButtonSize.Small,
  icon = <MenuIcon />,
  ...props
}: OptionsButtonProps): ReactElement => (
  <Tooltip side={side} content="Options">
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

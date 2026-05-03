import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { TooltipContentProps } from '@radix-ui/react-tooltip';
import type { AllowedTags, ButtonV2Props } from './ButtonV2';
import { ButtonV2, ButtonSize, ButtonVariant } from './ButtonV2';
import { MenuIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';

type OptionsButtonProps = ButtonV2Props<AllowedTags> &
  Pick<TooltipContentProps, 'side'>;

const OptionsButton = ({
  className,
  side = 'left',
  size = ButtonSize.Small,
  icon = <MenuIcon />,
  ...props
}: OptionsButtonProps): ReactElement => (
  <Tooltip side={side} content="Options">
    <ButtonV2
      variant={ButtonVariant.Tertiary}
      {...props}
      className={classNames('my-auto', className)}
      icon={icon}
      size={size}
    />
  </Tooltip>
);

export default OptionsButton;

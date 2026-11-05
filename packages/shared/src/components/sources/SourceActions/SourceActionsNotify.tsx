import type { ReactElement } from 'react';
import React from 'react';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Button } from '../../buttons/Button';
import { BellAddIcon, BellSubscribedIcon } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';

interface SourceActionsNotifyProps {
  haveNotificationsOn: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const SourceActionsNotify = (props: SourceActionsNotifyProps): ReactElement => {
  const {
    haveNotificationsOn,
    onClick,
    disabled,
    size = ButtonSize.Small,
    variant: variantOverride,
  } = props;

  const icon = haveNotificationsOn ? <BellSubscribedIcon /> : <BellAddIcon />;
  const label = `${haveNotificationsOn ? 'Disable' : 'Enable'} notifications`;
  const variant =
    variantOverride ??
    (haveNotificationsOn
    ? ButtonVariant.Subtle
    : ButtonVariant.Secondary);

  return (
    <Tooltip content={label}>
      <Button
        aria-label={label}
        icon={icon}
        onClick={onClick}
        size={size}
        title={label}
        variant={variant}
        disabled={disabled}
      />
    </Tooltip>
  );
};

export default SourceActionsNotify;

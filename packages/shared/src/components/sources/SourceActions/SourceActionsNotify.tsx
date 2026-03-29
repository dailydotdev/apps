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
  className?: string;
}

const SourceActionsNotify = (props: SourceActionsNotifyProps): ReactElement => {
  const { haveNotificationsOn, onClick, disabled, size, variant, className } =
    props;

  const icon = haveNotificationsOn ? <BellSubscribedIcon /> : <BellAddIcon />;
  const label = `${haveNotificationsOn ? 'Disable' : 'Enable'} notifications`;
  const buttonVariant =
    variant ??
    (haveNotificationsOn ? ButtonVariant.Subtle : ButtonVariant.Secondary);

  return (
    <Tooltip content={label}>
      <Button
        aria-label={label}
        className={className}
        icon={icon}
        onClick={onClick}
        size={size ?? ButtonSize.Small}
        title={label}
        variant={buttonVariant}
        disabled={disabled}
      />
    </Tooltip>
  );
};

export default SourceActionsNotify;

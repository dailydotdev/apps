import React, { ReactElement } from 'react';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import { Button } from '../../buttons/Button';
import { BellAddIcon, BellSubscribedIcon } from '../../icons';

interface SourceActionsNotifyProps {
  haveNotificationsOn: boolean;
  onClick: (e) => void;
  disabled?: boolean;
}

const SourceActionsNotify = (props: SourceActionsNotifyProps): ReactElement => {
  const { haveNotificationsOn, onClick, disabled } = props;

  const icon = haveNotificationsOn ? <BellSubscribedIcon /> : <BellAddIcon />;
  const label = `${haveNotificationsOn ? 'Disable' : 'Enable'} notifications`;
  const variant = haveNotificationsOn
    ? ButtonVariant.Subtle
    : ButtonVariant.Secondary;

  return (
    <SimpleTooltip content={label}>
      <Button
        aria-label={label}
        icon={icon}
        onClick={onClick}
        size={ButtonSize.Small}
        title={label}
        variant={variant}
        disabled={disabled}
      />
    </SimpleTooltip>
  );
};

export default SourceActionsNotify;

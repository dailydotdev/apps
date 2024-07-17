import React, { ReactElement } from 'react';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import SimpleTooltip from '../../tooltips/SimpleTooltip';
import { Button } from '../../buttons/Button';
import { BellAddIcon, BellSubscribedIcon } from '../../icons';

interface SourceActionsFollowProps {
  haveNotifications: boolean;
  onClick: () => void;
}

const SourceActionsFollow = (props: SourceActionsFollowProps): ReactElement => {
  const { haveNotifications, onClick } = props;

  const icon = haveNotifications ? <BellSubscribedIcon /> : <BellAddIcon />;
  const label = `${haveNotifications ? 'Disable' : 'Enable'} notifications`;
  const variant = haveNotifications
    ? ButtonVariant.Tertiary
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
      />
    </SimpleTooltip>
  );
};

export default SourceActionsFollow;

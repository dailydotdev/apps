import React, { ReactElement } from 'react';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import SimpleTooltip from '../../tooltips/SimpleTooltip';
import { Button } from '../../buttons/Button';
import { BellAddIcon, BellSubscribedIcon } from '../../icons';

type SourceSubscribeButtonViewProps = {
  isFollowing: boolean;
  onClick: () => void;
};

const SourceActionsFollow = (
  props: SourceSubscribeButtonViewProps,
): ReactElement => {
  const { isFollowing, onClick } = props;

  const icon = isFollowing ? <BellSubscribedIcon /> : <BellAddIcon />;
  const label = `${isFollowing ? 'Disable' : 'Enable'} notifications`;
  const variant = isFollowing
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

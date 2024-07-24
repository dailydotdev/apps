import React, { ReactElement } from 'react';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Button } from '../../buttons/Button';

interface SourceActionsFollowProps {
  className?: string;
  isFetching: boolean;
  isSubscribed: boolean;
  onClick: () => void;
  variant: ButtonVariant;
}

const SourceActionsFollow = (props: SourceActionsFollowProps): ReactElement => {
  const { className, isSubscribed, isFetching, onClick, variant } = props;
  const label = isSubscribed ? 'Unfollow' : 'Follow';
  return (
    <Button
      aria-label={label}
      className={className}
      disabled={isFetching}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={isSubscribed ? ButtonVariant.Tertiary : variant}
    >
      {label}
    </Button>
  );
};

export default SourceActionsFollow;

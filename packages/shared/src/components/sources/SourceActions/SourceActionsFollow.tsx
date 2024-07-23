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

  return (
    <Button
      aria-label={isSubscribed ? 'Unfollow' : 'Follow'}
      className={className}
      disabled={isFetching}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={variant}
    >
      {isSubscribed ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

export default SourceActionsFollow;

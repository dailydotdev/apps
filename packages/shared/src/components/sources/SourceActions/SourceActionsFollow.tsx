import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
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
  const [isHovered, setIsHovered] = useState(false);

  let label = isSubscribed ? 'Following' : 'Follow';

  if (isHovered && isSubscribed) {
    label = 'Unfollow';
  }

  return (
    <Button
      aria-label={label}
      className={classNames(
        isSubscribed &&
          'min-w-24 hover:bg-overlay-float-ketchup hover:text-accent-ketchup-default',
        className,
      )}
      disabled={isFetching}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={isSubscribed ? ButtonVariant.Subtle : variant}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseOut={() => {
        setIsHovered(false);
      }}
    >
      {label}
    </Button>
  );
};

export default SourceActionsFollow;

import React, { ReactElement } from 'react';
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

  return (
    <Button
      aria-label={`Toggle follow status, currently you are ${
        isSubscribed ? 'following' : 'not following'
      }`}
      className={classNames(
        isSubscribed &&
          'group min-w-24 hover:bg-overlay-float-ketchup hover:text-accent-ketchup-default',
        className,
      )}
      disabled={isFetching}
      onClick={onClick}
      size={ButtonSize.Small}
      variant={isSubscribed ? ButtonVariant.Subtle : variant}
    >
      <span className="group-hover:hidden">
        {isSubscribed ? 'Following' : 'Follow'}
      </span>
      <span className="hidden group-hover:block">
        {isSubscribed ? 'Unfollow' : 'Follow'}
      </span>
    </Button>
  );
};

export default SourceActionsFollow;

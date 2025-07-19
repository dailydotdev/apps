import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Button } from '../../buttons/Button';

export enum CopyType {
  Main = 'main',
  Custom = 'custom',
  NiceGuy = 'niceGuy',
}

interface SourceActionsFollowProps {
  className?: string;
  isFetching: boolean;
  isSubscribed: boolean;
  onClick: (e) => void;
  variant: ButtonVariant;
  followedVariant?: ButtonVariant;
  copyType?: CopyType;
}

const copyTypeToCopy: Record<
  CopyType,
  { follow: string; following: string; unfollow: string }
> = {
  [CopyType.Main]: {
    follow: 'Follow',
    following: 'Following',
    unfollow: 'Unfollow',
  },
  [CopyType.Custom]: {
    follow: 'Add',
    following: 'Remove',
    unfollow: 'Remove',
  },
  [CopyType.NiceGuy]: {
    follow: 'Follow back',
    following: 'Following',
    unfollow: 'Unfollow',
  },
};

const SourceActionsFollow = (props: SourceActionsFollowProps): ReactElement => {
  const {
    className,
    isSubscribed,
    isFetching,
    onClick,
    variant,
    followedVariant = ButtonVariant.Subtle,
    copyType = CopyType.Main,
  } = props;

  const copy = copyTypeToCopy[copyType];

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
      variant={isSubscribed ? followedVariant : variant}
    >
      <span className="group-hover:hidden">
        {isSubscribed ? copy.following : copy.follow}
      </span>
      <span className="hidden group-hover:block">
        {isSubscribed ? copy.unfollow : copy.follow}
      </span>
    </Button>
  );
};

export default SourceActionsFollow;

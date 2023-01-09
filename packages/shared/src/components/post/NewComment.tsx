import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { LoggedUser } from '../../lib/user';
import { Button, ButtonSize } from '../buttons/Button';

interface NewCommentProps {
  user?: LoggedUser;
  className?: string;
  isCommenting: boolean;
  size?: ProfileImageSize;
  onNewComment: () => unknown;
}

const buttonSize: Partial<Record<ProfileImageSize, ButtonSize>> = {
  large: 'medium',
  medium: 'small',
};

export function NewComment({
  user,
  className,
  isCommenting,
  size = 'large',
  onNewComment,
}: NewCommentProps): ReactElement {
  return (
    <button
      type="button"
      className={classNames(
        'flex items-center p-3 w-full rounded-16 typo-callout border',
        isCommenting
          ? 'bg-theme-active border-theme-divider-primary'
          : 'bg-theme-float hover:bg-theme-hover border-theme-divider-tertiary hover:border-theme-divider-primary',
        className,
      )}
      onClick={onNewComment}
    >
      {user && (
        <ProfilePicture
          user={user}
          size={size}
          className="mr-4"
          nativeLazyLoading
        />
      )}
      <span className="text-theme-label-tertiary">Share your thoughts</span>
      <Button
        buttonSize={buttonSize[size]}
        className="ml-auto btn-secondary"
        disabled
      >
        Post
      </Button>
    </button>
  );
}

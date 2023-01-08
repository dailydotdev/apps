import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ProfilePicture } from '../ProfilePicture';
import { LoggedUser } from '../../lib/user';
import { Button } from '../buttons/Button';

interface NewCommentProps {
  user?: LoggedUser;
  className?: string;
  isCommenting: boolean;
  onNewComment: () => unknown;
}

export function NewComment({
  user,
  className,
  isCommenting,
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
          size="large"
          className="mr-4"
          nativeLazyLoading
        />
      )}
      <span className="text-theme-label-tertiary">Write your reply</span>
      <Button className="ml-auto btn-secondary" disabled>
        Reply
      </Button>
    </button>
  );
}

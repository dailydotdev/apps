import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { NewCommentContainer } from '../utilities';
import { ProfilePicture } from '../ProfilePicture';
import { LoggedUser } from '../../lib/user';
import styles from './NewComment.module.css';

interface NewCommentProps {
  user?: LoggedUser;
  className?: string;
  onNewComment: () => unknown;
}

export function NewComment({
  user,
  className,
  onNewComment,
}: NewCommentProps): ReactElement {
  return (
    <NewCommentContainer className={className}>
      <button
        type="button"
        className={classNames(
          'flex w-full h-10 items-center px-4 bg-theme-bg-secondary text-theme-label-secondary rounded-2xl typo-callout focus-outline',
          styles.discussionBar,
        )}
        onClick={onNewComment}
      >
        {user && (
          <ProfilePicture
            user={user}
            size="small"
            className="mr-3 -ml-2"
            nativeLazyLoading
          />
        )}
        Start the discussion...
      </button>
    </NewCommentContainer>
  );
}

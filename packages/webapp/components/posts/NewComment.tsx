import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { NewCommentContainer } from '@dailydotdev/shared/src/components/utilities';
import { ProfilePicture } from '@dailydotdev/shared/src/components/ProfilePicture';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import styles from './NewComment.module.css';

interface NewCommentProps {
  user?: LoggedUser;
  onNewComment: () => unknown;
}

export function NewComment({
  user,
  onNewComment,
}: NewCommentProps): ReactElement {
  return (
    <NewCommentContainer>
      <div className="fixed laptop:relative inset-x-0 laptop:right-[unset] bottom-0 laptop:bottom-[unset] laptop:left-[unset] z-2 py-3 px-4 laptop:px-0 laptop:pt-4 laptop:pb-0 laptop:mt-auto w-full laptop:bg-none bg-theme-bg-primary">
        <button
          type="button"
          className={classNames(
            'flex w-full h-10 items-center px-4 bg-theme-bg-secondary text-theme-label-secondary border-none rounded-2xl cursor-pointer typo-callout focus-outline',
            styles.discussionBar,
          )}
          onClick={onNewComment}
        >
          {user && (
            <ProfilePicture user={user} size="small" className="mr-3 -ml-2" />
          )}
          Start the discussion...
        </button>
      </div>
    </NewCommentContainer>
  );
}

import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PostContentWidget } from './PostContentWidget';
import type { Post } from '../../../graphql/posts';
import { PostReminderOptions } from './PostReminderOptions';
import { useBookmarkReminderCover } from '../../../hooks/bookmark/useBookmarkReminderCover';

interface PostContentReminderProps {
  post: Post;
  className?: string;
}

export function PostContentReminder({
  post,
  className,
}: PostContentReminderProps): ReactElement | null {
  const shouldShowReminder = useBookmarkReminderCover(post);

  if (!shouldShowReminder) {
    return null;
  }

  return (
    <PostContentWidget
      className={classNames(
        'mt-0 w-full flex-row justify-start gap-0 border-0 bg-surface-float py-2 laptop:gap-0',
        className,
      )}
      title="Don’t have time now? Set a reminder"
      titleClassName="font-normal"
    >
      <PostReminderOptions
        post={post}
        className="min-w-0 flex-1 justify-end laptop:w-auto laptop:flex-none laptop:ml-auto"
      />
    </PostContentWidget>
  );
}

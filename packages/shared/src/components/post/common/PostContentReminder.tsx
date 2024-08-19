import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { PostContentWidget } from './PostContentWidget';
import { Post } from '../../../graphql/posts';
import { BookmarkReminderIcon } from '../../icons/Bookmark/Reminder';
import { IconSize } from '../../Icon';
import { PostReminderOptions } from './PostReminderOptions';
import { useBookmarkReminderCover } from '../../../hooks/bookmark/useBookmarkReminderCover';

interface PostContentReminderProps {
  post: Post;
  className?: string;
}

export function PostContentReminder({
  post,
  className,
}: PostContentReminderProps): ReactElement {
  const shouldShowReminder = useBookmarkReminderCover(post);

  if (!shouldShowReminder) {
    return null;
  }

  return (
    <PostContentWidget
      className={classNames('mt-6 w-full', className)}
      icon={<BookmarkReminderIcon size={IconSize.Small} secondary />}
      title="Don’t have time now? Set a reminder"
    >
      <PostReminderOptions post={post} className="laptop:ml-auto" />
    </PostContentWidget>
  );
}

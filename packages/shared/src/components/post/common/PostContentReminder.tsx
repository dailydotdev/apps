import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { Post } from '../../../graphql/posts';
import { useBookmarkReminderCover } from '../../../hooks/bookmark/useBookmarkReminderCover';
import { IconSize } from '../../Icon';
import { BookmarkReminderIcon } from '../../icons/Bookmark/Reminder';
import { PostContentWidget } from './PostContentWidget';
import { PostReminderOptions } from './PostReminderOptions';

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

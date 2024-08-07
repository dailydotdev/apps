import React, { ReactElement } from 'react';
import { PostContentWidget } from './PostContentWidget';
import { Post } from '../../../graphql/posts';
import { BookmarkReminderIcon } from '../../icons/Bookmark/Reminder';
import { IconSize } from '../../Icon';
import { PostReminderOptions } from './PostReminderOptions';
import { useBookmarkReminderCover } from '../../../hooks/bookmark/useBookmarkReminderCover';

interface PostContentReminderProps {
  post: Post;
}

export function PostContentReminder({
  post,
}: PostContentReminderProps): ReactElement {
  const shouldShowReminder = useBookmarkReminderCover(post);

  if (!shouldShowReminder) {
    return null;
  }

  return (
    <PostContentWidget
      className="mt-6 w-full"
      icon={<BookmarkReminderIcon size={IconSize.Small} />}
      title="Remind about this post later?"
    >
      <PostReminderOptions post={post} className="laptop:ml-auto" />
    </PostContentWidget>
  );
}

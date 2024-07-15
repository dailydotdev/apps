import React, { ReactElement } from 'react';
import { PostContentWidget } from './PostContentWidget';
import { useBookmarkReminderEnrollment } from '../../../hooks/notifications';
import { Post } from '../../../graphql/posts';
import { BookmarkReminderIcon } from '../../icons/Bookmark/Reminder';
import { IconSize } from '../../Icon';
import { PostReminderOptions } from './PostReminderOptions';

interface PostContentReminderProps {
  post: Post;
}

export function PostContentReminder({
  post,
}: PostContentReminderProps): ReactElement {
  const shouldShowReminder = useBookmarkReminderEnrollment(post);

  if (!shouldShowReminder) {
    return null;
  }

  return (
    <PostContentWidget
      className="mt-6 w-full"
      icon={<BookmarkReminderIcon size={IconSize.Small} />}
      title="Want to read / watch it later?"
    >
      <PostReminderOptions post={post} className="ml-auto" />
    </PostContentWidget>
  );
}

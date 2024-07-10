import React, { ReactElement } from 'react';
import { PostContentWidget } from './PostContentWidget';
import { useBookmarkReminderEnrollment } from '../../../hooks/notifications';
import { Post } from '../../../graphql/posts';

interface PostContentReminderProps {
  post: Post;
}

export function PostContentReminder({
  post,
}: PostContentReminderProps): ReactElement {
  const shouldShowReminder = useBookmarkReminderEnrollment(post.bookmark);

  if (!shouldShowReminder) {
    return null;
  }

  return (
    <PostContentWidget className="mt-2" title="Want to read / watch it later?">
      Test
    </PostContentWidget>
  );
}

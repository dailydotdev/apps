import React, { ReactElement } from 'react';
import { PostContentWidget } from './PostContentWidget';
import { Post } from '../../../graphql/posts';
import { BookmarkReminderIcon } from '../../icons/Bookmark/Reminder';
import { IconSize } from '../../Icon';
import { PostReminderOptions } from './PostReminderOptions';
import { useJustBookmarked } from '../../../hooks/bookmark';

interface PostContentReminderProps {
  post: Post;
}

export function PostContentReminder({
  post,
}: PostContentReminderProps): ReactElement {
  const { justBookmarked: shouldShowReminder } = useJustBookmarked({
    bookmarked: post?.bookmarked,
  });

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

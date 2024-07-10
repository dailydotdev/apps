import React, { ReactElement } from 'react';
import { PostContentWidget } from './PostContentWidget';
import {
  ReminderPreference,
  useBookmarkReminder,
  useBookmarkReminderEnrollment,
} from '../../../hooks/notifications';
import { Post } from '../../../graphql/posts';
import { BookmarkReminderIcon } from '../../icons/Bookmark/Reminder';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { IconSize } from '../../Icon';

interface PostContentReminderProps {
  post: Post;
}

export function PostContentReminder({
  post,
}: PostContentReminderProps): ReactElement {
  const shouldShowReminder = useBookmarkReminderEnrollment(post);
  const { onBookmarkReminder } = useBookmarkReminder();

  if (!shouldShowReminder) {
    return null;
  }

  const runBookmarkReminder = (preference: ReminderPreference) =>
    onBookmarkReminder({
      postId: post.id,
      existingReminder: post.bookmark?.remindAt,
      preference,
    });

  return (
    <PostContentWidget
      className="mt-6 w-full"
      icon={<BookmarkReminderIcon size={IconSize.Small} />}
      title="Want to read / watch it later?"
    >
      <span className="ml-auto flex flex-row gap-3">
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          onClick={() => runBookmarkReminder(ReminderPreference.OneHour)}
        >
          1h
        </Button>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          onClick={() => runBookmarkReminder(ReminderPreference.Tomorrow)}
        >
          24h
        </Button>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.XSmall}
          onClick={() => {
            // open modal
          }}
        >
          Other
        </Button>
      </span>
    </PostContentWidget>
  );
}

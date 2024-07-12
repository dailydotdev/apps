import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  ReminderPreference,
  useBookmarkReminder,
} from '../../../hooks/notifications';
import { LazyModal } from '../../modals/common/types';
import { Post } from '../../../graphql/posts';
import { useLazyModal } from '../../../hooks/useLazyModal';

interface PostReminderOptionsProps {
  post: Post;
  className?: string;
}

export function PostReminderOptions({
  post,
  className,
}: PostReminderOptionsProps): ReactElement {
  const { openModal } = useLazyModal();
  const { onBookmarkReminder } = useBookmarkReminder();

  const runBookmarkReminder = (preference: ReminderPreference) =>
    onBookmarkReminder({
      postId: post.id,
      existingReminder: post.bookmark?.remindAt,
      preference,
    });

  return (
    <span className={classNames('flex flex-row gap-3', className)}>
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
        onClick={() =>
          openModal({ type: LazyModal.BookmarkReminder, props: { post } })
        }
      >
        Other
      </Button>
    </span>
  );
}

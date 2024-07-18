import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
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
  buttonProps?: ButtonProps<'button'>;
}

export function PostReminderOptions({
  post,
  className,
  buttonProps = { variant: ButtonVariant.Float, size: ButtonSize.XSmall },
}: PostReminderOptionsProps): ReactElement {
  const { openModal } = useLazyModal();
  const { onBookmarkReminder } = useBookmarkReminder({ post });

  const runBookmarkReminder = (preference: ReminderPreference) =>
    onBookmarkReminder({
      postId: post.id,
      existingReminder: post.bookmark?.remindAt,
      preference,
    });

  return (
    <span className={classNames('flex flex-row gap-3', className)}>
      <Button
        {...buttonProps}
        onClick={() => runBookmarkReminder(ReminderPreference.OneHour)}
      >
        1h
      </Button>
      <Button
        {...buttonProps}
        onClick={() => runBookmarkReminder(ReminderPreference.Tomorrow)}
      >
        24h
      </Button>
      <Button
        {...buttonProps}
        onClick={() =>
          openModal({ type: LazyModal.BookmarkReminder, props: { post } })
        }
      >
        Other
      </Button>
    </span>
  );
}

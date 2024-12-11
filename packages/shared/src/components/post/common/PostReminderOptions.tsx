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
import { wrapStopPropagation } from '../../../lib/func';
import { useActiveFeedContext } from '../../../contexts';

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
  const feedContextData = useActiveFeedContext();
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
        onClick={wrapStopPropagation(() =>
          runBookmarkReminder(ReminderPreference.OneHour),
        )}
      >
        1h
      </Button>
      <Button
        {...buttonProps}
        onClick={wrapStopPropagation(() =>
          runBookmarkReminder(ReminderPreference.Tomorrow),
        )}
      >
        24h
      </Button>
      <Button
        {...buttonProps}
        onClick={wrapStopPropagation(() =>
          openModal({
            type: LazyModal.BookmarkReminder,
            props: { post, feedContextData },
          }),
        )}
      >
        Other
      </Button>
    </span>
  );
}

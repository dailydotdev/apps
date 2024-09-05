import classNames from 'classnames';
import React, { ReactElement } from 'react';

import { Post } from '../../../graphql/posts';
import {
  ReminderPreference,
  useBookmarkReminder,
} from '../../../hooks/notifications';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { wrapStopPropagation } from '../../../lib/func';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { LazyModal } from '../../modals/common/types';

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
          openModal({ type: LazyModal.BookmarkReminder, props: { post } }),
        )}
      >
        Other
      </Button>
    </span>
  );
}

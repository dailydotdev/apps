import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  ReminderPreference,
  useBookmarkReminder,
} from '../../../hooks/notifications';
import { LazyModal } from '../../modals/common/types';
import type { Post } from '../../../graphql/posts';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { wrapStopPropagation } from '../../../lib/func';
import { useActiveFeedContext } from '../../../contexts';
import { usePostActions } from '../../../hooks/post/usePostActions';

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
  const { onInteract, previousInteraction } = usePostActions({ post });
  const { openModal } = useLazyModal();
  const feedContextData = useActiveFeedContext();
  const { onBookmarkReminder } = useBookmarkReminder({ post });

  const runBookmarkReminder = (preference: ReminderPreference) => {
    onBookmarkReminder({
      postId: post.id,
      existingReminder: post.bookmark?.remindAt,
      preference,
    });
    onInteract(previousInteraction);
  };
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
            props: {
              post,
              feedContextData,
              onReminderSet: () => onInteract(previousInteraction),
            },
          }),
        )}
      >
        Other
      </Button>
    </span>
  );
}

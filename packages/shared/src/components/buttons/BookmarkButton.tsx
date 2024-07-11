import React, { ReactElement, MouseEvent } from 'react';
import { ButtonProps } from './Button';
import { Post } from '../../graphql/posts';
import ContextMenu from '../fields/ContextMenu';
import { QuaternaryButton } from './QuaternaryButton';
import { BookmarkIcon } from '../icons';
import { SimpleTooltip } from '../tooltips';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import useContextMenu from '../../hooks/useContextMenu';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useBookmarkReminder } from '../../hooks/notifications';

interface BookmarkButtonProps {
  buttonProps?: ButtonProps<'button'>;
  contextMenuId?: string;
  post: Post;
}

export function BookmarkButton({
  contextMenuId = 'bookmark-action',
  buttonProps = {},
  post,
}: BookmarkButtonProps): ReactElement {
  const finalId = `${contextMenuId}-${post.id}`;
  const hasReminder = !!post.bookmark?.remindAt;
  const { openModal } = useLazyModal();
  const { onRemoveReminder } = useBookmarkReminder();
  const { onMenuClick } = useContextMenu({ id: finalId });
  const Icon = hasReminder ? BookmarkReminderIcon : BookmarkIcon;
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (hasReminder) {
      return onMenuClick(e); // open context menu
    }

    return buttonProps.onClick?.(e);
  };

  return (
    <>
      <SimpleTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <QuaternaryButton
          {...buttonProps}
          type="button"
          pressed={post.bookmarked}
          onClick={onClick}
          id={`post-${post.id}-bookmark-btn`}
          icon={<Icon secondary={post.bookmarked} />}
        />
      </SimpleTooltip>
      <ContextMenu
        id={finalId}
        options={[
          {
            label: 'Edit reminder',
            action: () => openModal({ type: LazyModal.ReadItLater }),
          },
          {
            label: 'Remove reminder',
            action: () => onRemoveReminder(post.id),
          },
          { label: 'Remove bookmark', action: buttonProps.onClick },
        ]}
      />
    </>
  );
}

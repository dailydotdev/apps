import React, { MouseEvent, ReactElement, ReactNode } from 'react';

import { Post } from '../../graphql/posts';
import { useBookmarkReminder } from '../../hooks/notifications';
import useContextMenu from '../../hooks/useContextMenu';
import { useLazyModal } from '../../hooks/useLazyModal';
import ContextMenu from '../fields/ContextMenu';
import { BookmarkIcon } from '../icons';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import { LazyModal } from '../modals/common/types';
import { SimpleTooltip } from '../tooltips';
import { ButtonColor, ButtonVariant } from './Button';
import { QuaternaryButton, QuaternaryButtonProps } from './QuaternaryButton';

interface BookmarkButtonProps {
  buttonProps?: QuaternaryButtonProps<'button'>;
  contextMenuId?: string;
  post: Post;
  children?: ReactNode;
}

export function BookmarkButton({
  contextMenuId = 'bookmark-action',
  buttonProps = {},
  post,
  children,
}: BookmarkButtonProps): ReactElement {
  const finalId = `${contextMenuId}-${post.id}`;
  const hasReminder = !!post.bookmark?.remindAt;
  const { openModal } = useLazyModal();
  const { onRemoveReminder } = useBookmarkReminder({ post });
  const { onMenuClick } = useContextMenu({ id: finalId });
  const Icon = hasReminder ? BookmarkReminderIcon : BookmarkIcon;
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (hasReminder) {
      return onMenuClick(e);
    }

    return buttonProps.onClick?.(e);
  };

  return (
    <>
      <SimpleTooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
        <QuaternaryButton
          color={ButtonColor.Bun}
          variant={ButtonVariant.Tertiary}
          {...buttonProps}
          type="button"
          pressed={post.bookmarked}
          onClick={onClick}
          icon={<Icon secondary={post.bookmarked} />}
        >
          {children}
        </QuaternaryButton>
      </SimpleTooltip>
      <ContextMenu
        id={finalId}
        options={[
          {
            label: 'Edit reminder',
            action: () =>
              openModal({ type: LazyModal.BookmarkReminder, props: { post } }),
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

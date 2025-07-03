import type { ReactElement, MouseEvent, ReactNode } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import ContextMenu from '../fields/ContextMenu';
import type { QuaternaryButtonProps } from './QuaternaryButton';
import { QuaternaryButton } from './QuaternaryButton';
import { BookmarkIcon } from '../icons';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import useContextMenu from '../../hooks/useContextMenu';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useBookmarkReminder } from '../../hooks/notifications';
import { ButtonColor, ButtonIconPosition, ButtonVariant } from './Button';
import type { TooltipProps } from '../tooltip/Tooltip';
import { Tooltip } from '../tooltip/Tooltip';
import type { IconSize } from '../Icon';

interface BookmarkButtonProps {
  buttonProps?: Omit<QuaternaryButtonProps<'button'>, 'icon'>;
  contextMenuId?: string;
  post: Post;
  children?: ReactNode;
  iconSize?: IconSize;
  tooltipSide?: TooltipProps['side'];
}

export function BookmarkButton({
  contextMenuId = 'bookmark-action',
  buttonProps = {},
  post,
  children,
  iconSize,
  tooltipSide,
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
      <Tooltip
        content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}
        side={tooltipSide}
      >
        <QuaternaryButton
          color={ButtonColor.Bun}
          variant={ButtonVariant.Tertiary}
          {...buttonProps}
          type="button"
          pressed={post.bookmarked}
          onClick={onClick}
          iconPosition={ButtonIconPosition.Top}
          icon={<Icon secondary={post.bookmarked} size={iconSize} />}
        >
          {children}
        </QuaternaryButton>
      </Tooltip>
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

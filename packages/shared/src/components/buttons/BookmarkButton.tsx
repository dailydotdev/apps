import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { QuaternaryButtonProps } from './QuaternaryButton';
import { QuaternaryButton } from './QuaternaryButton';
import { BookmarkIcon } from '../icons';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useBookmarkReminder } from '../../hooks/notifications';
import { ButtonColor, ButtonIconPosition, ButtonVariant } from './Button';
import type { TooltipProps } from '../tooltip/Tooltip';
import { Tooltip } from '../tooltip/Tooltip';
import type { IconSize } from '../Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';

interface BookmarkButtonProps {
  buttonProps?: Omit<QuaternaryButtonProps<'button'>, 'icon'>;
  contextMenuId?: string;
  post: Post;
  children?: ReactNode;
  iconSize?: IconSize;
  tooltipSide?: TooltipProps['side'];
}

export function BookmarkButton({
  buttonProps = {},
  post,
  children,
  iconSize,
  tooltipSide,
}: BookmarkButtonProps): ReactElement {
  const hasReminder = !!post.bookmark?.remindAt;
  const { openModal } = useLazyModal();
  const { onRemoveReminder } = useBookmarkReminder({ post });
  const Icon = hasReminder ? BookmarkReminderIcon : BookmarkIcon;

  const dropdownOptions = [
    {
      label: 'Edit reminder',
      action: () =>
        openModal({ type: LazyModal.BookmarkReminder, props: { post } }),
    },
    {
      label: 'Remove reminder',
      action: () => onRemoveReminder(post.id),
    },
    {
      label: 'Remove bookmark',
      action: (e) => buttonProps.onClick(e),
    },
  ];

  if (hasReminder) {
    const { onClick, ...buttonPropsWithoutOnClick } = buttonProps;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          tooltip={{
            content: post.bookmarked ? 'Remove bookmark' : 'Bookmark',
          }}
        >
          <QuaternaryButton
            color={ButtonColor.Bun}
            variant={ButtonVariant.Tertiary}
            {...buttonPropsWithoutOnClick}
            type="button"
            iconPosition={ButtonIconPosition.Top}
            pressed={post.bookmarked}
            icon={<Icon secondary={post.bookmarked} size={iconSize} />}
          >
            {children}
          </QuaternaryButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {dropdownOptions.map(({ label, action }) => (
            <DropdownMenuItem key={label} onClick={action}>
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
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
        iconPosition={ButtonIconPosition.Top}
        onClick={(e) => buttonProps.onClick?.(e)}
        icon={<Icon secondary={post.bookmarked} size={iconSize} />}
      >
        {children}
      </QuaternaryButton>
    </Tooltip>
  );
}

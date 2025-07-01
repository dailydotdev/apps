import type { ReactElement, MouseEvent, ReactNode } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { QuaternaryButtonProps } from './QuaternaryButton';
import { QuaternaryButton } from './QuaternaryButton';
import { BookmarkIcon } from '../icons';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useBookmarkReminder } from '../../hooks/notifications';
import { ButtonColor, ButtonVariant } from './Button';
import { Tooltip } from '../tooltip/Tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';

interface BookmarkButtonProps {
  buttonProps?: QuaternaryButtonProps<'button'>;
  post: Post;
  children?: ReactNode;
}

export function BookmarkButton({
  buttonProps = {},
  post,
  children,
}: BookmarkButtonProps): ReactElement {
  const hasReminder = !!post.bookmark?.remindAt;
  const { openModal } = useLazyModal();
  const { onRemoveReminder } = useBookmarkReminder({ post });
  const Icon = hasReminder ? BookmarkReminderIcon : BookmarkIcon;

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (hasReminder) {
      // Prevent default click behavior when we have a reminder (dropdown will handle it)
      e.preventDefault();
      return;
    }

    buttonProps.onClick?.(e);
  };

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
      action: buttonProps.onClick,
    },
  ];

  if (hasReminder) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <Tooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
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
            </Tooltip>
          </div>
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
    <Tooltip content={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
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
    </Tooltip>
  );
}

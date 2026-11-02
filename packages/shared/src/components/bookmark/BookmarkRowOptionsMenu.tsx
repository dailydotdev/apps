import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { MenuItemProps } from '../dropdown/common';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { BookmarkIcon, MenuIcon } from '../icons';
import { MenuIcon as WrappingMenuIcon } from '../MenuIcon';
import type { Post } from '../../graphql/posts';
import type { BookmarkAction } from './useBookmarkActions';
import { useBookmarkActions } from './useBookmarkActions';

interface BookmarkRowOptionsContentProps {
  post: Post;
  onRemove: () => Promise<unknown>;
  close: () => void;
}

// Hooks live in the content, which mounts only while the menu is open.
const BookmarkRowOptionsContent = ({
  post,
  onRemove,
  close,
}: BookmarkRowOptionsContentProps): ReactElement => {
  const actions = useBookmarkActions({ post });

  const toOption = ({
    label,
    Icon,
    active,
    action,
  }: BookmarkAction): MenuItemProps => ({
    icon: <WrappingMenuIcon Icon={Icon} secondary={active} />,
    label,
    action: () => {
      close();
      action();
    },
  });

  const options: MenuItemProps[] = [
    toOption(actions.read),
    toOption(actions.archive),
    toOption(actions.note),
    toOption(actions.reminder),
    ...(actions.removeReminder ? [toOption(actions.removeReminder)] : []),
    toOption(actions.folder),
    toOption(actions.copyLink),
    toOption(actions.share),
    {
      icon: (
        <WrappingMenuIcon
          Icon={(props) => <BookmarkIcon {...props} secondary />}
        />
      ),
      label: 'Remove bookmark',
      action: () => {
        close();
        onRemove();
      },
    },
  ];

  return (
    <DropdownMenuContent>
      <DropdownMenuOptions options={options} />
    </DropdownMenuContent>
  );
};

interface BookmarkRowOptionsMenuProps {
  post: Post;
  onRemove: () => Promise<unknown>;
  onOpenChange?: (open: boolean) => void;
}

/** Every action on a saved post, from the row's ⋯. */
export const BookmarkRowOptionsMenu = ({
  post,
  onRemove,
  onOpenChange,
}: BookmarkRowOptionsMenuProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const setMenuOpen = (value: boolean) => {
    setOpen(value);
    onOpenChange?.(value);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Tertiary}
          data-testid={`bookmark-options-${post.id}`}
          aria-label="Options"
          icon={<MenuIcon />}
          size={ButtonSize.Small}
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();
          }}
        />
      </DropdownMenuTrigger>
      {open && (
        <BookmarkRowOptionsContent
          post={post}
          onRemove={onRemove}
          close={() => setMenuOpen(false)}
        />
      )}
    </DropdownMenu>
  );
};

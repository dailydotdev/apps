import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { MenuItemProps } from '../dropdown/common';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  BookmarkIcon,
  EditIcon,
  EyeCancelIcon,
  FolderIcon,
  LinkIcon,
  MenuIcon,
  ShareIcon,
  UnreadIcon,
} from '../icons';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
import { MenuIcon as WrappingMenuIcon } from '../MenuIcon';
import type { Post } from '../../graphql/posts';
import { useActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { postLogEvent } from '../../lib/feed';
import { ShareProvider } from '../../lib/share';
import { ReferralCampaignKey } from '../../lib/referral';
import { useBookmarkState } from '../../hooks/bookmark/useBookmarkState';
import { useBookmarkReminder } from '../../hooks/notifications/useBookmarkReminder';
import { useSharePost } from '../../hooks/useSharePost';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

const origin = Origin.BookmarksContextMenu;

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
  const client = useQueryClient();
  const feedContextData = useActiveFeedContext();
  const { queryKey: feedQueryKey } = feedContextData;
  const { isPlus } = usePlusSubscription();
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const { onToggleRead, onToggleArchived } = useBookmarkState();
  const { onRemoveReminder } = useBookmarkReminder({ post });
  const { openSharePost } = useSharePost(origin);
  const [, copyLink] = useCopyPostLink();
  const run = (action: () => unknown) => () => {
    close();
    action();
  };

  const { bookmark } = post;
  const isRead = !!bookmark?.read;
  const isArchived = !!bookmark?.archivedAt;
  const hasReminder = !!bookmark?.remindAt;

  const options: MenuItemProps[] = [
    {
      icon: <WrappingMenuIcon Icon={UnreadIcon} secondary={isRead} />,
      label: isRead ? 'Mark as unread' : 'Mark as read',
      action: run(() => onToggleRead(post, !isRead)),
    },
    {
      icon: <WrappingMenuIcon Icon={EyeCancelIcon} secondary={isArchived} />,
      label: isArchived ? 'Restore from archive' : 'Archive',
      action: run(() => onToggleArchived(post, !isArchived)),
    },
    {
      icon: <WrappingMenuIcon Icon={EditIcon} secondary={!!bookmark?.note} />,
      label: bookmark?.note ? 'Edit note' : 'Add note',
      action: run(() =>
        openModal({
          type: LazyModal.BookmarkNote,
          props: { post, feedContextData },
        }),
      ),
    },
    {
      icon: (
        <WrappingMenuIcon Icon={BookmarkReminderIcon} secondary={hasReminder} />
      ),
      label: hasReminder ? 'Edit reminder' : 'Read it later',
      action: run(() =>
        openModal({
          type: LazyModal.BookmarkReminder,
          props: { post, feedContextData },
        }),
      ),
    },
    ...(hasReminder
      ? [
          {
            icon: <WrappingMenuIcon Icon={BookmarkReminderIcon} />,
            label: 'Remove reminder',
            action: run(() => onRemoveReminder(post.id)),
          },
        ]
      : []),
    {
      icon: <WrappingMenuIcon Icon={FolderIcon} />,
      label: 'Move to folder',
      action: run(() => {
        if (!isPlus) {
          openModal({
            type: LazyModal.BookmarkFolder,
            // The modal never submits for a free reader: it shows the upsell.
            props: { onSubmit: () => null },
          });
          return;
        }

        openModal({
          type: LazyModal.MoveBookmark,
          props: {
            postId: post.id,
            listId: post.bookmarkList?.id,
            onMoveBookmark: () => {
              logEvent(
                postLogEvent(LogEvent.MoveBookmarkToFolder, post, {
                  extra: { origin },
                }),
              );
              if (feedQueryKey) {
                client.invalidateQueries({ queryKey: feedQueryKey });
              }
            },
          },
        });
      }),
    },
    {
      icon: <WrappingMenuIcon Icon={LinkIcon} />,
      label: 'Copy link',
      action: run(() => {
        logEvent(
          postLogEvent(LogEvent.SharePost, post, {
            extra: { provider: ShareProvider.CopyLink, origin },
          }),
        );
        copyLink({
          link: post.commentsPermalink,
          shorten: true,
          cid: ReferralCampaignKey.SharePost,
        });
      }),
    },
    {
      icon: <WrappingMenuIcon Icon={ShareIcon} />,
      label: 'Share post via...',
      action: run(() => openSharePost({ post })),
    },
    {
      icon: (
        <WrappingMenuIcon
          Icon={(props) => <BookmarkIcon {...props} secondary />}
        />
      ),
      label: 'Remove bookmark',
      action: run(onRemove),
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

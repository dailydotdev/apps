import type { ComponentType } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { IconProps } from '../Icon';
import {
  EditIcon,
  EyeCancelIcon,
  FolderIcon,
  LinkIcon,
  ShareIcon,
  UnreadIcon,
} from '../icons';
import { BookmarkReminderIcon } from '../icons/Bookmark/Reminder';
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

export interface BookmarkAction {
  label: string;
  Icon: ComponentType<IconProps>;
  /** The filled icon: the state the action undoes is on. */
  active?: boolean;
  action: () => unknown;
}

export interface BookmarkActions {
  read: BookmarkAction;
  archive: BookmarkAction;
  note: BookmarkAction;
  reminder: BookmarkAction;
  removeReminder?: BookmarkAction;
  folder: BookmarkAction;
  copyLink: BookmarkAction;
  share: BookmarkAction;
}

interface UseBookmarkActionsProps {
  post: Post;
  origin?: Origin;
}

/**
 * Every action on a saved post, so the row's menu and the pane's sheet speak
 * the same way. Reads the active feed context for the cache patches, so it
 * runs inside the bookmarks list's provider.
 */
export const useBookmarkActions = ({
  post,
  origin = Origin.BookmarksContextMenu,
}: UseBookmarkActionsProps): BookmarkActions => {
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

  const { bookmark } = post;
  const isRead = !!bookmark?.read;
  const isArchived = !!bookmark?.archivedAt;
  const hasReminder = !!bookmark?.remindAt;

  return {
    read: {
      label: isRead ? 'Mark as unread' : 'Mark as read',
      Icon: UnreadIcon,
      active: isRead,
      action: () => onToggleRead(post, !isRead),
    },
    archive: {
      label: isArchived ? 'Restore from archive' : 'Archive',
      Icon: EyeCancelIcon,
      active: isArchived,
      action: () => onToggleArchived(post, !isArchived),
    },
    note: {
      label: bookmark?.note ? 'Edit note' : 'Add note',
      Icon: EditIcon,
      active: !!bookmark?.note,
      action: () =>
        openModal({
          type: LazyModal.BookmarkNote,
          props: { post, feedContextData },
        }),
    },
    reminder: {
      label: hasReminder ? 'Edit reminder' : 'Read it later',
      Icon: BookmarkReminderIcon,
      active: hasReminder,
      action: () =>
        openModal({
          type: LazyModal.BookmarkReminder,
          props: { post, feedContextData },
        }),
    },
    removeReminder: hasReminder
      ? {
          label: 'Remove reminder',
          Icon: BookmarkReminderIcon,
          action: () => onRemoveReminder(post.id),
        }
      : undefined,
    folder: {
      label: 'Move to folder',
      Icon: FolderIcon,
      action: () => {
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
      },
    },
    copyLink: {
      label: 'Copy link',
      Icon: LinkIcon,
      action: () => {
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
      },
    },
    share: {
      label: 'Share post via...',
      Icon: ShareIcon,
      action: () => openSharePost({ post }),
    },
  };
};

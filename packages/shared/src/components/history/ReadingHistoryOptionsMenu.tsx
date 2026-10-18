import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
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
  DownvoteIcon,
  FolderIcon,
  LinkIcon,
  MenuIcon,
  MiniCloseIcon as XIcon,
  ShareIcon,
  UpvoteIcon,
} from '../icons';
import { MenuIcon as WrappingMenuIcon } from '../MenuIcon';
import {
  getOptimisticBookmarkCount,
  useBookmarkPost,
} from '../../hooks/useBookmarkPost';
import type { PostData, ReadHistoryPost } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { getPostByIdKey, updatePostCache } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { LogEvent, Origin } from '../../lib/log';
import { useSharePost } from '../../hooks/useSharePost';
import { updateReadingHistoryPost } from '../../hooks/useReadingHistory';
import { useReadHistoryVotePost } from '../../hooks/vote/useReadHistoryVotePost';
import { useCopyPostLink } from '../../hooks/useCopyPostLink';
import { useLogContext } from '../../contexts/LogContext';
import { postLogEvent } from '../../lib/feed';
import { ShareProvider } from '../../lib/share';
import { ReferralCampaignKey } from '../../lib/referral';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';

const getBookmarkIconAndMenuIcon = (bookmarked: boolean) => (
  <WrappingMenuIcon
    Icon={({ secondary, ...props }) => (
      <BookmarkIcon
        secondary={bookmarked}
        {...props}
        className={classNames(
          props.className,
          bookmarked && 'text-accent-bun-default',
        )}
      />
    )}
  />
);

type ReadingHistoryOptionsMenuProps = {
  post: ReadHistoryPost;
  onHide?: () => Promise<unknown>;
  // Leads with the actions the row no longer shows as buttons.
  withRowActions?: boolean;
  className?: string;
  onOpenChange?: (open: boolean) => void;
};

export const ReadingHistoryOptionsMenu = ({
  post,
  onHide,
  withRowActions = false,
  className,
  onOpenChange,
}: ReadingHistoryOptionsMenuProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { isPlus } = usePlusSubscription();
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();
  const { toggleUpvote, toggleDownvote } = useReadHistoryVotePost();
  const [, copyLink] = useCopyPostLink();
  const { toggleBookmark } = useBookmarkPost({
    onMutate: () => {
      const bookmarked = !post.bookmarked;
      const postKey = getPostByIdKey(post.id);
      const previous = queryClient.getQueryData<PostData>(postKey);
      updatePostCache(queryClient, post.id, (current) => ({
        bookmarked,
        analytics: current.analytics
          ? {
              ...current.analytics,
              bookmarks: getOptimisticBookmarkCount(
                current.analytics.bookmarks,
                current.bookmarked,
              ),
            }
          : current.analytics,
      }));
      const rollbackHistory = updateReadingHistoryPost(
        queryClient,
        user,
        post.id,
        () => ({ bookmarked }),
      );

      return () => {
        rollbackHistory();
        if (previous) {
          queryClient.setQueryData(postKey, previous);
        }
      };
    },
  });
  const logOrigin = Origin.ReadingHistoryContextMenu;
  const { openSharePost } = useSharePost(logOrigin);

  const setMenuOpen = (value: boolean) => {
    setOpen(value);
    onOpenChange?.(value);
  };

  const run =
    (action: () => unknown) =>
    (...args: unknown[]) => {
      const [event] = args as [React.MouseEvent | undefined];
      event?.preventDefault?.();
      setMenuOpen(false);
      action();
    };

  const onSaveToFolder = async () => {
    if (!isPlus) {
      openModal({
        type: LazyModal.BookmarkFolder,
        // The modal never submits for a free reader: it shows the upsell.
        props: { onSubmit: () => null },
      });
      return;
    }

    if (!post.bookmarked) {
      await toggleBookmark({ post, origin: logOrigin, disableToast: true });
    }

    openModal({
      type: LazyModal.MoveBookmark,
      props: {
        postId: post.id,
        onMoveBookmark: () => {
          logEvent(
            postLogEvent(LogEvent.MoveBookmarkToFolder, post, {
              extra: { origin: logOrigin },
            }),
          );
        },
      },
    });
  };

  const vote = post.userState?.vote;
  const rowActions: MenuItemProps[] = withRowActions
    ? [
        {
          icon: (
            <WrappingMenuIcon
              Icon={UpvoteIcon}
              secondary={vote === UserVote.Up}
            />
          ),
          label: vote === UserVote.Up ? 'Remove upvote' : 'Upvote',
          action: run(() =>
            toggleUpvote({ payload: post, origin: Origin.History }),
          ),
        },
        {
          icon: (
            <WrappingMenuIcon
              Icon={DownvoteIcon}
              secondary={vote === UserVote.Down}
            />
          ),
          label: vote === UserVote.Down ? 'Remove downvote' : 'Downvote',
          action: run(() =>
            toggleDownvote({ payload: post, origin: Origin.History }),
          ),
        },
        {
          icon: <WrappingMenuIcon Icon={LinkIcon} />,
          label: 'Copy link',
          action: run(() => {
            logEvent(
              postLogEvent(LogEvent.SharePost, post, {
                extra: {
                  provider: ShareProvider.CopyLink,
                  origin: Origin.History,
                },
              }),
            );
            copyLink({
              link: post.commentsPermalink,
              shorten: true,
              cid: ReferralCampaignKey.SharePost,
            });
          }),
        },
      ]
    : [];

  const options: MenuItemProps[] = [
    ...rowActions,
    {
      icon: <WrappingMenuIcon Icon={ShareIcon} />,
      label: 'Share post via...',
      action: run(() => openSharePost({ post })),
    },
    {
      icon: getBookmarkIconAndMenuIcon(post?.bookmarked ?? false),
      label: post?.bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks',
      action: run(() => toggleBookmark({ post, origin: logOrigin })),
    },
    ...(withRowActions
      ? [
          {
            icon: <WrappingMenuIcon Icon={FolderIcon} />,
            label: 'Save to folder',
            action: run(onSaveToFolder),
          },
        ]
      : []),
    {
      icon: <WrappingMenuIcon Icon={XIcon} />,
      label: 'Remove post',
      action: run(() => onHide?.()),
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Tertiary}
          data-testid={`post-item-${post.id}`}
          aria-label="Options"
          icon={<MenuIcon />}
          className={className}
          onClick={(event: React.MouseEvent) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          size={ButtonSize.Small}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuOptions options={options} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { QueryClient, QueryKey } from '@tanstack/react-query/build/modern';
import { useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  BookmarkIcon,
  MenuIcon,
  MiniCloseIcon as XIcon,
  ShareIcon,
} from '../icons';
import { MenuIcon as WrappingMenuIcon } from '../MenuIcon';
import type { UseBookmarkPostRollback } from '../../hooks/useBookmarkPost';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import type { ReadHistoryPost } from '../../graphql/posts';
import type { QueryIndexes } from '../../hooks/useReadingHistory';
import type {
  ReadHistoryData,
  ReadHistoryInfiniteData,
} from '../../hooks/useInfiniteReadingHistory';
import {
  generateQueryKey,
  RequestKey,
  updateInfiniteCache,
} from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { Origin } from '../../lib/log';
import { useSharePost } from '../../hooks/useSharePost';

const updateReadingHistoryPost =
  (
    client: QueryClient,
    queryKey: QueryKey,
    post: Partial<ReadHistoryPost>,
    { page, edge }: QueryIndexes,
  ): (() => UseBookmarkPostRollback) =>
  () => {
    const history = client.getQueryData<ReadHistoryInfiniteData>(queryKey);
    const { node } = history?.pages[page].readHistory.edges[edge] || {};
    const updated = { ...node, post: { ...node?.post, ...post } };

    updateInfiniteCache<ReadHistoryData>({
      client,
      edge,
      page,
      entity: updated,
      prop: 'readHistory',
      queryKey,
    });
    return () =>
      client.setQueryData<ReadHistoryInfiniteData>(queryKey, history);
  };

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
  indexes?: QueryIndexes;
};
export const ReadingHistoryOptionsMenu = ({
  post,
  indexes,
  onHide,
}: ReadingHistoryOptionsMenuProps): ReactElement => {
  const [open, setOpen] = useState(false);

  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const historyQueryKey = generateQueryKey(RequestKey.ReadingHistory, user);
  const { toggleBookmark } = useBookmarkPost({
    onMutate: () => {
      const updatePost = updateReadingHistoryPost(
        queryClient,
        historyQueryKey,
        {
          bookmarked: !post?.bookmarked,
        },
        indexes,
      );

      return updatePost();
    },
  });

  const onToggleBookmark = async (): Promise<void> => {
    toggleBookmark({
      post,
      origin: Origin.ReadingHistoryContextMenu,
    });
  };

  const logOrigin = Origin.ReadingHistoryContextMenu;
  const { openSharePost } = useSharePost(logOrigin);

  const options = [
    {
      icon: <WrappingMenuIcon Icon={ShareIcon} />,
      label: 'Share post via...',
      action: (e) => {
        e.preventDefault();
        setOpen(false);
        openSharePost({ post });
      },
    },
    {
      icon: getBookmarkIconAndMenuIcon(post?.bookmarked),
      label: post?.bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks',
      action: (e) => {
        e.preventDefault();
        setOpen(false);
        onToggleBookmark();
      },
    },
    {
      icon: <WrappingMenuIcon Icon={XIcon} />,
      label: 'Remove post',
      action: async (e) => {
        e.preventDefault();
        setOpen(false);
        try {
          await onHide?.();
        } catch (error) {
          console.error('Error hiding post:', error);
        }
      },
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={ButtonVariant.Tertiary}
          data-testid={`post-item-${post.id}`}
          icon={<MenuIcon />}
          onClick={(event) => {
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

import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import { QueryClient, QueryKey, useQueryClient } from '@tanstack/react-query';
import { ReadHistoryPost } from '../graphql/posts';
import { ShareIcon, BookmarkIcon, MiniCloseIcon as XIcon } from './icons';
import {
  UseBookmarkPostRollback,
  useBookmarkPost,
} from '../hooks/useBookmarkPost';
import AuthContext from '../contexts/AuthContext';
import {
  ReadHistoryInfiniteData,
  ReadHistoryData,
} from '../hooks/useInfiniteReadingHistory';
import { MenuIcon } from './MenuIcon';
import { QueryIndexes } from '../hooks/useReadingHistory';
import {
  generateQueryKey,
  RequestKey,
  updateInfiniteCache,
} from '../lib/query';
import { Origin } from '../lib/log';
import useContextMenu from '../hooks/useContextMenu';
import { ContextMenu as ContextMenuIds } from '../hooks/constants';

const ContextMenu = dynamic(
  () => import(/* webpackChunkName: "contextMenu" */ './fields/ContextMenu'),
  {
    ssr: false,
  },
);

export type PostOptionsReadingHistoryMenuProps = {
  post: ReadHistoryPost;
  onShare?: () => void;
  onHiddenMenu?: () => unknown;
  displayCopiedMessageFunc?: () => void;
  onHideHistoryPost?: (postId: string) => unknown;
  indexes: QueryIndexes;
};

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
  <MenuIcon
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

export default function PostOptionsReadingHistoryMenu({
  post,
  onShare,
  onHiddenMenu,
  onHideHistoryPost,
  indexes,
}: PostOptionsReadingHistoryMenuProps): ReactElement {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const historyQueryKey = generateQueryKey(RequestKey.ReadingHistory, user);
  const { isOpen } = useContextMenu({
    id: ContextMenuIds.PostReadingHistoryContext,
  });
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

  const options = [
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      label: 'Share post via...',
      action: onShare,
    },
    {
      icon: getBookmarkIconAndMenuIcon(post?.bookmarked),
      label: post?.bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks',
      action: onToggleBookmark,
    },
    {
      icon: <MenuIcon Icon={XIcon} />,
      label: 'Remove post',
      action: () => onHideHistoryPost(post?.id),
    },
  ];

  return (
    <ContextMenu
      disableBoundariesCheck
      id="reading-history-options-context"
      className="menu-primary"
      animation="fade"
      onHidden={onHiddenMenu}
      options={options}
      isOpen={isOpen}
    />
  );
}

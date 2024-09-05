import { QueryClient, QueryKey, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import React, { ReactElement, useContext } from 'react';

import AuthContext from '../contexts/AuthContext';
import { ReadHistoryPost } from '../graphql/posts';
import { ContextMenu as ContextMenuIds } from '../hooks/constants';
import {
  useBookmarkPost,
  UseBookmarkPostRollback,
} from '../hooks/useBookmarkPost';
import useContextMenu from '../hooks/useContextMenu';
import {
  ReadHistoryData,
  ReadHistoryInfiniteData,
} from '../hooks/useInfiniteReadingHistory';
import { QueryIndexes } from '../hooks/useReadingHistory';
import { Origin } from '../lib/log';
import {
  generateQueryKey,
  RequestKey,
  updateInfiniteCache,
} from '../lib/query';
import { BookmarkIcon, MiniCloseIcon as XIcon, ShareIcon } from './icons';
import { MenuIcon } from './MenuIcon';

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

import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import { QueryClient, QueryKey, useQueryClient } from 'react-query';
import { ReadHistoryPost } from '../graphql/posts';
import ShareIcon from './icons/Share';
import BookmarkIcon from './icons/Bookmark';
import XIcon from './icons/Close';
import useBookmarkPost from '../hooks/useBookmarkPost';
import AuthContext from '../contexts/AuthContext';
import {
  ReadHistoryInfiniteData,
  ReadHistoryData,
} from '../hooks/useInfiniteReadingHistory';
import { MenuIcon } from './MenuIcon';
import { QueryIndexes } from '../hooks/useReadingHistory';
import { postAnalyticsEvent } from '../lib/feed';
import { postEventName } from './utilities';
import { updateInfiniteCache } from '../lib/query';

const PortalMenu = dynamic(
  () => import(/* webpackChunkName: "portalMenu" */ './fields/PortalMenu'),
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

/* eslint-disable no-param-reassign */
const updateReadingHistoryPost =
  (
    client: QueryClient,
    queryKey: QueryKey,
    post: Partial<ReadHistoryPost>,
    { page, edge }: QueryIndexes,
  ): ((args: { id: string }) => Promise<() => void>) =>
  async () => {
    const history = client.getQueryData<ReadHistoryInfiniteData>(queryKey);
    const { node } = history.pages[page].readHistory.edges[edge];
    const updated = { ...node, post: { ...node.post, ...post } };

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

const getBookmarkIconAndMenuText = (bookmarked: boolean) => (
  <>
    <MenuIcon
      Icon={({ secondary, ...props }) => (
        <BookmarkIcon
          secondary={bookmarked}
          {...props}
          className={classNames(
            props.className,
            bookmarked && 'text-theme-color-bun',
          )}
        />
      )}
    />
    {bookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
  </>
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
  const historyQueryKey = ['readHistory', user?.id];

  const { bookmark, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: updateReadingHistoryPost(
      queryClient,
      historyQueryKey,
      {
        bookmarked: true,
      },
      indexes,
    ),
    onRemoveBookmarkMutate: updateReadingHistoryPost(
      queryClient,
      historyQueryKey,
      {
        bookmarked: false,
      },
      indexes,
    ),
    onBookmarkTrackObject: () =>
      postAnalyticsEvent(postEventName({ bookmarked: true }), post, {
        extra: { origin: 'reading history context menu' },
      }),
    onRemoveBookmarkTrackObject: () =>
      postAnalyticsEvent(postEventName({ bookmarked: false }), post, {
        extra: { origin: 'reading history context menu' },
      }),
  });

  const onBookmarkReadingHistoryPost = async (): Promise<void> => {
    if (post?.bookmarked) {
      return removeBookmark(post);
    }
    return bookmark(post);
  };

  return (
    <>
      <PortalMenu
        disableBoundariesCheck
        id="reading-history-options-context"
        className="menu-primary"
        animation="fade"
        onHidden={onHiddenMenu}
      >
        <Item className="typo-callout" onClick={onShare}>
          <span className="flex w-full typo-callout">
            <MenuIcon Icon={ShareIcon} /> Share post via...
          </span>
        </Item>
        <Item className="typo-callout" onClick={onBookmarkReadingHistoryPost}>
          <span className="flex w-full typo-callout">
            {getBookmarkIconAndMenuText(post?.bookmarked)}
          </span>
        </Item>
        <Item
          className="typo-callout laptop:hidden"
          onClick={() => onHideHistoryPost(post?.id)}
        >
          <span className="flex w-full typo-callout">
            <MenuIcon Icon={XIcon} /> Remove post
          </span>
        </Item>
      </PortalMenu>
    </>
  );
}

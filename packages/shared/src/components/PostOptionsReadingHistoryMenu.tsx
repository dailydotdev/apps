import React, { ReactElement, useContext } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import { QueryClient, QueryKey, useQueryClient } from 'react-query';
import { ReadHistoryPost } from '../graphql/posts';
import ShareIcon from '../../icons/share.svg';
import BookmarkIcon from '../../icons/bookmark.svg';
import BookmarkIconFilled from '../../icons/filled/bookmark_filled.svg';
import XIcon from '../../icons/x.svg';
import useBookmarkPost from '../hooks/useBookmarkPost';
import AuthContext from '../contexts/AuthContext';
import { ReadHistoryInfiniteData } from '../hooks/useInfiniteReadingHistory';
import { useCopyLink } from '../hooks/useCopyLink';
import { MenuIcon } from './MenuIcon';
import { QueryIndexes } from '../hooks/useReadingHistory';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

export type PostOptionsReadingHistoryMenuProps = {
  post: ReadHistoryPost;
  onHiddenMenu?: () => unknown;
  displayCopiedMessageFunc?: () => void;
  onHideHistoryPost?: (postId: string) => unknown;
  indexes: QueryIndexes;
};

/* eslint-disable no-param-reassign */
const updateReadingHistoryPost =
  (
    queryClient: QueryClient,
    historyQueryKey: QueryKey,
    readHistoryPostUpdated: Partial<ReadHistoryPost>,
    { page, edge }: QueryIndexes,
  ): ((args: { id: string }) => Promise<() => void>) =>
  async () => {
    const oldReadingHistory =
      queryClient.getQueryData<ReadHistoryInfiniteData>(historyQueryKey);
    const newItems = [...oldReadingHistory.pages];
    const history = newItems[page].readHistory.edges[edge].node.post;
    newItems[page].readHistory.edges[edge].node.post = {
      ...history,
      ...readHistoryPostUpdated,
    };
    queryClient.setQueryData<ReadHistoryInfiniteData>(historyQueryKey, {
      ...oldReadingHistory,
      pages: newItems,
    });
    return () => {
      queryClient.setQueryData<ReadHistoryInfiniteData>(
        historyQueryKey,
        oldReadingHistory,
      );
    };
  };

export default function PostOptionsReadingHistoryMenu({
  post,
  onHiddenMenu,
  onHideHistoryPost,
  indexes,
}: PostOptionsReadingHistoryMenuProps): ReactElement {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const historyQueryKey = ['readHistory', user?.id];

  const [, copyPostLink] = useCopyLink(() => post.commentsPermalink);

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
  });

  const onBookmarkReadingHistoryPost = async (): Promise<void> => {
    if (post?.bookmarked) {
      return removeBookmark(post);
    }
    return bookmark(post);
  };

  const getBookmarkIcon = () => {
    if (post?.bookmarked) {
      return <MenuIcon Icon={BookmarkIconFilled} />;
    }
    return <MenuIcon Icon={BookmarkIcon} />;
  };

  const getBookmarkMenuText = () => {
    if (post?.bookmarked) {
      return 'Remove from bookmarks';
    }
    return 'Save to bookmarks';
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
        <Item className="typo-callout" onClick={onBookmarkReadingHistoryPost}>
          <a className="flex w-full typo-callout">
            {getBookmarkIcon()}
            {getBookmarkMenuText()}
          </a>
        </Item>
        <Item className="typo-callout" onClick={copyPostLink}>
          <a className="flex w-full typo-callout">
            <MenuIcon Icon={ShareIcon} /> Share article
          </a>
        </Item>
        <Item
          className="laptop:hidden typo-callout"
          onClick={() => onHideHistoryPost(post?.id)}
        >
          <a className="flex w-full typo-callout">
            <MenuIcon Icon={XIcon} /> Remove article
          </a>
        </Item>
      </PortalMenu>
    </>
  );
}

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

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

export type PostOptionsReadingHistoryMenuProps = {
  post: ReadHistoryPost;
  onHidden?: () => unknown;
  displayCopiedMessageFunc?: () => void;
  onHide?: (postId: string) => unknown;
};

const MenuIcon = ({ Icon }) => {
  return <Icon className="mr-2 text-2xl" />;
};

/* eslint-disable no-param-reassign */
const updateReadingHistoryPost =
  (
    queryClient: QueryClient,
    historyQueryKey: QueryKey,
    update: (oldPost: ReadHistoryPost) => Partial<ReadHistoryPost>,
  ): ((args: { id: string }) => Promise<() => void>) =>
  async ({ id }) => {
    const oldReadingHistory =
      queryClient.getQueryData<ReadHistoryInfiniteData>(historyQueryKey);
    const newItems = oldReadingHistory.pages.flatMap(({ readHistory }) => {
      const modified = readHistory.edges.map(({ node }) => {
        if (node.post.id === id) {
          node.post = {
            ...node.post,
            ...update(node.post),
          };
        }
        return { node };
      });
      readHistory.edges = modified;
      return {
        readHistory,
      };
    });
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
/* eslint-disable no-param-reassign */

export default function PostOptionsReadingHistoryMenu({
  post,
  onHidden,
  onHide,
}: PostOptionsReadingHistoryMenuProps): ReactElement {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const historyQueryKey = ['readHistory', user?.id];

  const [, copyPostLink] = useCopyLink(() => post.commentsPermalink);

  const { bookmark, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: updateReadingHistoryPost(
      queryClient,
      historyQueryKey,
      () => ({
        bookmarked: true,
      }),
    ),
    onRemoveBookmarkMutate: updateReadingHistoryPost(
      queryClient,
      historyQueryKey,
      () => ({
        bookmarked: false,
      }),
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
        onHidden={onHidden}
      >
        <Item className="typo-callout" onClick={copyPostLink}>
          <a className="flex w-full typo-callout">
            <MenuIcon Icon={ShareIcon} /> Share article
          </a>
        </Item>
        <Item className="typo-callout" onClick={onBookmarkReadingHistoryPost}>
          <a className="flex w-full typo-callout">
            {getBookmarkIcon()}
            {getBookmarkMenuText()}
          </a>
        </Item>
        <Item
          className="laptop:hidden typo-callout"
          onClick={() => onHide(post?.id)}
        >
          <a className="flex w-full typo-callout">
            <MenuIcon Icon={XIcon} /> Remove article
          </a>
        </Item>
      </PortalMenu>
    </>
  );
}

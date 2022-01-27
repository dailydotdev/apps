import React, { ReactElement, useContext } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import { QueryClient, QueryKey, useQueryClient } from 'react-query';
import { ReadHistoryPost } from '../graphql/posts';
import ShareIcon from '../../icons/share.svg';
import BookmarkIcon from '../../icons/bookmark.svg';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import useBookmarkPost from '../hooks/useBookmarkPost';
import AuthContext from '../contexts/AuthContext';
import { ReadHistoryInfiniteData } from '../hooks/useInfiniteReadingHistory';

const PortalMenu = dynamic(() => import('./fields/PortalMenu'), {
  ssr: false,
});

export type PostOptionsReadingHistoryMenuProps = {
  postIndex?: number;
  post: ReadHistoryPost;
  onMessage?: (
    message: string,
    postIndex: number,
    timeout?: number,
  ) => Promise<unknown>;
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
  postIndex,
  post,
  onMessage,
}: PostOptionsReadingHistoryMenuProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const historyQueryKey = ['readHistory', user?.id];

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
    const { bookmarked } = post;
    trackEvent(
      postAnalyticsEvent(
        bookmarked ? 'bookmark post' : 'remove post bookmark',
        post,
        { extra: { origin: 'recommendation' } },
      ),
    );
    if (bookmarked) {
      await removeBookmark({ id: post.id });
    } else {
      await bookmark({ id: post.id });
    }
  };

  const onShareReadingHistoryPost = async () => {
    const shareLink = post.commentsPermalink;
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { origin: 'post context menu' },
      }),
    );
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: post?.title,
          url: shareLink,
        });
      } catch (err) {
        // Do nothing
      }
    } else {
      await navigator.clipboard.writeText(shareLink);
      onMessage('✅ Copied link to clipboard', postIndex);
    }
  };

  const postOptions: {
    icon: ReactElement;
    text: string;
    action: () => Promise<void>;
  }[] = [
    {
      icon: <MenuIcon Icon={ShareIcon} />,
      text: 'Share article',
      action: onShareReadingHistoryPost,
    },
    {
      icon: <MenuIcon Icon={BookmarkIcon} />,
      text: 'Save to Bookmarks',
      action: onBookmarkReadingHistoryPost,
    },
  ];

  return (
    <>
      <PortalMenu
        disableBoundariesCheck
        id="post-context"
        className="menu-primary"
        animation="fade"
      >
        {postOptions.map(({ icon, text, action }) => (
          <Item key={text} className="typo-callout" onClick={action}>
            <a className="flex w-full typo-callout">
              {icon} {text}
            </a>
          </Item>
        ))}
      </PortalMenu>
    </>
  );
}

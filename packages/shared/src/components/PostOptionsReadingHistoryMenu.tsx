import React, { ReactElement, useContext, useState } from 'react';
import { Item } from '@dailydotdev/react-contexify';
import dynamic from 'next/dynamic';
import { ReadHistoryPost } from '../graphql/posts';
import ShareIcon from '../../icons/share.svg';
import BookmarkIcon from '../../icons/bookmark.svg';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import useBookmarkPost from '../hooks/useBookmarkPost';
import { QueryClient } from 'react-query';



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

export default function PostOptionsReadingHistoryMenu({
  postIndex,
  post,
  onMessage,
}: PostOptionsReadingHistoryMenuProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);

  const onSharePost = async () => {
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

    const { bookmark, removeBookmark } = useBookmarkPost({
    }


    const onBookmark = async (post: Post): Promise<void> => {
      if (!user) {
        showLogin('bookmark');
        return;
      }
      const bookmarked = !post.bookmarked;
      trackEvent(
        postAnalyticsEvent(
          bookmarked ? 'bookmark post' : 'remove post bookmark',
          post,
          { extra: { origin: 'recommendation' } },
        ),
      );
      if (bookmarked) {
        await bookmark({ id: post.id });
      } else {
        await removeBookmark({ id: post.id });
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
      action: onSharePost,
    },
    {
      icon: <BookmarkIcon Icon={BookmarkIcon} />,
      text: 'Save to Bookmarks',
      action: onSharePost,
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

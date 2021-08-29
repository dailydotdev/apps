import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { FeedItem } from '../hooks/useFeed';
import { PostList } from './cards/PostList';
import { PostCard } from './cards/PostCard';
import { AdList } from './cards/AdList';
import { AdCard } from './cards/AdCard';
import { PlaceholderList } from './cards/PlaceholderList';
import { PlaceholderCard } from './cards/PlaceholderCard';
import { Ad, Post } from '../graphql/posts';
import { LoggedUser } from '../lib/user';
import { CommentOnData } from '../graphql/comments';

const CommentPopup = dynamic(() => import('./cards/CommentPopup'));

export type FeedItemComponentProps = {
  items: FeedItem[];
  index: number;
  useList: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
  nativeShareSupport: boolean;
  postMenuIndex: number | undefined;
  postNotificationIndex: number | undefined;
  showCommentPopupId: string | undefined;
  setShowCommentPopupId: (value: string | undefined) => void;
  isSendingComment: boolean;
  comment: (variables: {
    id: string;
    content: string;
  }) => Promise<CommentOnData>;
  user: LoggedUser | undefined;
  onUpvote: (post: Post, index: number, upvoted: boolean) => Promise<void>;
  onBookmark: (post: Post, index: number, bookmarked: boolean) => Promise<void>;
  onPostClick: (post: Post, index: number) => Promise<void>;
  onShare: (post: Post) => Promise<void>;
  onMenuClick: (e: React.MouseEvent, index: number) => void;
  onAdImpression: (ad: Ad) => Promise<void>;
  onAdClick: (ad: Ad) => void;
};

export function getFeedItemKey(items: FeedItem[], index: number): string {
  const item = items[index];
  switch (item.type) {
    case 'post':
      return item.post.id;
    case 'ad':
      return `ad-${index}`;
    default:
      return `placeholder-${index}`;
  }
}

export default function FeedItemComponent({
  items,
  index,
  useList,
  insaneMode,
  openNewTab,
  nativeShareSupport,
  postMenuIndex,
  postNotificationIndex,
  showCommentPopupId,
  setShowCommentPopupId,
  isSendingComment,
  comment,
  user,
  onUpvote,
  onBookmark,
  onPostClick,
  onShare,
  onMenuClick,
  onAdImpression,
  onAdClick,
}: FeedItemComponentProps): ReactElement {
  const PostTag = useList ? PostList : PostCard;
  const AdTag = useList ? AdList : AdCard;
  const PlaceholderTag = useList ? PlaceholderList : PlaceholderCard;

  const item: FeedItem = items[index];

  switch (item.type) {
    case 'post':
      return (
        <PostTag
          post={item.post}
          data-testid="postItem"
          onUpvoteClick={(post, upvoted) => onUpvote(post, index, upvoted)}
          onLinkClick={(post) => onPostClick(post, index)}
          onBookmarkClick={(post, bookmarked) =>
            onBookmark(post, index, bookmarked)
          }
          showShare={nativeShareSupport}
          onShare={onShare}
          openNewTab={openNewTab}
          enableMenu={!!user}
          onMenuClick={(event) => onMenuClick(event, index)}
          menuOpened={postMenuIndex === index}
          notification={
            postNotificationIndex === index && 'Thanks for reporting! 🚨'
          }
          showImage={!insaneMode}
        >
          {showCommentPopupId === item.post.id && (
            <CommentPopup
              onClose={() => setShowCommentPopupId(null)}
              onSubmit={(content) => comment({ id: item.post.id, content })}
              loading={isSendingComment}
              compactCard={!useList && insaneMode}
              listMode={useList}
            />
          )}
        </PostTag>
      );
    case 'ad':
      return (
        <AdTag
          ad={item.ad}
          data-testid="adItem"
          onImpression={onAdImpression}
          onLinkClick={onAdClick}
          showImage={!insaneMode}
        />
      );
    default:
      return <PlaceholderTag showImage={!insaneMode} />;
  }
}

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
import useTrackImpression from '../hooks/feed/useTrackImpression';

const CommentPopup = dynamic(() => import('./cards/CommentPopup'));

export type FeedItemComponentProps = {
  items: FeedItem[];
  index: number;
  row: number;
  column: number;
  columns: number;
  useList: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
  displayPublicationDate: boolean;
  nativeShareSupport: boolean;
  postMenuIndex: number | undefined;
  showCommentPopupId: string | undefined;
  postHeadingFont: string;
  setShowCommentPopupId: (value: string | undefined) => void;
  isSendingComment: boolean;
  comment: (variables: {
    post: Post;
    content: string;
    row: number;
    column: number;
    columns: number;
  }) => Promise<CommentOnData>;
  user: LoggedUser | undefined;
  feedName: string;
  ranking?: string;
  onUpvote: (
    post: Post,
    index: number,
    row: number,
    column: number,
    upvoted: boolean,
  ) => Promise<void>;
  onBookmark: (
    post: Post,
    index: number,
    row: number,
    column: number,
    bookmarked: boolean,
  ) => Promise<void>;
  onPostClick: (
    post: Post,
    index: number,
    row: number,
    column: number,
  ) => Promise<void>;
  onShare: (post: Post) => Promise<void>;
  onMenuClick: (
    e: React.MouseEvent,
    index: number,
    row: number,
    column: number,
  ) => void;
  onCommentClick: (
    post: Post,
    index: number,
    row: number,
    column: number,
  ) => unknown;
  onAdClick: (ad: Ad, index: number, row: number, column: number) => void;
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
  row,
  column,
  columns,
  useList,
  insaneMode,
  openNewTab,
  nativeShareSupport,
  postMenuIndex,
  displayPublicationDate,
  showCommentPopupId,
  setShowCommentPopupId,
  isSendingComment,
  comment,
  user,
  feedName,
  ranking,
  onUpvote,
  onBookmark,
  onPostClick,
  onShare,
  onMenuClick,
  onCommentClick,
  onAdClick,
  postHeadingFont,
}: FeedItemComponentProps): ReactElement {
  const PostTag = useList ? PostList : PostCard;
  const AdTag = useList ? AdList : AdCard;
  const PlaceholderTag = useList ? PlaceholderList : PlaceholderCard;
  const item = items[index];
  const inViewRef = useTrackImpression(
    item,
    index,
    columns,
    column,
    row,
    feedName,
    ranking,
  );

  switch (item.type) {
    case 'post':
      return (
        <PostTag
          ref={inViewRef}
          post={{
            ...item.post,
            createdAt: displayPublicationDate && item.post.createdAt,
          }}
          data-testid="postItem"
          onUpvoteClick={(post, upvoted) =>
            onUpvote(post, index, row, column, upvoted)
          }
          onLinkClick={(post) => onPostClick(post, index, row, column)}
          onBookmarkClick={(post, bookmarked) =>
            onBookmark(post, index, row, column, bookmarked)
          }
          showShare={nativeShareSupport}
          onShare={onShare}
          openNewTab={openNewTab}
          enableMenu={!!user}
          onMenuClick={(event) => onMenuClick(event, index, row, column)}
          menuOpened={postMenuIndex === index}
          showImage={!insaneMode}
          onCommentClick={(post) => onCommentClick(post, index, row, column)}
          postHeadingFont={postHeadingFont}
        >
          {showCommentPopupId === item.post.id && (
            <CommentPopup
              onClose={() => setShowCommentPopupId(null)}
              onSubmit={(content) =>
                comment({ post: item.post, content, row, column, columns })
              }
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
          ref={inViewRef}
          ad={item.ad}
          data-testid="adItem"
          onLinkClick={(ad) => onAdClick(ad, index, row, column)}
          showImage={!insaneMode}
          postHeadingFont={postHeadingFont}
        />
      );
    default:
      return <PlaceholderTag showImage={!insaneMode} />;
  }
}

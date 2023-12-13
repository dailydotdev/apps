import React, { FunctionComponent, ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { FeedItem } from '../hooks/useFeed';
import { PostList } from './cards/PostList';
import { ArticlePostCard } from './cards/ArticlePostCard';
import { AdList } from './cards/AdList';
import { AdCard } from './cards/AdCard';
import { PlaceholderList } from './cards/PlaceholderList';
import { PlaceholderCard } from './cards/PlaceholderCard';
import { Ad, Post, PostType } from '../graphql/posts';
import { LoggedUser } from '../lib/user';
import { CommentOnData } from '../graphql/comments';
import useTrackImpression from '../hooks/feed/useTrackImpression';
import { FeedPostClick } from '../hooks/feed/useFeedOnPostClick';
import { SharePostCard } from './cards/SharePostCard';
import { WelcomePostCard } from './cards/WelcomePostCard';
import { Origin } from '../lib/analytics';
import { UseVotePost } from '../hooks';

const CommentPopup = dynamic(
  () => import(/* webpackChunkName: "commentPopup" */ './cards/CommentPopup'),
);

export type FeedItemComponentProps = {
  items: FeedItem[];
  index: number;
  row: number;
  column: number;
  columns: number;
  useList: boolean;
  openNewTab: boolean;
  insaneMode: boolean;
  postMenuIndex: number | undefined;
  showCommentPopupId: string | undefined;
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
  onPostClick: FeedPostClick;
  onReadArticleClick: FeedPostClick;
  onShare: (post: Post, row?: number, column?: number) => void;
  onBookmark: (post: Post, row: number, column: number) => Promise<void>;
  onMenuClick: (
    e: React.MouseEvent,
    index: number,
    row: number,
    column: number,
  ) => void;
  onShareClick: (
    e: React.MouseEvent,
    post: Post,
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
  onAdClick: (ad: Ad, row: number, column: number) => void;
} & Pick<UseVotePost, 'toggleUpvote' | 'toggleDownvote'>;

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

const PostTypeToTag: Record<PostType, FunctionComponent> = {
  [PostType.Article]: ArticlePostCard,
  [PostType.Share]: SharePostCard,
  [PostType.Welcome]: WelcomePostCard,
  [PostType.Freeform]: WelcomePostCard,
};

export default function FeedItemComponent({
  items,
  index,
  row,
  column,
  columns,
  useList,
  insaneMode,
  openNewTab,
  postMenuIndex,
  showCommentPopupId,
  setShowCommentPopupId,
  isSendingComment,
  comment,
  user,
  feedName,
  ranking,
  toggleUpvote,
  toggleDownvote,
  onPostClick,
  onShare,
  onShareClick,
  onBookmark,
  onMenuClick,
  onCommentClick,
  onAdClick,
  onReadArticleClick,
}: FeedItemComponentProps): ReactElement {
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
    case 'post': {
      if (
        !!item.post.pinnedAt &&
        item.post.source?.currentMember?.flags?.collapsePinnedPosts
      ) {
        return null;
      }

      const PostTag = useList
        ? PostList
        : PostTypeToTag[item.post.type] ?? ArticlePostCard;
      return (
        <PostTag
          enableSourceHeader={
            feedName !== 'squad' && item.post.source?.type === 'squad'
          }
          ref={inViewRef}
          post={{
            ...item.post,
          }}
          data-testid="postItem"
          onUpvoteClick={(post, origin = Origin.Feed) => {
            toggleUpvote({
              post,
              origin,
              opts: {
                columns,
                column,
                row,
              },
            });
          }}
          onDownvoteClick={(post, origin = Origin.Feed) => {
            toggleDownvote({
              post,
              origin,
              opts: {
                columns,
                column,
                row,
              },
            });
          }}
          onPostClick={(post) => onPostClick(post, index, row, column)}
          onReadArticleClick={() =>
            onReadArticleClick(item.post, index, row, column)
          }
          onShare={(post) => onShare(post, row, column)}
          onBookmarkClick={(post) => onBookmark(post, row, column)}
          openNewTab={openNewTab}
          enableMenu={!!user}
          onMenuClick={(event) => onMenuClick(event, index, row, column)}
          onShareClick={(event, post) =>
            onShareClick(event, post, index, row, column)
          }
          menuOpened={postMenuIndex === index}
          showImage={!insaneMode}
          onCommentClick={(post) => onCommentClick(post, index, row, column)}
          insaneMode={insaneMode}
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
    }
    case 'ad':
      return (
        <AdTag
          ref={inViewRef}
          ad={item.ad}
          onLinkClick={(ad) => onAdClick(ad, row, column)}
          showImage={!insaneMode}
        />
      );
    default:
      return <PlaceholderTag showImage={!insaneMode} />;
  }
}

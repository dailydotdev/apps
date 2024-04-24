import React, { FunctionComponent, ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { FeedItem } from '../hooks/useFeed';
import { PostList } from './cards/PostList';
import { ArticlePostCard } from './cards/ArticlePostCard';
import { ArticlePostCard as ArticlePostCardV1 } from './cards/v1/ArticlePostCard';
import { AdList } from './cards/AdList';
import { AdCard } from './cards/AdCard';
import { AdCard as AdCardV1 } from './cards/v1/AdCard';
import { PlaceholderList } from './cards/PlaceholderList';
import { PlaceholderCard } from './cards/PlaceholderCard';
import { PlaceholderCard as PlaceholderCardV1 } from './cards/v1/PlaceholderCard';
import { Ad, Post, PostItem, PostType } from '../graphql/posts';
import { LoggedUser } from '../lib/user';
import { CommentOnData } from '../graphql/comments';
import useTrackImpression from '../hooks/feed/useTrackImpression';
import { FeedPostClick } from '../hooks/feed/useFeedOnPostClick';
import { SharePostCard } from './cards/SharePostCard';
import { SharePostCard as SharePostCardV1 } from './cards/v1/SharePostCard';
import { WelcomePostCard } from './cards/WelcomePostCard';
import { WelcomePostCard as WelcomePostCardV1 } from './cards/v1/WelcomePostCard';
import { Origin } from '../lib/analytics';
import { UseVotePost, useFeedLayout } from '../hooks';
import { CollectionCard } from './cards/CollectionCard';
import { CollectionCard as CollectionCardV1 } from './cards/v1/CollectionCard';
import { AcquisitionFormCard } from './cards/AcquisitionFormCard';
import { MarketingCtaCard, MarketingCtaList } from './cards';
import { MarketingCtaCardV1 } from './cards/v1/MarketingCtaCard';

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
  onCopyLinkClick: (
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
  [PostType.VideoYouTube]: ArticlePostCard,
  [PostType.Collection]: CollectionCard,
};

const PostTypeToTagV1: Record<PostType, FunctionComponent> = {
  [PostType.Article]: ArticlePostCardV1,
  [PostType.Share]: SharePostCardV1,
  [PostType.Welcome]: WelcomePostCardV1,
  [PostType.Freeform]: WelcomePostCardV1,
  [PostType.VideoYouTube]: ArticlePostCardV1,
  [PostType.Collection]: CollectionCardV1,
};

const getTags = (
  isList: boolean,
  isFeedLayoutV1: boolean,
  postType: PostType,
) => {
  if (isFeedLayoutV1) {
    return {
      PostTag: PostTypeToTagV1[postType] ?? ArticlePostCardV1,
      AdTag: AdCardV1,
      PlaceholderTag: PlaceholderCardV1,
      MarketingCtaTag: MarketingCtaCardV1,
    };
  }
  return {
    PostTag: isList ? PostList : PostTypeToTag[postType] ?? ArticlePostCard,
    AdTag: isList ? AdList : AdCard,
    PlaceholderTag: isList ? PlaceholderList : PlaceholderCard,
    MarketingCtaTag: isList ? MarketingCtaList : MarketingCtaCard,
  };
};

export default function FeedItemComponent({
  items,
  index,
  row,
  column,
  columns,
  useList: isList,
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
  onCopyLinkClick,
  onBookmark,
  onMenuClick,
  onCommentClick,
  onAdClick,
  onReadArticleClick,
}: FeedItemComponentProps): ReactElement {
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

  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const { PostTag, AdTag, PlaceholderTag, MarketingCtaTag } = getTags(
    isList,
    shouldUseMobileFeedLayout,
    (item as PostItem).post?.type,
  );

  switch (item.type) {
    case 'post': {
      if (
        !!item.post.pinnedAt &&
        item.post.source?.currentMember?.flags?.collapsePinnedPosts
      ) {
        return null;
      }

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
              payload: post,
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
              payload: post,
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
          onCopyLinkClick={(event, post) =>
            onCopyLinkClick(event, post, index, row, column)
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
              compactCard={!isList && insaneMode}
              listMode={isList}
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
    case 'userAcquisition': {
      return <AcquisitionFormCard key="user-acquisition-card" />;
    }
    case 'marketingCta': {
      return (
        <MarketingCtaTag
          key="marketing-cta-card"
          marketingCta={item.marketingCta}
        />
      );
    }
    default:
      return <PlaceholderTag showImage={!insaneMode} />;
  }
}

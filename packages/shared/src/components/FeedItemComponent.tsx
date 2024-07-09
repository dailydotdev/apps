import React, { FunctionComponent, ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { FeedItem } from '../hooks/useFeed';
import { ArticlePostCard } from './cards/ArticlePostCard';
import { ArticlePostList } from './cards/list/ArticlePostList';
import { AdCard } from './cards/AdCard';
import { AdList } from './cards/list/AdList';
import { PlaceholderCard } from './cards/PlaceholderCard';
import { PlaceholderList } from './cards/list/PlaceholderList';
import { Ad, Post, PostItem, PostType } from '../graphql/posts';
import { LoggedUser } from '../lib/user';
import { CommentOnData } from '../graphql/comments';
import useLogImpression from '../hooks/feed/useLogImpression';
import { FeedPostClick } from '../hooks/feed/useFeedOnPostClick';
import { SharePostCard } from './cards/SharePostCard';
import { SharePostList } from './cards/list/SharePostList';
import { WelcomePostCard } from './cards/WelcomePostCard';
import { WelcomePostList } from './cards/list/WelcomePostList';
import { Origin } from '../lib/log';
import { useFeedLayout, UseVotePost } from '../hooks';
import { CollectionCard } from './cards/CollectionCard';
import { CollectionList } from './cards/list/CollectionList';
import { AcquisitionFormCard } from './cards/AcquisitionFormCard';
import { MarketingCtaCard } from './marketingCta';
import { MarketingCtaList } from './marketingCta/MarketingCtaList';
import { FeedItemType } from './cards/common';
import { PublicSquadEligibilityCard } from './squads/PublicSquadEligibilityCard';

const CommentPopup = dynamic(
  () => import(/* webpackChunkName: "commentPopup" */ './cards/CommentPopup'),
);

export type FeedItemComponentProps = {
  item: FeedItem;
  index: number;
  row: number;
  column: number;
  columns: number;
  openNewTab: boolean;
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

export function getFeedItemKey(item: FeedItem, index: number): string {
  switch (item.type) {
    case 'post':
      return item.post.id;
    case 'ad':
      return `ad-${index}`;
    default:
      return `placeholder-${index}`;
  }
}

const PostTypeToTagCard: Record<PostType, FunctionComponent> = {
  [PostType.Article]: ArticlePostCard,
  [PostType.Share]: SharePostCard,
  [PostType.Welcome]: WelcomePostCard,
  [PostType.Freeform]: WelcomePostCard,
  [PostType.VideoYouTube]: ArticlePostCard,
  [PostType.Collection]: CollectionCard,
};

const PostTypeToTagList: Record<PostType, FunctionComponent> = {
  [PostType.Article]: ArticlePostList,
  [PostType.Share]: SharePostList,
  [PostType.Welcome]: WelcomePostList,
  [PostType.Freeform]: WelcomePostList,
  [PostType.VideoYouTube]: ArticlePostList,
  [PostType.Collection]: CollectionList,
};

type GetTagsProps = {
  isListFeedLayout: boolean;
  shouldUseListMode: boolean;
  postType: PostType;
};

const getTags = ({
  isListFeedLayout,
  shouldUseListMode,
  postType,
}: GetTagsProps) => {
  const useListCards = isListFeedLayout || shouldUseListMode;
  return {
    PostTag: useListCards
      ? PostTypeToTagList[postType] ?? ArticlePostList
      : PostTypeToTagCard[postType] ?? ArticlePostCard,
    AdTag: useListCards ? AdList : AdCard,
    PlaceholderTag: useListCards ? PlaceholderList : PlaceholderCard,
    MarketingCtaTag: useListCards ? MarketingCtaList : MarketingCtaCard,
  };
};

export default function FeedItemComponent({
  item,
  index,
  row,
  column,
  columns,
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
  const inViewRef = useLogImpression(
    item,
    index,
    columns,
    column,
    row,
    feedName,
    ranking,
  );

  const { shouldUseListFeedLayout, shouldUseListMode } = useFeedLayout();
  const { PostTag, AdTag, PlaceholderTag, MarketingCtaTag } = getTags({
    isListFeedLayout: shouldUseListFeedLayout,
    shouldUseListMode,
    postType: (item as PostItem).post?.type,
  });

  switch (item.type) {
    case FeedItemType.Post: {
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
          onCommentClick={(post) => onCommentClick(post, index, row, column)}
        >
          {showCommentPopupId === item.post.id && (
            <CommentPopup
              onClose={() => setShowCommentPopupId(null)}
              onSubmit={(content) =>
                comment({ post: item.post, content, row, column, columns })
              }
              loading={isSendingComment}
            />
          )}
        </PostTag>
      );
    }
    case FeedItemType.Ad:
      return (
        <AdTag
          ref={inViewRef}
          ad={item.ad}
          onLinkClick={(ad) => onAdClick(ad, row, column)}
        />
      );
    case FeedItemType.UserAcquisition:
      return <AcquisitionFormCard key="user-acquisition-card" />;
    case FeedItemType.PublicSquadEligibility:
      return <PublicSquadEligibilityCard />;
    case FeedItemType.MarketingCta:
      return (
        <MarketingCtaTag
          key="marketing-cta-card"
          marketingCta={item.marketingCta}
        />
      );
    default:
      return <PlaceholderTag />;
  }
}

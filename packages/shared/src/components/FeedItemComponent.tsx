import type { FunctionComponent, ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import type { AdSquadItem, FeedItem } from '../hooks/useFeed';
import { isBoostedPostAd, isBoostedSquadAd } from '../hooks/useFeed';
import { PlaceholderGrid } from './cards/placeholder/PlaceholderGrid';
import { PlaceholderList } from './cards/placeholder/PlaceholderList';
import type { Ad, Post, PostItem } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import type { LoggedUser } from '../lib/user';
import type { CommentOnData } from '../graphql/comments';
import useLogImpression from '../hooks/feed/useLogImpression';
import type { FeedPostClick } from '../hooks/feed/useFeedOnPostClick';
import { Origin, TargetType } from '../lib/log';
import type { UseVotePost } from '../hooks';
import { useFeedLayout } from '../hooks';
import { CollectionList } from './cards/collection/CollectionList';
import { MarketingCtaCard } from './marketingCta';
import { MarketingCtaList } from './marketingCta/MarketingCtaList';
import { FeedItemType } from './cards/common/common';
import { AdGrid } from './cards/ad/AdGrid';
import { AdList } from './cards/ad/AdList';
import { AcquisitionFormGrid } from './cards/AcquisitionForm/AcquisitionFormGrid';
import { AcquisitionFormList } from './cards/AcquisitionForm/AcquisitionFormList';
import { FreeformGrid } from './cards/Freeform/FreeformGrid';
import { FreeformList } from './cards/Freeform/FreeformList';
import type { PostClick } from '../lib/click';
import { ArticleList } from './cards/article/ArticleList';
import { ArticleGrid } from './cards/article/ArticleGrid';
import { ShareGrid } from './cards/share/ShareGrid';
import { ShareList } from './cards/share/ShareList';
import { CollectionGrid } from './cards/collection';
import type { UseBookmarkPost } from '../hooks/useBookmarkPost';
import { AdActions } from '../lib/ads';
import PlusGrid from './cards/plus/PlusGrid';
import { useFeedCardContext } from '../features/posts/FeedCardContext';
import { AdPixel } from './cards/ad/common/AdPixel';
import { BriefCard } from './cards/brief/BriefCard/BriefCard';
import { ActivePostContextProvider } from '../contexts/ActivePostContext';
import { LogExtraContextProvider } from '../contexts/LogExtraContext';
import { SquadAdList } from './cards/ad/squad/SquadAdList';
import { SquadAdGrid } from './cards/ad/squad/SquadAdGrid';
import { adLogEvent, feedLogExtra } from '../lib/feed';
import { useLogContext } from '../contexts/LogContext';

const CommentPopup = dynamic(
  () =>
    import(
      /* webpackChunkName: "commentPopup" */ './cards/common/CommentPopup'
    ),
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
  onPostClick: PostClick;
  onReadArticleClick: FeedPostClick;
  onShare: (post: Post, row?: number, column?: number) => void;
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
    isAd?: boolean,
  ) => unknown;
  virtualizedNumCards: number;
} & Pick<UseVotePost, 'toggleUpvote' | 'toggleDownvote'> &
  Pick<UseBookmarkPost, 'toggleBookmark'>;

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
  [PostType.Article]: ArticleGrid,
  [PostType.Share]: ShareGrid,
  [PostType.Welcome]: FreeformGrid,
  [PostType.Freeform]: FreeformGrid,
  [PostType.VideoYouTube]: ArticleGrid,
  [PostType.Collection]: CollectionGrid,
  [PostType.Brief]: BriefCard,
};

const PostTypeToTagList: Record<PostType, FunctionComponent> = {
  [PostType.Article]: ArticleList,
  [PostType.Share]: ShareList,
  [PostType.Welcome]: FreeformList,
  [PostType.Freeform]: FreeformList,
  [PostType.VideoYouTube]: ArticleList,
  [PostType.Collection]: CollectionList,
  [PostType.Brief]: BriefCard,
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
      ? PostTypeToTagList[postType] ?? ArticleList
      : PostTypeToTagCard[postType] ?? ArticleGrid,
    AdTag: useListCards ? AdList : AdGrid,
    SquadAdTag: useListCards ? SquadAdList : SquadAdGrid,
    PlaceholderTag: useListCards ? PlaceholderList : PlaceholderGrid,
    MarketingCtaTag: useListCards ? MarketingCtaList : MarketingCtaCard,
    PlusGridTag: PlusGrid,
    AcquisitionFormTag: useListCards
      ? AcquisitionFormList
      : AcquisitionFormGrid,
  };
};

export const withFeedLogExtraContext = (
  WrappedComponent: typeof FeedItemComponent,
): typeof FeedItemComponent => {
  const WithFeedLogExtraContext = (
    props: FeedItemComponentProps,
  ): ReactElement => {
    const { item } = props;

    if ([FeedItemType.Ad, FeedItemType.Post].includes(item?.type)) {
      return (
        <LogExtraContextProvider
          selector={() => {
            const extraData: Record<string, unknown> = {};

            if (item.type === FeedItemType.Ad && item.ad?.generationId) {
              extraData.gen_id = item.ad.generationId;
            }

            if (item.type === FeedItemType.Post || isBoostedPostAd(item)) {
              const post =
                item.type === FeedItemType.Post
                  ? item.post
                  : item.ad.data?.post;

              return {
                referrer_target_id: post?.id,
                referrer_target_type: post?.id ? TargetType.Post : undefined,
              };
            }

            return extraData;
          }}
        >
          <WrappedComponent {...props} />
        </LogExtraContextProvider>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithFeedLogExtraContext.displayName = 'WithFeedLogExtraContext';

  return WithFeedLogExtraContext;
};

function FeedItemComponent({
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
  toggleBookmark,
  onMenuClick,
  onCommentClick,
  onReadArticleClick,
  virtualizedNumCards,
}: FeedItemComponentProps): ReactElement {
  const { logEvent } = useLogContext();
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
  const { boostedBy } = useFeedCardContext();
  const {
    PostTag,
    AdTag,
    SquadAdTag,
    PlaceholderTag,
    MarketingCtaTag,
    PlusGridTag,
    AcquisitionFormTag,
  } = getTags({
    isListFeedLayout: shouldUseListFeedLayout,
    shouldUseListMode,
    postType: (item as PostItem).post?.type,
  });

  const onAdAction = (
    action: Exclude<AdActions, AdActions.Impression>,
    ad: Ad,
  ) => {
    logEvent(
      adLogEvent(action, ad, {
        columns: virtualizedNumCards,
        column,
        row,
        ...feedLogExtra(feedName, ranking),
      }),
    );
  };

  if (item.type === FeedItemType.Ad && isBoostedSquadAd(item)) {
    return (
      <SquadAdTag
        item={item as AdSquadItem}
        onClickAd={() => onAdAction(AdActions.Click, item.ad)}
      />
    );
  }

  if (item.type === FeedItemType.Post || isBoostedPostAd(item)) {
    const itemPost =
      item.type === FeedItemType.Post ? item.post : item.ad.data?.post;

    if (
      !!itemPost.pinnedAt &&
      itemPost.source?.currentMember?.flags?.collapsePinnedPosts
    ) {
      return null;
    }

    return (
      <ActivePostContextProvider post={itemPost}>
        <PostTag
          enableSourceHeader={
            feedName !== 'squad' && itemPost.source?.type === 'squad'
          }
          ref={inViewRef}
          post={{ ...itemPost }}
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
          onPostAuxClick={(post) => onPostClick(post, index, row, column, true)}
          onReadArticleClick={() =>
            onReadArticleClick(itemPost, index, row, column)
          }
          onShare={(post) => onShare(post, row, column)}
          onBookmarkClick={(post, origin = Origin.Feed) => {
            toggleBookmark({
              post,
              origin,
              opts: {
                columns,
                column,
                row,
              },
            });
          }}
          openNewTab={openNewTab}
          enableMenu={!!user}
          onMenuClick={(event) => onMenuClick(event, index, row, column)}
          onCopyLinkClick={(event, post) =>
            onCopyLinkClick(event, post, index, row, column)
          }
          menuOpened={postMenuIndex === index}
          onCommentClick={(post) =>
            onCommentClick(post, index, row, column, !!boostedBy)
          }
          eagerLoadImage={row === 0 && column === 0}
        >
          {showCommentPopupId === itemPost.id && (
            <CommentPopup
              onClose={() => setShowCommentPopupId(null)}
              onSubmit={(content) =>
                comment({ post: itemPost, content, row, column, columns })
              }
              loading={isSendingComment}
            />
          )}
          {item.type === FeedItemType.Ad && <AdPixel pixel={item.ad.pixel} />}
        </PostTag>
      </ActivePostContextProvider>
    );
  }

  switch (item.type) {
    case FeedItemType.Ad:
      return (
        <AdTag
          ref={inViewRef}
          ad={item.ad}
          index={item.index}
          feedIndex={index}
          onLinkClick={(ad) => onAdAction(AdActions.Click, ad)}
          onRefresh={(ad) => onAdAction(AdActions.Refresh, ad)}
        />
      );
    case FeedItemType.UserAcquisition:
      return <AcquisitionFormTag key="user-acquisition-card" />;
    case FeedItemType.MarketingCta:
      return (
        <MarketingCtaTag
          key="marketing-cta-card"
          marketingCta={item.marketingCta}
        />
      );
    case FeedItemType.PlusEntry:
      return <PlusGridTag {...item.plusEntry} />;
    default:
      return <PlaceholderTag />;
  }
}

export default withFeedLogExtraContext(FeedItemComponent);

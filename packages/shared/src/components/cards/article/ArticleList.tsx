import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import { isVideoPost } from '../../../graphql/posts';
import {
  useFeedPreviewMode,
  usePostFeedback,
  useTruncatedSummary,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { combinedClicks } from '../../../lib/click';
import { Origin } from '../../../lib/log';
import { CardContainer, CardContent, CardTitle } from '../common/list/ListCard';
import { PostCardHeader } from '../common/list/PostCardHeader';
import Link from '../../utilities/Link';
import PostReadTime from '../common/list/PostReadTime';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import PostTags from '../common/PostTags';
import { CardCoverList } from '../common/list/CardCover';
import ActionButtons from '../common/ActionButtons';
import { FeedbackList } from './feedback/FeedbackList';
import { HIGH_PRIORITY_IMAGE_PROPS } from '../../image/Image';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { isSourceUserSource } from '../../../graphql/sources';
import { useHiddenFeedbackPanel } from '../../../hooks/post/useHiddenFeedbackPanel';

export const ArticleList = forwardRef(function ArticleList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onBookmarkClick,
    onCopyLinkClick,
    openNewTab,
    children,
    onReadArticleClick,
    domProps = {},
    onShare,
    eagerLoadImage = false,
    isNarrow = false,
  }: PostCardProps & {
    /**
     * Take the phone's stacked layout whatever the viewport is, for a card in a
     * column too narrow for the side-by-side one — the agent's content panel,
     * which the reader can drag down to a few hundred pixels on a desktop. The
     * card's own breakpoints read the window, which knows nothing about that.
     */
    isNarrow?: boolean;
  },
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { type, pinnedAt, trending } = post;
  const isVideoType = isVideoPost(post);

  const onPostCardClick = (event: React.MouseEvent<HTMLAnchorElement>) =>
    onPostClick?.(post, event);
  // `isStacked` is the layout question — title over cover, actions underneath.
  // A phone is one way of arriving at it; a narrow column is the other.
  const isMobile = useViewSize(ViewSize.MobileL);
  const isStacked = isMobile || isNarrow;
  const { showFeedback } = usePostFeedback({ post });
  const { isHidden, content: hiddenPanel } = useHiddenFeedbackPanel(post);
  const isFeedPreview = useFeedPreviewMode();
  const { title } = useSmartTitle(post);
  const { title: truncatedTitle } = useTruncatedSummary(title);
  const isUserSource = isSourceUserSource(post.source);
  const actionButtons = (
    <Container className="pointer-events-none flex-[unset]">
      <ActionButtons
        className="mt-4 justify-between tablet:mt-0"
        post={post}
        onUpvoteClick={onUpvoteClick}
        onDownvoteClick={onDownvoteClick}
        onCommentClick={onCommentClick}
        onCopyLinkClick={onCopyLinkClick}
        onBookmarkClick={onBookmarkClick}
        variant="list"
      />
    </Container>
  );

  const metadata = useMemo(() => {
    const authorName = post.author?.name ?? post.source?.name;

    if (isUserSource) {
      return {
        topLabel: authorName,
      };
    }

    return {
      topLabel: post.source?.permalink ? (
        <Link href={post.source.permalink}>
          <a href={post.source.permalink} className="relative z-1">
            {post.source.name}
          </a>
        </Link>
      ) : undefined,
      bottomLabel: (
        <PostReadTime
          readTime={post.readTime}
          isVideoType={isVideoPost(post)}
        />
      ),
    };
  }, [isUserSource, post]);

  if (isHidden) {
    return (
      <FeedItemContainer
        domProps={{
          ...domProps,
          style,
          className,
        }}
        ref={ref}
        flagProps={{ pinnedAt, trending, type }}
        bookmarked={post.bookmarked}
      >
        {hiddenPanel}
      </FeedItemContainer>
    );
  }

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
        className,
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending, type }}
      linkProps={
        !isFeedPreview
          ? {
              title: post.title,
              href: post.commentsPermalink,
              ...combinedClicks(onPostCardClick),
            }
          : undefined
      }
      bookmarked={post.bookmarked}
    >
      {showFeedback ? (
        <FeedbackList
          post={post}
          onUpvoteClick={() => onUpvoteClick?.(post, Origin.FeedbackCard)}
          onDownvoteClick={() => onDownvoteClick?.(post, Origin.FeedbackCard)}
          isVideoType={isVideoType}
        />
      ) : (
        <>
          <CardContainer>
            <PostCardHeader
              post={post}
              openNewTab={openNewTab}
              postLink={post.permalink}
              onReadArticleClick={onReadArticleClick}
              metadata={metadata}
            >
              {!isUserSource && post.source && (
                <SourceButton
                  size={ProfileImageSize.Large}
                  source={post.source}
                  className="relative"
                />
              )}
            </PostCardHeader>

            <CardContent className={isNarrow ? '!flex-col' : undefined}>
              <div
                className={classNames(
                  'flex flex-1 flex-col',
                  !isNarrow && 'mr-4',
                )}
              >
                <CardTitle
                  lineClamp={undefined}
                  className={post.read ? 'text-text-tertiary' : undefined}
                >
                  {truncatedTitle}
                </CardTitle>
                <div className="flex flex-1 tablet:hidden" />
                <div className="flex items-center">
                  {post.clickbaitTitleDetected && (
                    <ClickbaitShield post={post} />
                  )}
                  <PostTags post={post} />
                </div>
                <div className="hidden flex-1 tablet:flex" />
                {!isStacked && actionButtons}
              </div>

              <CardCoverList
                data-testid="postImage"
                isVideoType={isVideoType}
                onShare={onShare}
                post={post}
                imageProps={{
                  alt: 'Post Cover image',
                  className: classNames(
                    'mobileXXL:self-start',
                    !isVideoType && 'mt-4',
                    // The cover is the full width of the card when stacked, and
                    // `mobileXL:w-60` on the image would otherwise cap it.
                    isNarrow && '!w-full self-stretch',
                  ),
                  ...(eagerLoadImage
                    ? HIGH_PRIORITY_IMAGE_PROPS
                    : { loading: 'lazy' }),
                  src: post.image,
                }}
                videoProps={{
                  className: classNames(
                    'mt-4 !h-fit mobileXL:w-40 mobileXXL:w-56',
                    isNarrow && '!w-full',
                  ),
                }}
              />
            </CardContent>
          </CardContainer>
          {isStacked && actionButtons}
          {children}
        </>
      )}
    </FeedItemContainer>
  );
});

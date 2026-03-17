import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo, useRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import {
  useFeedPreviewMode,
  useTruncatedSummary,
  useViewSize,
  ViewSize,
} from '../../../hooks';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { CardContainer, CardContent, CardTitle } from '../common/list/ListCard';
import { PostCardHeader } from '../common/list/PostCardHeader';
import ActionButtons from '../common/ActionButtons';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { isSourceUserSource } from '../../../graphql/sources';
import {
  getReadPostButtonText,
  isSocialTwitterPost,
} from '../../../graphql/posts';
import { getReadPostButtonIcon } from '../common/ReadArticleButton';
import PostTags from '../common/PostTags';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import {
  getSocialTwitterMetadata,
  getSocialTwitterMetadataLabel,
  useSocialTwitterCardData,
} from './socialTwitterHelpers';
import { EmbeddedTweetPreview } from './EmbeddedTweetPreview';

export const SocialTwitterList = forwardRef(function SocialTwitterList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onCopyLinkClick,
    onBookmarkClick,
    children,
    enableSourceHeader = false,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending, type: postType } = post;
  const isMobile = useViewSize(ViewSize.MobileL);
  const onPostCardClick = () => onPostClick?.(post);
  const containerRef = useRef<HTMLDivElement>();
  const isFeedPreview = useFeedPreviewMode();
  const { title } = useSmartTitle(post);
  const { normalizedContent, hasDailyDevMarkdown, socialTextDirectionProps } =
    useSocialTwitterCardData(post);
  const { title: truncatedTitle } = useTruncatedSummary(
    title,
    normalizedContent,
  );
  const isUserSource = isSourceUserSource(post.source);
  const isRepostLike = isSocialTwitterPost(post);
  const postForTags = post.tags?.length ? post : post.sharedPost || post;
  const quoteDetailsTextClampClass = hasDailyDevMarkdown
    ? 'line-clamp-8'
    : 'line-clamp-10';
  const { repostedByName } = getSocialTwitterMetadata(post);
  const cardLinkTitle =
    isRepostLike && repostedByName
      ? `${repostedByName} reposted on X. ${
          truncatedTitle || post.title || ''
        }`.trim()
      : truncatedTitle || post.title;

  const actionButtons = (
    <Container
      ref={containerRef}
      className="pointer-events-none flex-[unset] shrink-0"
    >
      <ActionButtons
        className="mt-4 justify-between"
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
    const authorName = post?.author?.name;
    const sourceName = post?.source?.name;

    if (isUserSource) {
      return {
        topLabel: authorName || sourceName,
      };
    }

    if (enableSourceHeader) {
      return { topLabel: sourceName || authorName };
    }

    return {
      topLabel: sourceName || authorName,
    };
  }, [
    enableSourceHeader,
    isUserSource,
    post?.author?.name,
    post?.source?.name,
  ]);
  const metadataBottomLabel = getSocialTwitterMetadataLabel();

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: classNames(domProps.className),
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending, type: postType }}
      linkProps={
        !isFeedPreview && {
          title: cardLinkTitle,
          onClick: onPostCardClick,
          href: post.commentsPermalink,
        }
      }
      bookmarked={post.bookmarked}
    >
      <CardContainer>
        <PostCardHeader
          post={post}
          metadata={{
            ...metadata,
            dateFirst: true,
            bottomLabel: metadataBottomLabel,
          }}
          postLink={post.permalink}
          openNewTab
          readButtonContent={getReadPostButtonText(post)}
          readButtonIcon={getReadPostButtonIcon(post)}
        >
          {!isUserSource && !!post?.source && (
            <SourceButton
              size={ProfileImageSize.Large}
              source={post.source}
              className="relative"
            />
          )}
        </PostCardHeader>

        <CardContent>
          <div className="mr-0 flex min-h-0 flex-1 flex-col overflow-hidden">
            {hasDailyDevMarkdown && (
              <CardTitle
                {...socialTextDirectionProps}
                className={!!post.read && 'text-text-tertiary'}
              >
                {truncatedTitle}
              </CardTitle>
            )}
            {hasDailyDevMarkdown && !!normalizedContent && (
              <p
                {...socialTextDirectionProps}
                className="mt-1 line-clamp-4 whitespace-pre-line break-words text-text-primary typo-callout"
              >
                {normalizedContent}
              </p>
            )}
            <div className="flex flex-1 tablet:hidden" />
            {hasDailyDevMarkdown && (
              <div className="flex items-center">
                {post.clickbaitTitleDetected && <ClickbaitShield post={post} />}
                <PostTags post={postForTags} />
              </div>
            )}
            <div className="mt-4 min-h-0 flex-1 overflow-hidden">
              <EmbeddedTweetPreview
                post={post}
                className="w-full"
                textClampClass={quoteDetailsTextClampClass}
                fillAvailableHeight
              />
            </div>
            {!isMobile && actionButtons}
          </div>
        </CardContent>
      </CardContainer>
      {isMobile && actionButtons}
      {children}
    </FeedItemContainer>
  );
});

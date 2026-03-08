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
import { sanitizeMessage } from '../../../features/onboarding/shared';
import { isSourceUserSource } from '../../../graphql/sources';
import { isXShareLikePost } from '../../../graphql/posts';
import PostTags from '../common/PostTags';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';
import {
  getSocialTwitterMetadata,
  getSocialTextDirectionProps,
  getSocialTwitterMetadataLabel,
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
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();
  const isFeedPreview = useFeedPreviewMode();
  const { title } = useSmartTitle(post);
  const content = useMemo(
    () => (post.contentHtml ? sanitizeMessage(post.contentHtml, []) : ''),
    [post.contentHtml],
  );
  const { title: truncatedTitle } = useTruncatedSummary(title, content);
  const isUserSource = isSourceUserSource(post.source);
  const isRepostLike = isXShareLikePost(post);
  const postForTags = post.tags?.length ? post : post.sharedPost || post;
  const repostPrefixPattern = /^.*?reposted on x\.\s*/i;
  const titleWithoutRepostPrefix =
    post.title?.replace(repostPrefixPattern, '').trim() ?? '';
  const sharedTitle = post.sharedPost?.title?.trim() ?? '';
  const hasTitleCommentary =
    post.subType !== 'repost' &&
    !!titleWithoutRepostPrefix &&
    !!sharedTitle &&
    !sharedTitle.startsWith(titleWithoutRepostPrefix);
  const normalizedContent = (post.content || content).trim();
  const isStandaloneTweet = post.subType === 'tweet' && !post.sharedPost;
  const hasDailyDevMarkdown =
    !isStandaloneTweet && (!!normalizedContent || hasTitleCommentary);
  const quoteDetailsTextClampClass = hasDailyDevMarkdown
    ? 'line-clamp-8'
    : 'line-clamp-10';
  const {
    repostedByName,
    embeddedTweetIdentity,
    embeddedTweetAvatarUser,
  } = getSocialTwitterMetadata(post);
  const socialTextDirectionProps = getSocialTextDirectionProps(post.language);
  const cardLinkTitle =
    isRepostLike && repostedByName
      ? `${repostedByName} reposted on X. ${
          truncatedTitle || post.title || ''
        }`.trim()
      : truncatedTitle || post.title;

  const actionButtons = (
    <Container ref={containerRef} className="pointer-events-none flex-[unset]">
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
    const authorName = post?.author?.name;
    const sourceName = post?.source?.name;

    if (isUserSource) {
      return {
        topLabel: authorName || sourceName,
      };
    }

    if (enableSourceHeader) {
      return {
        topLabel: sourceName || authorName,
        bottomLabel: authorName,
      };
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
          readButtonContent="Read on"
          readButtonIcon={<TwitterIcon size={IconSize.Size16} />}
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
          <div className="mr-0 flex flex-1 flex-col">
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
            <EmbeddedTweetPreview
              post={post}
              embeddedTweetAvatarUser={embeddedTweetAvatarUser}
              embeddedTweetIdentity={embeddedTweetIdentity}
              className="mt-4 w-full"
              textClampClass={quoteDetailsTextClampClass}
              showXLogo
            />
            {!isMobile && actionButtons}
          </div>
        </CardContent>
      </CardContainer>
      {isMobile && actionButtons}
      {children}
    </FeedItemContainer>
  );
});

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
import { usePostImage } from '../../../hooks/post/usePostImage';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { CardContainer, CardContent, CardTitle } from '../common/list/ListCard';
import { PostCardHeader } from '../common/list/PostCardHeader';
import { CardCoverList } from '../common/list/CardCover';
import ActionButtons from '../common/ActionButtons';
import { HIGH_PRIORITY_IMAGE_PROPS } from '../../image/Image';
import { ClickbaitShield } from '../common/ClickbaitShield';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { sanitizeMessage } from '../../../features/onboarding/shared';
import { isSourceUserSource } from '../../../graphql/sources';
import { isSocialTwitterShareLike, PostType } from '../../../graphql/posts';
import PostTags from '../common/PostTags';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';
import { getSocialTwitterMetadata } from './socialTwitterHelpers';
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
    onShare,
    children,
    enableSourceHeader = false,
    domProps = {},
    eagerLoadImage = false,
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { pinnedAt, trending, type: postType } = post;
  const isMobile = useViewSize(ViewSize.MobileL);
  const onPostCardClick = () => onPostClick(post);
  const containerRef = useRef<HTMLDivElement>();
  const isFeedPreview = useFeedPreviewMode();
  const image = usePostImage(post);
  const { title } = useSmartTitle(post);
  const content = useMemo(
    () => (post.contentHtml ? sanitizeMessage(post.contentHtml, []) : ''),
    [post.contentHtml],
  );
  const { title: truncatedTitle } = useTruncatedSummary(title, content);
  const isUserSource = isSourceUserSource(post.source);
  const isQuoteLike = isSocialTwitterShareLike(post);
  const postForTags = post.tags?.length ? post : post.sharedPost || post;
  const showReferenceTweet = post.sharedPost?.type === PostType.SocialTwitter;
  const showMediaCover = !!image && !showReferenceTweet;
  const shouldHideRepostHeadlineAndTags =
    post.subType === 'repost' && !post.contentHtml?.trim();
  const quoteDetailsTextClampClass = shouldHideRepostHeadlineAndTags
    ? 'line-clamp-8'
    : 'line-clamp-4';
  const { repostedByName, embeddedTweetIdentity, embeddedTweetAvatarUser } =
    getSocialTwitterMetadata(post);
  const cardLinkTitle =
    isQuoteLike && repostedByName
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
  const authorName = post?.author?.name;
  const sourceName = post?.source?.name;
  const metadata = isUserSource
    ? {
        topLabel: authorName || sourceName,
      }
    : {
        topLabel: sourceName || authorName,
        ...(enableSourceHeader ? { bottomLabel: authorName } : {}),
      };
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
          <div
            className={classNames(
              'flex flex-1 flex-col',
              showReferenceTweet ? 'mr-0' : 'mr-4',
            )}
          >
            {!shouldHideRepostHeadlineAndTags && (
              <CardTitle className={!!post.read && 'text-text-tertiary'}>
                {truncatedTitle}
              </CardTitle>
            )}
            <div className="flex flex-1 tablet:hidden" />
            {!shouldHideRepostHeadlineAndTags && (
              <div className="flex items-center">
                {post.clickbaitTitleDetected && <ClickbaitShield post={post} />}
                <PostTags post={postForTags} />
              </div>
            )}
            {showReferenceTweet && (
              <EmbeddedTweetPreview
                post={post}
                embeddedTweetAvatarUser={embeddedTweetAvatarUser}
                embeddedTweetIdentity={embeddedTweetIdentity}
                className="mt-4 w-full"
                textClampClass={quoteDetailsTextClampClass}
                showXLogo={false}
              />
            )}
            <div className="hidden flex-1 tablet:flex" />
            {!isMobile && actionButtons}
          </div>

          {showMediaCover && (
            <CardCoverList
              onShare={onShare}
              post={post}
              imageProps={{
                alt: 'Post cover image',
                className: 'mobileXXL:self-start mt-4',
                ...(eagerLoadImage
                  ? HIGH_PRIORITY_IMAGE_PROPS
                  : { loading: 'lazy' }),
                src: image,
              }}
            />
          )}
        </CardContent>
      </CardContainer>
      {isMobile && actionButtons}
      {children}
    </FeedItemContainer>
  );
});

import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import type { PostCardProps } from '../common/common';
import {
  Container,
  getGroupedHoverContainer,
  Separator,
} from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardHeader,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import SourceButton from '../common/SourceButton';
import PostMetadata from '../common/PostMetadata';
import ActionButtons from '../common/ActionButtons';
import PostTags from '../common/PostTags';
import { ReadArticleButton } from '../common/ReadArticleButton';
import { ProfileImageSize } from '../../ProfilePicture';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import { ButtonVariant } from '../../buttons/Button';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';
import { useFeedPreviewMode } from '../../../hooks';
import { isSourceUserSource } from '../../../graphql/sources';
import { sanitizeMessage } from '../../../features/onboarding/shared';
import {
  getSocialTextDirectionProps,
  getSocialTwitterMetadataLabel,
  stripRepostedOnXPrefix,
} from './socialTwitterHelpers';
import { EmbeddedTweetPreview } from './EmbeddedTweetPreview';

const HeaderActions = getGroupedHoverContainer('span');
const normalizeThreadBody = ({
  title,
  content,
  contentHtml,
}: {
  title?: string;
  content?: string;
  contentHtml?: string;
}): string | undefined => {
  const rawBody =
    content || (contentHtml ? sanitizeMessage(contentHtml, []) : null);
  if (!rawBody) {
    return undefined;
  }

  const trimmedBody = rawBody.trim();
  if (!trimmedBody.length) {
    return undefined;
  }

  const trimmedTitle = title?.trim();
  if (!trimmedTitle?.length) {
    return trimmedBody;
  }

  if (!trimmedBody.startsWith(trimmedTitle)) {
    return trimmedBody;
  }

  const bodyWithoutTitle = trimmedBody
    .slice(trimmedTitle.length)
    .replace(/^[\s\n\r:.-]+/, '')
    .trim();

  return bodyWithoutTitle || undefined;
};

export const SocialTwitterGrid = forwardRef(function SocialTwitterGrid(
  {
    post,
    onPostClick,
    onPostAuxClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onCopyLinkClick,
    onBookmarkClick,
    children,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const isFeedPreview = useFeedPreviewMode();
  const isUserSource = isSourceUserSource(post.source);
  const rawTitle = post.title || post.sharedPost?.title;
  const normalizedContent = (
    post.content ||
    (post.contentHtml ? sanitizeMessage(post.contentHtml, []) : '')
  ).trim();
  const titleWithoutRepostPrefix = stripRepostedOnXPrefix(rawTitle);
  const sharedTitle = post.sharedPost?.title?.trim() ?? '';
  const hasTitleCommentary =
    post.subType !== 'repost' &&
    !!titleWithoutRepostPrefix &&
    !!sharedTitle &&
    !sharedTitle.startsWith(titleWithoutRepostPrefix);
  const hasDailyDevMarkdown =
    !!post.sharedPost && (!!normalizedContent || hasTitleCommentary);
  const quoteDetailsContainerClass = 'mx-1 mb-1 mt-2';
  const quoteDetailsTextClampClass = hasDailyDevMarkdown
    ? 'line-clamp-6'
    : 'line-clamp-8';
  const cardTags = post.tags?.length ? post.tags : post.sharedPost?.tags;
  let commentaryBody: string | undefined;
  if (hasDailyDevMarkdown) {
    if (post.subType === 'thread') {
      commentaryBody = normalizeThreadBody({
        title: rawTitle,
        content: post.content,
        contentHtml: post.contentHtml,
      });
    } else {
      commentaryBody = normalizedContent || undefined;
    }
  }
  const socialTextDirectionProps = getSocialTextDirectionProps(post.language);
  const cardOverlayLabel = rawTitle;
  const metadataLabel = getSocialTwitterMetadataLabel();
  const metadataContent = (
    <>
      {!!post.createdAt && <Separator />}
      {metadataLabel}
    </>
  );

  const onPostCardClick = () => onPostClick(post);
  const onPostCardAuxClick = () => onPostAuxClick(post);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(
          post,
          domProps.className,
          'min-h-card max-h-card overflow-hidden',
        ),
      }}
      ref={ref}
      flagProps={{ pinnedAt: post.pinnedAt, trending: post.trending }}
      bookmarked={post.bookmarked}
    >
      <CardOverlay
        post={post}
        onPostCardClick={onPostCardClick}
        onPostCardAuxClick={onPostCardAuxClick}
        ariaLabel={cardOverlayLabel}
      />
      <CardTextContainer>
        <CardHeader>
          {!isUserSource && post.source && (
            <SourceButton source={post.source} size={ProfileImageSize.Medium} />
          )}
          {!!post.author && (
            <ProfileImageLink
              picture={{ size: ProfileImageSize.Medium }}
              user={post.author}
            />
          )}
          <div className="relative ml-auto flex min-h-8 min-w-[4.5rem] items-center justify-end">
            <HeaderActions className="absolute inset-y-0 right-0 flex flex-row items-center justify-end">
              {!isFeedPreview && (
                <ReadArticleButton
                  content="Read on"
                  className="relative z-1 mr-2"
                  icon={<TwitterIcon size={IconSize.Size16} />}
                  href={post.permalink}
                  variant={ButtonVariant.Primary}
                  openNewTab
                />
              )}
              <PostOptionButton post={post} />
            </HeaderActions>
          </div>
        </CardHeader>
        {hasDailyDevMarkdown && (
          <CardTitle
            {...socialTextDirectionProps}
            className="min-h-[4.5rem]"
            lineClamp="line-clamp-3"
          >
            {rawTitle}
          </CardTitle>
        )}
      </CardTextContainer>
      {hasDailyDevMarkdown && !!cardTags?.length && (
        <PostTags className="mx-4 mt-0" post={{ tags: cardTags }} />
      )}
      <PostMetadata
        className="mx-4 mt-1 line-clamp-1 break-words"
        createdAt={post.createdAt}
        readTime={post.readTime}
      >
        {metadataContent}
      </PostMetadata>
      <Container className="min-h-0 overflow-hidden">
        {commentaryBody && (
          <p
            {...socialTextDirectionProps}
            className="mx-4 mt-1 line-clamp-6 whitespace-pre-line break-words text-text-primary typo-callout"
          >
            {commentaryBody}
          </p>
        )}
        <div
          className={`${quoteDetailsContainerClass} min-h-0 flex-1 overflow-hidden`}
        >
          <EmbeddedTweetPreview
            post={post}
            textClampClass={quoteDetailsTextClampClass}
            showXLogo
            fillAvailableHeight
          />
        </div>
        <ActionButtons
          className="mt-auto shrink-0"
          onBookmarkClick={onBookmarkClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onDownvoteClick={onDownvoteClick}
          onUpvoteClick={onUpvoteClick}
          post={post}
        />
      </Container>
      {children}
    </FeedItemContainer>
  );
});

import type { ReactElement, Ref } from 'react';
import React, { forwardRef } from 'react';
import type { PostCardProps } from '../common/common';
import { Container, getGroupedHoverContainer } from '../common/common';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardHeader,
  CardImage,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '../common/Card';
import CardOverlay from '../common/CardOverlay';
import SourceButton from '../common/SourceButton';
import PostMetadata from '../common/PostMetadata';
import ActionButtons from '../common/ActionButtons';
import PostTags from '../common/PostTags';
import { ProfileImageSize } from '../../ProfilePicture';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';
import { useFeedPreviewMode } from '../../../hooks';
import { isSourceUserSource } from '../../../graphql/sources';
import { stripHtmlTags } from '../../../lib/strings';

const HeaderActions = getGroupedHoverContainer('span');
const quoteLikeSubTypes = ['quote', 'repost'];
const UNKNOWN_SOURCE_ID = 'unknown';

const normalizeThreadBody = ({
  title,
  content,
  contentHtml,
}: {
  title?: string;
  content?: string;
  contentHtml?: string;
}): string | undefined => {
  const rawBody = content || (contentHtml ? stripHtmlTags(contentHtml) : null);
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
    openNewTab,
    children,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const isFeedPreview = useFeedPreviewMode();
  const isUserSource = isSourceUserSource(post.source);
  const isQuoteLike =
    quoteLikeSubTypes.includes(post.subType || '') && !!post.sharedPost;
  const shouldHideMedia = post.subType === 'thread';
  const showQuoteDetail = isQuoteLike;
  const showMediaDetail = !isQuoteLike && !shouldHideMedia && !!post.image;
  const title = post.title || post.sharedPost?.title;
  const cardTags = post.tags?.length ? post.tags : post.sharedPost?.tags;
  const threadBody =
    post.subType === 'thread'
      ? normalizeThreadBody({
          title,
          content: post.content,
          contentHtml: post.contentHtml,
        })
      : undefined;
  const tweetUrl = post.permalink || post.commentsPermalink;
  const quotedHandle =
    post.sharedPost?.source?.id === UNKNOWN_SOURCE_ID
      ? post.sharedPost?.creatorTwitter ||
        post.creatorTwitter ||
        post.sharedPost?.author?.username
      : post.sharedPost?.source?.handle;

  const onPostCardClick = () => onPostClick(post);
  const onPostCardAuxClick = () => onPostAuxClick(post);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        className: getPostClassNames(
          post,
          domProps.className,
          'min-h-card max-h-card',
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
        ariaLabel={title}
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
                <Button
                  className="relative z-1 mr-2"
                  icon={<TwitterIcon size={IconSize.Size16} />}
                  size={ButtonSize.Small}
                  tag="a"
                  href={tweetUrl}
                  rel="noopener noreferrer"
                  target={openNewTab ? '_blank' : undefined}
                  variant={ButtonVariant.Primary}
                  aria-label="View tweet on X"
                />
              )}
              <PostOptionButton post={post} />
            </HeaderActions>
          </div>
        </CardHeader>
        <CardTitle className="min-h-[4.5rem]" lineClamp="line-clamp-3">
          {title}
        </CardTitle>
      </CardTextContainer>
      {!!cardTags?.length && (
        <PostTags className="mx-4 mt-0" post={{ tags: cardTags }} />
      )}
      <PostMetadata
        className="mx-4 mt-1 line-clamp-1 break-words"
        createdAt={post.createdAt}
        readTime={post.readTime}
      />
      <Container>
        {threadBody && (
          <p className="mx-4 mt-1 line-clamp-6 whitespace-pre-line break-words text-text-primary typo-callout">
            {threadBody}
          </p>
        )}
        <div className="flex-1" />
        {showQuoteDetail ? (
          <div className="mx-1 mb-1 mt-2 h-40 rounded-12 border border-border-subtlest-tertiary p-3">
            <p className="truncate font-bold text-text-primary typo-footnote">
              {post.sharedPost?.source?.name || 'Referenced post'}
            </p>
            {!!quotedHandle && (
              <p className="truncate text-text-tertiary typo-footnote">
                @{quotedHandle}
              </p>
            )}
            <p className="mt-1 line-clamp-5 whitespace-pre-line break-words text-text-secondary typo-footnote">
              {post.sharedPost?.title}
            </p>
          </div>
        ) : null}
        {showMediaDetail && (
          <div className="mx-1 mb-1 mt-2 h-40 overflow-hidden rounded-12 border border-border-subtlest-tertiary">
            <CardImage
              alt="Tweet media"
              className="size-full object-cover"
              src={post.image}
            />
          </div>
        )}
        <ActionButtons
          className="mt-auto"
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

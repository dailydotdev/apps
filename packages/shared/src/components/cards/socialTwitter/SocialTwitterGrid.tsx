import type { ReactElement, ReactNode, Ref } from 'react';
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
import { ReadArticleButton } from '../common/ReadArticleButton';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { PostOptionButton } from '../../../features/posts/PostOptionButton';
import { ButtonVariant } from '../../buttons/Button';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';
import { useFeedPreviewMode } from '../../../hooks';
import { isSourceUserSource } from '../../../graphql/sources';
import { stripHtmlTags } from '../../../lib/strings';
import { fallbackImages } from '../../../lib/config';
import { cloudinarySquadsImageFallback } from '../../../lib/image';

const HeaderActions = getGroupedHoverContainer('span');
const quoteLikeSubTypes = ['quote', 'repost'];
const UNKNOWN_SOURCE_ID = 'unknown';
const EMBEDDED_TWEET_AVATAR_FALLBACK = fallbackImages.avatar.replace(
  't_logo,',
  '',
);
const isSquadPlaceholderAvatar = (image?: string): boolean =>
  !!image &&
  (image === cloudinarySquadsImageFallback ||
    image.includes('squad_placeholder'));

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

const getPostText = ({
  content,
  contentHtml,
}: {
  content?: string;
  contentHtml?: string;
}): string | undefined => {
  const rawText = content || (contentHtml ? stripHtmlTags(contentHtml) : null);
  const trimmedText = rawText?.trim();
  return trimmedText?.length ? trimmedText : undefined;
};

const formatHandleAsDisplayName = (handle: string): string =>
  handle
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const removeHandlePrefixFromTitle = ({
  title,
  sourceHandle,
  authorHandle,
}: {
  title?: string;
  sourceHandle?: string;
  authorHandle?: string;
}): string | undefined => {
  if (!title) {
    return title;
  }

  const handlePrefixes = [sourceHandle, authorHandle]
    .filter(Boolean)
    .map((handle) => `@${handle}:`);

  const matchedPrefix = handlePrefixes.find((prefix) =>
    title.startsWith(prefix),
  );
  if (matchedPrefix) {
    return title.slice(matchedPrefix.length).trim();
  }

  return title.replace(/^@[A-Za-z0-9_]+:\s*/, '').trim();
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
  const repostText =
    post.subType === 'repost'
      ? getPostText({
          content: post.content,
          contentHtml: post.contentHtml,
        })
      : undefined;
  const shouldHideRepostHeadlineAndTags =
    post.subType === 'repost' && !repostText;
  const quoteDetailsContainerClass = shouldHideRepostHeadlineAndTags
    ? 'mx-1 mb-1 mt-2 min-h-[13.5rem] flex-1 rounded-12 border border-border-subtlest-tertiary p-3'
    : 'mx-1 mb-1 mt-2 h-40 rounded-12 border border-border-subtlest-tertiary p-3';
  const quoteDetailsTextClampClass = shouldHideRepostHeadlineAndTags
    ? 'line-clamp-[10]'
    : 'line-clamp-5';
  const rawTitle = post.title || post.sharedPost?.title;
  const cardTags = post.tags?.length ? post.tags : post.sharedPost?.tags;
  const threadBody =
    post.subType === 'thread'
      ? normalizeThreadBody({
          title: rawTitle,
          content: post.content,
          contentHtml: post.contentHtml,
        })
      : undefined;
  const quotedHandle =
    post.sharedPost?.source?.id === UNKNOWN_SOURCE_ID
      ? post.sharedPost?.creatorTwitter ||
        post.creatorTwitter ||
        post.sharedPost?.author?.username
      : post.sharedPost?.source?.handle;
  const quotedSourceName = post.sharedPost?.source?.name;
  const isUnknownQuotedSourceName =
    quotedSourceName?.toLowerCase() === UNKNOWN_SOURCE_ID;
  const embeddedTweetName =
    !isUnknownQuotedSourceName && quotedSourceName
      ? quotedSourceName
      : post.sharedPost?.author?.name;
  const embeddedTweetDisplayName =
    embeddedTweetName ||
    (quotedHandle && formatHandleAsDisplayName(quotedHandle));
  const embeddedTweetIdentity = [embeddedTweetDisplayName, quotedHandle]
    .filter(Boolean)
    .map((value, index) => (index === 1 ? `@${value}` : value))
    .join(' ');
  const embeddedTweetSourceAvatar = isSquadPlaceholderAvatar(
    post.sharedPost?.source?.image,
  )
    ? undefined
    : post.sharedPost?.source?.image;
  const embeddedTweetAvatar =
    post.sharedPost?.author?.image ||
    embeddedTweetSourceAvatar ||
    EMBEDDED_TWEET_AVATAR_FALLBACK;
  const embeddedTweetAvatarUser = {
    id:
      post.sharedPost?.author?.id ||
      post.sharedPost?.source?.id ||
      quotedHandle ||
      'shared-post-avatar',
    image: embeddedTweetAvatar,
    username: quotedHandle,
    name: embeddedTweetName,
  };
  const sourceHandle =
    post.source?.id === UNKNOWN_SOURCE_ID
      ? post.creatorTwitter || post.author?.username
      : post.source?.handle;
  const sourceName = post.source?.name;
  const isUnknownSourceName = sourceName?.toLowerCase() === UNKNOWN_SOURCE_ID;
  const repostedByName =
    (!isUnknownSourceName && sourceName) ||
    post.author?.name ||
    (sourceHandle && formatHandleAsDisplayName(sourceHandle));
  const title = removeHandlePrefixFromTitle({
    title: rawTitle,
    sourceHandle,
    authorHandle: post.author?.username,
  });
  const cardOverlayLabel =
    post.subType === 'repost' && repostedByName
      ? `${repostedByName} reposted on X. ${title || post.title || ''}`.trim()
      : title;
  const metadataHandles =
    post.subType === 'repost'
      ? [sourceHandle].filter(Boolean)
      : [...new Set([sourceHandle, quotedHandle].filter(Boolean))];
  const embeddedTweetTextColorClass = post.read
    ? 'text-text-tertiary'
    : 'text-text-primary';
  let metadataContent: ReactNode;
  if (post.subType === 'repost') {
    metadataContent = (
      <>
        {!!post.createdAt && <Separator />}
        <span className="inline-flex h-[18px] items-center gap-1 align-middle leading-[18px]">
          <TwitterIcon
            className="relative top-px text-text-tertiary"
            size={IconSize.XXSmall}
          />
          <span>{repostedByName} reposted</span>
        </span>
      </>
    );
  } else if (metadataHandles.length === 1 && repostedByName) {
    metadataContent = (
      <>
        {!!post.createdAt && <Separator />}
        <span className="inline-flex h-[18px] items-center gap-1 align-middle leading-[18px]">
          <TwitterIcon
            className="relative top-px text-text-tertiary"
            size={IconSize.XXSmall}
          />
          <span>{repostedByName}</span>
        </span>
      </>
    );
  } else {
    metadataContent = metadataHandles.map((handle, index) => (
      <React.Fragment key={handle}>
        {(!!post.createdAt || index > 0) && <Separator />}@{handle}
      </React.Fragment>
    ));
  }

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
                  href={post.commentsPermalink}
                  variant={ButtonVariant.Primary}
                  openNewTab={openNewTab}
                />
              )}
              <PostOptionButton post={post} />
            </HeaderActions>
          </div>
        </CardHeader>
        {!shouldHideRepostHeadlineAndTags && (
          <CardTitle className="min-h-[4.5rem]" lineClamp="line-clamp-3">
            {title}
          </CardTitle>
        )}
      </CardTextContainer>
      {!shouldHideRepostHeadlineAndTags && !!cardTags?.length && (
        <PostTags className="mx-4 mt-0" post={{ tags: cardTags }} />
      )}
      <PostMetadata
        className="mx-4 mt-1 line-clamp-1 break-words"
        createdAt={post.createdAt}
        readTime={post.readTime}
      >
        {metadataContent}
      </PostMetadata>
      <Container>
        {threadBody && (
          <p className="mx-4 mt-1 line-clamp-6 whitespace-pre-line break-words text-text-primary typo-callout">
            {threadBody}
          </p>
        )}
        {showQuoteDetail ? (
          <div className={`${quoteDetailsContainerClass} flex flex-col`}>
            <div className="mb-2 flex items-center justify-start gap-2">
              {!!embeddedTweetAvatarUser && (
                <ProfilePicture
                  user={embeddedTweetAvatarUser}
                  size={ProfileImageSize.Small}
                  rounded="full"
                  nativeLazyLoading
                />
              )}
              <div className="min-w-0">
                {!!embeddedTweetIdentity && (
                  <p className="truncate text-text-tertiary typo-footnote">
                    {embeddedTweetIdentity}
                  </p>
                )}
              </div>
            </div>
            <p
              className={`
                mt-1 whitespace-pre-line break-words typo-callout ${embeddedTweetTextColorClass}
                ${quoteDetailsTextClampClass}
              `}
            >
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

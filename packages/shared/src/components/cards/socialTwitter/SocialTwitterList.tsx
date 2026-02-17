import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo, useRef } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container, Separator } from '../common/common';
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
import { PostType } from '../../../graphql/posts';
import PostTags from '../common/PostTags';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';
import { fallbackImages } from '../../../lib/config';
import { cloudinarySquadsImageFallback } from '../../../lib/image';

const UNKNOWN_SOURCE_ID = 'unknown';
const EMBEDDED_TWEET_AVATAR_FALLBACK = fallbackImages.avatar.replace(
  't_logo,',
  '',
);
const isSquadPlaceholderAvatar = (image?: string): boolean =>
  !!image &&
  (image === cloudinarySquadsImageFallback ||
    image.includes('squad_placeholder'));

const getPostText = ({
  content,
  contentHtml,
}: {
  content?: string;
  contentHtml?: string;
}): string | undefined => {
  const rawText =
    content || (contentHtml ? sanitizeMessage(contentHtml, []) : null);
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
    openNewTab,
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
  const postForTags = post.tags?.length ? post : post.sharedPost || post;
  const showReferenceTweet = post.sharedPost?.type === PostType.SocialTwitter;
  const showMediaCover = !!image && !showReferenceTweet;
  const repostText =
    post.subType === 'repost'
      ? getPostText({
          content: post.content,
          contentHtml: post.contentHtml,
        })
      : undefined;
  const shouldHideRepostHeadlineAndTags =
    post.subType === 'repost' && !repostText;
  const quoteDetailsTextClampClass = shouldHideRepostHeadlineAndTags
    ? 'line-clamp-8'
    : 'line-clamp-4';
  const referenceHandle =
    post.sharedPost?.source?.id === UNKNOWN_SOURCE_ID
      ? post.sharedPost?.creatorTwitter ||
        post.creatorTwitter ||
        post.sharedPost?.author?.username
      : post.sharedPost?.source?.handle;
  const sourceHandle =
    post.source?.id === UNKNOWN_SOURCE_ID
      ? post.creatorTwitter || post.author?.username
      : post.source?.handle;
  const metadataHandles =
    post.subType === 'repost'
      ? [sourceHandle].filter(Boolean)
      : [...new Set([sourceHandle, referenceHandle].filter(Boolean))];
  const cleanedTitle = removeHandlePrefixFromTitle({
    title: truncatedTitle,
    sourceHandle,
    authorHandle: post.author?.username,
  });
  const quotedSourceName = post.sharedPost?.source?.name;
  const isUnknownQuotedSourceName =
    quotedSourceName?.toLowerCase() === UNKNOWN_SOURCE_ID;
  const embeddedTweetName =
    !isUnknownQuotedSourceName && quotedSourceName
      ? quotedSourceName
      : post.sharedPost?.author?.name;
  const embeddedTweetDisplayName =
    embeddedTweetName ||
    (referenceHandle && formatHandleAsDisplayName(referenceHandle));
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
      referenceHandle ||
      'shared-post-avatar',
    image: embeddedTweetAvatar,
    username: referenceHandle,
    name: embeddedTweetName,
  };
  const embeddedTweetTextColorClass = post.read
    ? 'text-text-tertiary'
    : 'text-text-primary';

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
          title: post.title,
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
            bottomLabel: metadataHandles.length ? (
              <>
                {metadataHandles.map((handle, index) => (
                  <React.Fragment key={handle}>
                    {index > 0 && <Separator />}@{handle}
                    {post.subType === 'repost' && index === 0
                      ? ' reposted'
                      : ''}
                  </React.Fragment>
                ))}
              </>
            ) : (
              metadata.bottomLabel
            ),
          }}
          postLink={post.commentsPermalink}
          openNewTab={openNewTab}
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
                {cleanedTitle}
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
              <div className="mt-4 w-full rounded-12 border border-border-subtlest-tertiary p-3">
                <div className="mb-2 flex items-start gap-2">
                  {!!embeddedTweetAvatarUser && (
                    <ProfilePicture
                      user={embeddedTweetAvatarUser}
                      size={ProfileImageSize.Medium}
                      rounded="full"
                      nativeLazyLoading
                    />
                  )}
                  <div className="min-w-0">
                    {!!embeddedTweetDisplayName && (
                      <p
                        className={classNames(
                          'truncate font-bold typo-callout',
                          embeddedTweetTextColorClass,
                        )}
                      >
                        {embeddedTweetDisplayName}
                      </p>
                    )}
                    {!!referenceHandle && (
                      <p
                        className={classNames(
                          'truncate font-bold typo-callout',
                          embeddedTweetTextColorClass,
                        )}
                      >
                        @{referenceHandle}
                      </p>
                    )}
                  </div>
                </div>
                <p
                  className={classNames(
                    'mt-1 whitespace-pre-line break-words typo-callout',
                    embeddedTweetTextColorClass,
                    quoteDetailsTextClampClass,
                  )}
                >
                  {post.sharedPost?.title}
                </p>
              </div>
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

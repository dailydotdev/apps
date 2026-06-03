import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ContentEmbed, ContentEmbedPost } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { Image, ImageType } from '../image/Image';
import { SourceAvatar } from '../profile/source/SourceAvatar';
import { ProfileImageSize } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import PostMetadata from '../cards/common/PostMetadata';
import { Separator } from '../cards/common/common';
import { PostUpvotesCommentsCount } from '../post/PostUpvotesCommentsCount';
import { useAuthContext } from '../../contexts/AuthContext';
import { anchorDefaultRel } from '../../lib/strings';

type ContentEmbedVariant = 'post' | 'comment';

type ContentEmbedsProps = {
  embeds?: ContentEmbed[] | null;
  variant?: ContentEmbedVariant;
  className?: string;
};

type DailyPostEmbedProps = {
  post: ContentEmbedPost;
  url: string;
  variant: ContentEmbedVariant;
};

const getPostHref = (post: ContentEmbedPost, fallbackUrl: string): string =>
  post.commentsPermalink || fallbackUrl;

const isPostEmbed = (
  embed: ContentEmbed,
): embed is ContentEmbed & { post: ContentEmbedPost } =>
  embed.referenceType === 'post' && !!embed.post;

const isEmbedVideoPost = (post: ContentEmbedPost): boolean =>
  post.type === PostType.VideoYouTube ||
  (post.type === PostType.Share &&
    post.sharedPost?.type === PostType.VideoYouTube);

const DailyPostEmbed = ({
  post,
  url,
  variant,
}: DailyPostEmbedProps): ReactElement => {
  const href = getPostHref(post, url);
  const isCommentVariant = variant === 'comment';
  const { source } = post;
  const sourceLabel = source?.name || source?.handle;
  const { user } = useAuthContext() ?? {};
  const pollMetadata =
    post.type === PostType.Poll
      ? {
          endsAt: post.endsAt,
          isAuthor: user?.id === post.author?.id,
          numPollVotes: post.numPollVotes,
        }
      : undefined;
  const hasPostMetadata =
    !!post.createdAt ||
    post.readTime !== undefined ||
    !!post.numCollectionSources ||
    !!pollMetadata;

  return (
    <a
      href={href}
      target="_blank"
      rel={anchorDefaultRel}
      className={classNames(
        'flex min-w-0 items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-3 hover:border-border-subtlest-secondary',
        isCommentVariant ? 'mt-3' : 'mt-4',
      )}
    >
      <Image
        src={post.image}
        alt={post.title || 'Embedded post cover image'}
        type={ImageType.Post}
        loading="lazy"
        className={classNames(
          'shrink-0 rounded-10 object-cover',
          isCommentVariant ? 'size-16' : 'size-24',
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {(source || hasPostMetadata) && (
          <div className="flex min-w-0 items-center overflow-hidden text-text-tertiary typo-caption1">
            {source && (
              <>
                <SourceAvatar
                  source={source}
                  size={ProfileImageSize.Size16}
                  className="mr-1 shrink-0"
                />
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Secondary}
                  className="min-w-0 shrink truncate leading-4"
                >
                  {sourceLabel}
                </Typography>
              </>
            )}
            {source && hasPostMetadata && <Separator className="shrink-0" />}
            {hasPostMetadata && (
              <PostMetadata
                createdAt={post.createdAt}
                readTime={post.readTime}
                isVideoType={isEmbedVideoPost(post)}
                numSources={post.numCollectionSources}
                pollMetadata={pollMetadata}
                className="!typo-caption1"
              />
            )}
          </div>
        )}
        <Typography
          type={
            isCommentVariant ? TypographyType.Footnote : TypographyType.Body
          }
          color={TypographyColor.Primary}
          className={classNames(
            'line-clamp-2 break-words font-bold',
            isCommentVariant && 'leading-5',
          )}
        >
          {post.title}
        </Typography>
        <PostUpvotesCommentsCount
          post={post}
          passive
          compact
          className="!typo-caption1"
        />
      </div>
    </a>
  );
};

export const ContentEmbeds = ({
  embeds,
  variant = 'post',
  className,
}: ContentEmbedsProps): ReactElement | null => {
  const postEmbeds = (embeds ?? [])
    .filter(isPostEmbed)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (!postEmbeds.length) {
    return null;
  }

  return (
    <div className={classNames('flex flex-col', className)}>
      {postEmbeds.map((embed) => (
        <DailyPostEmbed
          key={embed.id}
          post={embed.post}
          url={embed.url}
          variant={variant}
        />
      ))}
    </div>
  );
};

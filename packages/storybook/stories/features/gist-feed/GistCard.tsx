import type { KeyboardEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { isSourceUserSource } from '@dailydotdev/shared/src/graphql/sources';
import FeedItemContainer from '@dailydotdev/shared/src/components/cards/common/list/FeedItemContainer';
import { CardContainer } from '@dailydotdev/shared/src/components/cards/common/list/ListCard';
import { PostCardHeader } from '@dailydotdev/shared/src/components/cards/common/list/PostCardHeader';
import { Container } from '@dailydotdev/shared/src/components/cards/common/common';
import ActionButtons from '@dailydotdev/shared/src/components/cards/common/ActionButtons';
import SourceButton from '@dailydotdev/shared/src/components/cards/common/SourceButton';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import {
  DiscussIcon,
  OpenLinkIcon,
  PlayIcon,
  SparkleIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import { getPostPath } from '@dailydotdev/shared/src/lib/links';
import type { Gist, GistKind } from './gists';

const WORDS_PER_MINUTE = 230;

const kindLabel: Record<GistKind, string> = {
  news: 'News',
  release: 'Release',
  opinion: 'Opinion',
  story: 'Story',
  explainer: 'Explainer',
  tool: 'Tool',
  video: 'Video',
  collection: 'Roundup',
};

export const getGistReadTime = (gist: Gist): number => {
  const words = [
    gist.lead,
    ...gist.body,
    gist.bottomLine ?? '',
    gist.question ?? '',
  ]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

const getReadTimeLabel = (post: Post, gist: Gist): string => {
  const gistReadTime = getGistReadTime(gist);
  if (!post.readTime || post.readTime <= gistReadTime) {
    return `${gistReadTime} min gist`;
  }

  const unit = post.type === PostType.VideoYouTube ? 'video' : 'read';
  return `${gistReadTime} min gist of a ${post.readTime} min ${unit}`;
};

/** Backticks become inline code; everything else stays plain text. */
const InlineText = ({ text }: { text: string }): ReactElement => (
  <>
    {text.split(/(`[^`]+`)/).map((part, index) =>
      part.startsWith('`') && part.endsWith('`') ? (
        <code
          // The split keeps the order stable, so the index is the identity.
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="rounded-4 bg-surface-float px-1 font-mono typo-footnote"
        >
          {part.slice(1, -1)}
        </code>
      ) : (
        part
      ),
    )}
  </>
);

const Paragraph = ({ text }: { text: string }): ReactElement => {
  const lines = text.split('\n');
  if (lines.every((line) => line.startsWith('- '))) {
    return (
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {lines.map((line) => (
          <li key={line}>
            <InlineText text={line.slice(2)} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p>
      <InlineText text={text} />
    </p>
  );
};

/** "His take: ..." already names the sentence, so it replaces the label. */
const BottomLine = ({ text }: { text: string }): ReactElement => {
  const ownLabel = text.match(/^([^.:`]{1,30}):\s(.*)$/s);

  return (
    <p>
      <strong className="font-bold">
        {ownLabel ? ownLabel[1] : 'Bottom line'}:{' '}
      </strong>
      <InlineText text={ownLabel ? ownLabel[2] : text} />
    </p>
  );
};

const GistMeta = ({ post, gist }: { post: Post; gist: Gist }): ReactElement => {
  const origin =
    gist.basis === 'summary'
      ? 'Written by AI from a summary of the original'
      : 'Written by AI from the original';

  return (
    <Tooltip content={origin}>
      <span className="relative z-1 flex min-w-0 items-center gap-1 text-text-tertiary typo-footnote">
        <SparkleIcon size={IconSize.Size16} className="shrink-0" />
        <span className="min-w-0 shrink truncate">
          {kindLabel[gist.kind] ?? 'Gist'} &middot;{' '}
          {getReadTimeLabel(post, gist)}
        </span>
      </span>
    </Tooltip>
  );
};

interface GistContentProps {
  /** The post the gist is about: the shared post for a share. */
  post: Post;
  /** The feed post, which owns the comments. */
  feedPost: Post;
  gist: Gist;
  initialExpanded?: boolean;
  onCollapse: () => void;
}

const GistContent = ({
  post,
  feedPost,
  gist,
  initialExpanded = false,
  onCollapse,
}: GistContentProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const isVideo = post.type === PostType.VideoYouTube;
  const hasMore = gist.body.length > 0 || !!gist.bottomLine || !!gist.question;
  const toggle = () => {
    if (!hasMore) {
      return;
    }
    if (isExpanded) {
      // After the shorter card renders, so the jump lands on its new layout.
      setTimeout(onCollapse);
    }
    setIsExpanded((value) => !value);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  };
  const showOriginalTitle = !!post.title && post.title !== gist.title;

  return (
    <>
      <div className="mt-4 flex items-start gap-3">
        <h3 className="min-w-0 flex-1 break-words font-bold text-text-primary typo-title3">
          {gist.title}
        </h3>
        {post.image && (
          <div className="relative h-16 w-24 shrink-0 tablet:h-20 tablet:w-[7.5rem]">
            <Image
              src={post.image}
              alt="Post cover image"
              loading="lazy"
              className="size-full rounded-12 object-cover"
            />
            {isVideo && (
              <span className="absolute inset-0 flex items-center justify-center rounded-12 bg-overlay-tertiary-black">
                <PlayIcon secondary size={IconSize.Medium} />
              </span>
            )}
          </div>
        )}
      </div>
      <div
        role={hasMore ? 'button' : undefined}
        tabIndex={hasMore ? 0 : undefined}
        aria-expanded={hasMore ? isExpanded : undefined}
        onClick={toggle}
        onKeyDown={hasMore ? onKeyDown : undefined}
        className={classNames(
          'relative z-1 mt-2 flex flex-col gap-3 break-words text-left text-text-primary typo-callout',
          hasMore && 'cursor-pointer',
        )}
      >
        <Paragraph text={gist.lead} />
        {isExpanded && (
          <>
            {gist.body.map((paragraph) => (
              <Paragraph key={paragraph} text={paragraph} />
            ))}
            {gist.bottomLine && <BottomLine text={gist.bottomLine} />}
          </>
        )}
      </div>
      {isExpanded && gist.question && (
        <div className="relative z-1 mt-3 flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3">
          <span className="flex items-center gap-1 font-bold text-text-tertiary typo-footnote">
            <DiscussIcon size={IconSize.Size16} />
            Worth discussing
          </span>
          <p className="text-text-primary typo-callout">{gist.question}</p>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            icon={<DiscussIcon />}
            className="self-start"
            onClick={fn()}
          >
            {feedPost.numComments
              ? `Join ${feedPost.numComments} ${
                  feedPost.numComments === 1 ? 'comment' : 'comments'
                }`
              : 'Start the discussion'}
          </Button>
        </div>
      )}
      {isExpanded && post.type !== PostType.Collection && post.permalink && (
        <div className="relative z-1 mt-3 flex items-center gap-3 rounded-12 bg-surface-float py-2 pl-3 pr-2">
          <span className="min-w-0 flex-1 truncate text-text-tertiary typo-footnote">
            {showOriginalTitle ? (
              <>Original: {post.title}</>
            ) : (
              <>On {post.domain}</>
            )}
          </span>
          <Button
            tag="a"
            href={post.permalink}
            target="_blank"
            rel="noopener"
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
            icon={<OpenLinkIcon />}
            iconPosition={ButtonIconPosition.Right}
          >
            {isVideo ? 'Watch' : 'Read article'}
          </Button>
        </div>
      )}
      <span className="mt-3 flex items-center gap-3">
        {hasMore && (
          <button
            type="button"
            className="relative z-1 shrink-0 font-bold text-text-link typo-footnote"
            onClick={toggle}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <GistMeta post={post} gist={gist} />
      </span>
    </>
  );
};

const cardHandlers = {
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
};

interface GistCardProps {
  post: Post;
  gist: Gist;
  initialExpanded?: boolean;
}

export const GistCard = ({
  post,
  gist,
  initialExpanded,
}: GistCardProps): ReactElement => {
  const cardRef = useRef<HTMLElement>(null);
  const isShare = post.type === PostType.Share && !!post.sharedPost;
  const target = isShare ? (post.sharedPost as Post) : post;
  const isUserSource = isSourceUserSource(post.source);
  const authorName = post.author?.name ?? post.source?.name;
  // Where the shared link is from; shares of unknown sites carry only a domain.
  const sharedFrom =
    target.source?.id === 'unknown' ? target.domain : target.source?.name;
  // Collapsing a long gist would leave the reader further down the feed.
  const onCollapse = () => {
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 0) {
      card.scrollIntoView({ block: 'start' });
    }
  };

  return (
    <FeedItemContainer
      ref={cardRef}
      domProps={{ className: 'scroll-mt-16' }}
      flagProps={{ type: target.type }}
      linkProps={{ title: gist.title, href: getPostPath(post) }}
    >
      <CardContainer>
        <PostCardHeader
          post={{ ...post, type: target.type }}
          postLink={target.permalink}
          onReadArticleClick={fn()}
          metadata={
            isShare
              ? { topLabel: authorName, bottomLabel: sharedFrom }
              : { topLabel: post.source?.name }
          }
        >
          {!isUserSource && post.source && (
            <SourceButton
              size={ProfileImageSize.Large}
              source={post.source}
              className="relative"
            />
          )}
        </PostCardHeader>
        {isShare && !!post.title && (
          <p className="mt-3 break-words border-l-2 border-border-subtlest-secondary pl-3 text-text-secondary typo-callout">
            {post.title}
          </p>
        )}
        <GistContent
          post={target}
          feedPost={post}
          gist={gist}
          initialExpanded={initialExpanded}
          onCollapse={onCollapse}
        />
      </CardContainer>
      <Container className="pointer-events-none flex-[unset]">
        <ActionButtons
          className="mt-4 justify-between"
          post={post}
          variant="list"
          {...cardHandlers}
        />
      </Container>
    </FeedItemContainer>
  );
};

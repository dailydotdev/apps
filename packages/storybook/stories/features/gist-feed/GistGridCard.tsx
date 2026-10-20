import type { ReactElement } from 'react';
import type { CSSProperties } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import FeedItemContainer from '@dailydotdev/shared/src/components/cards/common/FeedItemContainer';
import CardOverlay from '@dailydotdev/shared/src/components/cards/common/CardOverlay';
import {
  CardSpace,
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '@dailydotdev/shared/src/components/cards/common/Card';
import { Container } from '@dailydotdev/shared/src/components/cards/common/common';
import { PostCardHeader } from '@dailydotdev/shared/src/components/cards/common/PostCardHeader';
import ActionButtons from '@dailydotdev/shared/src/components/cards/common/ActionButtons';
import { HighlightChip } from '@dailydotdev/shared/src/components/cards/common/HighlightChip';
import type { FeaturedWideColSpan } from '@dailydotdev/shared/src/components/cards/common/featuredWide';
import {
  featuredWideGridClass,
  featuredWideTextColClass,
} from '@dailydotdev/shared/src/components/cards/common/featuredWide';
import { FeaturedWideCardShell } from '@dailydotdev/shared/src/components/cards/common/FeaturedWideCardShell';
import { FeaturedWideTextContainer } from '@dailydotdev/shared/src/components/cards/common/FeaturedWideTextContainer';
import { FeaturedWideActions } from '@dailydotdev/shared/src/components/cards/common/FeaturedWideActions';
import { FeaturedWideImageColumn } from '@dailydotdev/shared/src/components/cards/common/FeaturedWideImageColumn';
import SourceButton from '@dailydotdev/shared/src/components/cards/common/SourceButton';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/Button';
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import { PlayIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Gist } from './gists';
import {
  BottomLine,
  GistDiscussion,
  GistMeta,
  GistSource,
  InlineText,
  Paragraph,
} from './GistCard';

// Room the panel leaves for the sticky feed header and the bottom edge.
const TOP_CLEARANCE = 72;
const BOTTOM_CLEARANCE = 16;

const cardHandlers = {
  onUpvoteClick: fn(),
  onDownvoteClick: fn(),
  onCommentClick: fn(),
  onBookmarkClick: fn(),
  onCopyLinkClick: fn(),
};

interface GistPeekProps {
  post: Post;
  /** The post the gist is about: the shared post for a share. */
  target: Post;
  gist: Gist;
  isWide: boolean;
  /** The last column opens leftward so the panel stays on screen. */
  alignRight: boolean;
  onClose: () => void;
}

/**
 * The full gist floats over the grid instead of growing the card, since a
 * taller card would stretch its whole row and push every row below it. It
 * opens fully on screen and scrolls inside itself, so reading it never moves
 * the page and closing it leaves the feed exactly where it was.
 */
const GistPeek = ({
  post,
  target,
  gist,
  isWide,
  alignRight,
  onClose,
}: GistPeekProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const isShare = post.type === PostType.Share;
  const [placement, setPlacement] = useState<CSSProperties>({
    visibility: 'hidden',
  });

  useLayoutEffect(() => {
    const panel = ref.current;
    const anchor = panel?.parentElement;
    if (!panel || !anchor) {
      return;
    }
    const maxHeight = window.innerHeight - TOP_CLEARANCE - BOTTOM_CLEARANCE;
    const height = Math.min(panel.scrollHeight, maxHeight);
    const anchorTop = anchor.getBoundingClientRect().top;
    const viewportTop = Math.min(
      Math.max(anchorTop, TOP_CLEARANCE),
      window.innerHeight - BOTTOM_CLEARANCE - height,
    );
    setPlacement({ top: viewportTop - anchorTop, maxHeight });
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={gist.title}
      style={placement}
      className={classNames(
        'absolute z-3 flex flex-col overflow-y-auto overscroll-contain rounded-16 border border-border-subtlest-secondary bg-background-subtle p-4 shadow-2',
        alignRight ? 'right-0' : 'left-0',
        isWide ? 'w-full' : 'w-[calc(200%+2rem)]',
      )}
    >
      <div className="flex items-center gap-2">
        {post.source && (
          <SourceButton
            size={ProfileImageSize.Small}
            source={post.source}
            className="relative"
          />
        )}
        <span className="min-w-0 flex-1 truncate text-text-tertiary typo-footnote">
          {isShare
            ? `${post.author?.name ?? post.source?.name} shared`
            : post.source?.name}
        </span>
        <CloseButton size={ButtonSize.XSmall} onClick={onClose} />
      </div>
      {isShare && !!post.title && (
        <p className="mt-3 break-words border-l-2 border-border-subtlest-secondary pl-3 text-text-secondary typo-callout">
          {post.title}
        </p>
      )}
      <h3 className="mt-3 break-words font-bold text-text-primary typo-title3">
        {gist.title}
      </h3>
      <div className="mt-2 flex flex-col gap-3 break-words text-text-primary typo-callout">
        <Paragraph text={gist.lead} />
        {gist.body.map((paragraph) => (
          <Paragraph key={paragraph} text={paragraph} />
        ))}
        {gist.bottomLine && <BottomLine text={gist.bottomLine} />}
      </div>
      {gist.question && (
        <GistDiscussion
          question={gist.question}
          numComments={post.numComments}
        />
      )}
      <GistSource post={target} gist={gist} />
      <span className="mt-3 flex items-center gap-3">
        <button
          type="button"
          className="shrink-0 font-bold text-text-link typo-footnote"
          onClick={onClose}
        >
          Show less
        </button>
        <GistMeta post={target} gist={gist} />
      </span>
    </div>
  );
};

/** The lead and the way into the rest, shared by the regular and wide cards. */
const GistTeaser = ({
  target,
  gist,
  lineClamp,
  onOpen,
}: {
  target: Post;
  gist: Gist;
  lineClamp: `line-clamp-${number}`;
  onOpen: () => void;
}): ReactElement => (
  <>
    <button
      type="button"
      className="mt-2 text-left text-text-secondary typo-callout"
      onClick={onOpen}
    >
      <span className={classNames('break-words', lineClamp)}>
        <InlineText text={gist.lead} />
      </span>
    </button>
    <span className="mt-2 flex min-w-0 items-center gap-2">
      <button
        type="button"
        className="shrink-0 font-bold text-text-link typo-footnote"
        onClick={onOpen}
      >
        Show more
      </button>
      <GistMeta post={target} gist={gist} compact />
    </span>
  </>
);

interface GistGridCardProps {
  post: Post;
  gist: Gist;
  column: number;
  columns: number;
  wideColSpan?: FeaturedWideColSpan;
}

export const GistGridCard = ({
  post,
  gist,
  column,
  columns,
  wideColSpan,
}: GistGridCardProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const readPost = { ...post, read: isRead };
  const isShare = post.type === PostType.Share && !!post.sharedPost;
  const target = isShare ? (post.sharedPost as Post) : post;
  const isVideo = target.type === PostType.VideoYouTube;
  const isWide = !!wideColSpan;
  const open = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    setIsRead(true);
  };
  const header = (
    <PostCardHeader
      post={{ ...post, type: target.type }}
      className="flex"
      openNewTab
      source={post.source!}
      postLink={target.permalink!}
      onReadArticleClick={fn()}
    />
  );

  return (
    <div
      className={classNames('relative h-full', isOpen && 'z-3')}
      style={isWide ? { gridColumn: `span ${wideColSpan}` } : undefined}
    >
      {isWide ? (
        <FeaturedWideCardShell
          post={readPost}
          domProps={{ className: 'h-full' }}
          onPostClick={fn()}
          onPostAuxClick={fn()}
          overlayAriaLabel={gist.title}
          significance={target.hero?.significance ?? post.hero?.significance}
        >
          <div
            className={classNames(
              'absolute inset-0 grid h-full min-h-0 gap-3 overflow-hidden laptop:gap-4',
              featuredWideGridClass({
                hasMedia: !!target.image,
                wideColSpan,
              }),
            )}
          >
            <div
              className={classNames(
                'relative flex min-h-0 min-w-0 flex-col overflow-hidden',
                featuredWideTextColClass({ hasMedia: !!target.image }),
              )}
            >
              <FeaturedWideTextContainer>
                {header}
                <h3 className="mt-2 line-clamp-3 break-words font-bold text-text-primary typo-title2">
                  {gist.title}
                </h3>
                <div className="mt-2 flex min-w-0 items-center gap-2">
                  <HighlightChip
                    significance={post.hero?.significance}
                    className="shrink-0"
                  />
                </div>
                <GistTeaser
                  target={target}
                  gist={gist}
                  lineClamp="line-clamp-4"
                  onOpen={open}
                />
              </FeaturedWideTextContainer>
              <FeaturedWideActions post={post} {...cardHandlers} />
            </div>
            {!!target.image && (
              <FeaturedWideImageColumn
                image={target.image}
                alt={gist.title}
                wideColSpan={wideColSpan}
                isVideoType={isVideo}
              />
            )}
          </div>
        </FeaturedWideCardShell>
      ) : (
        <FeedItemContainer
          domProps={{
            className: getPostClassNames(readPost, 'min-h-card h-full'),
          }}
          bookmarked={post.bookmarked}
        >
          <CardOverlay
            post={post}
            ariaLabel={gist.title}
            onPostCardClick={fn()}
            onPostCardAuxClick={fn()}
          />
          <div className="flex flex-1 flex-col">
            <CardTextContainer>
              {header}
              <CardTitle>{gist.title}</CardTitle>
              <GistTeaser
                target={target}
                gist={gist}
                lineClamp="line-clamp-4"
                onOpen={open}
              />
            </CardTextContainer>
            <CardSpace />
            <Container>
              {!!target.image && (
                <div className="relative mx-1 mb-1 mt-2">
                  <Image
                    src={target.image}
                    alt="Post cover image"
                    loading="lazy"
                    className="h-24 w-full rounded-12 object-cover"
                  />
                  {isVideo && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-12 bg-overlay-tertiary-black">
                      <PlayIcon secondary size={IconSize.Large} />
                    </span>
                  )}
                </div>
              )}
              <ActionButtons post={post} {...cardHandlers} />
            </Container>
          </div>
        </FeedItemContainer>
      )}
      {isOpen && (
        <GistPeek
          post={post}
          target={target}
          gist={gist}
          isWide={isWide}
          alignRight={!isWide && column >= columns - 1}
          onClose={close}
        />
      )}
    </div>
  );
};

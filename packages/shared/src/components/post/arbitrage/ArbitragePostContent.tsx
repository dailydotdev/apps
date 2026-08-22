import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { isVideoPost } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';
import usePostContent from '../../../hooks/usePostContent';
import PostMetadata from '../../cards/common/PostMetadata';
import PostSourceInfo from '../PostSourceInfo';
import { PostHeaderActions } from '../PostHeaderActions';
import { ButtonSize } from '../../buttons/common';
import { PostTagList } from '../tags/PostTagList';
import { PostContainer } from '../common';
import {
  COLUMN_LEFT_PROPERTY,
  COLUMN_WIDTH_PROPERTY,
  PostContentContainerRaw,
} from './common';
import YoutubeVideo from '../../video/YoutubeVideo';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { TruncateText } from '../../utilities';
import Markdown from '../../Markdown';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { ArbitrageTopLeaderboard } from './ArbitrageTopLeaderboard';
import {
  ARBITRAGE_SLOT,
  COMMENTS_PER_INTERLEAVED_AD,
  TOP_LEADERBOARD_STICKY_MS,
} from './slots';
import { useTimedRelease } from './useTimedRelease';
import { GoBackHeaderMobile } from '../GoBackHeaderMobile';
import { PostWidgets, PostWidgetPosition } from '../PostWidgets';
import PostEngagements from '../PostEngagements';

/**
 * One slot per real rail widget, in render order. The rail is the page's only
 * column with no article in it, so every widget there earns a unit; the two
 * that are already commercial (the house ad widget and the sponsored tools
 * card) have no position and so get none.
 *
 * Below laptop the rail stacks under the article rather than beside it, so
 * an unfiltered run lands every unit on a phone too — measured at roughly 40%
 * of page height against the Better Ads Standards' 30% mobile cap, and
 * Chrome's ad filter for a violation applies to the whole domain, direct-sold
 * inventory included. Only the first rail unit keeps its phone placement; the
 * rest are desktop-only, which brings the phone run to roughly 27% with the
 * second closing grid already desktop-only.
 */
const RAIL_AD: Record<
  PostWidgetPosition,
  {
    slot: number;
    format: ArbitrageAdFormat;
    className?: string;
    hideOnPhone?: boolean;
  }
> = {
  [PostWidgetPosition.Source]: {
    slot: ARBITRAGE_SLOT.railAfterSource,
    format: ArbitrageAdFormat.MediumRectangle,
  },
  [PostWidgetPosition.Creator]: {
    slot: ARBITRAGE_SLOT.railAfterCreator,
    format: ArbitrageAdFormat.MediumRectangle,
    hideOnPhone: true,
  },
  [PostWidgetPosition.Share]: {
    slot: ARBITRAGE_SLOT.railAfterShare,
    format: ArbitrageAdFormat.MediumRectangle,
    hideOnPhone: true,
  },
  [PostWidgetPosition.Highlights]: {
    slot: ARBITRAGE_SLOT.railAfterHighlights,
    format: ArbitrageAdFormat.MediumRectangle,
    hideOnPhone: true,
  },
  [PostWidgetPosition.SimilarPosts]: {
    slot: ARBITRAGE_SLOT.railBetweenFurtherReading,
    format: ArbitrageAdFormat.MediumRectangle,
    hideOnPhone: true,
  },
};

export interface ArbitragePostContentProps {
  post: Post;
  className?: string;
}

/**
 * Ad-monetised post template for paid and organic landing traffic.
 *
 * Forked from the classic PostContent layout rather than the focus card: for
 * scraped articles neither template has a body to render, so the focus card's
 * only real advantage does not apply, while the widget column it lacks carries
 * three always-viewable slots. Signup surfaces (PostAuthBanner,
 * CustomAuthBanner, PostSignupWidget) are deliberately absent — the header
 * login/signup buttons remain the only account entry point.
 *
 * A fork rather than variant props on PostContent: threading a dozen slot
 * positions and removed surfaces through the production component would put
 * ad concerns in every consumer's render path (modals and the extension
 * included) for a template that may not survive its experiment. The cost is
 * accepted, not free — fixes to PostContent's column structure must be
 * mirrored here, and if /read wins, folding this back is the follow-up debt.
 */
export function ArbitragePostContent({
  post,
  className,
}: ArbitragePostContentProps): ReactElement {
  const isVideoType = isVideoPost(post);
  const { onReadArticle, onCopyPostLink } = usePostContent({
    origin: Origin.ArticlePage,
    post,
  });
  const leaderboardReleased = useTimedRelease(
    TOP_LEADERBOARD_STICKY_MS,
    'scroll',
  );
  const columnRef = useRef<HTMLElement>(null);

  // The floating leaderboard is fixed to the viewport, so it cannot see that
  // the article column is inset by the sidebar. Publishing the column's
  // geometry is what lets it line up with the top leaderboard instead of
  // spanning the page under the rail. A resize listener alongside the observer
  // because past 72rem of space the column stops growing and only moves, which
  // resizes nothing for the observer to report.
  useEffect(() => {
    const element = columnRef.current;
    if (!element) {
      return undefined;
    }

    const root = globalThis.document.documentElement;
    const publish = (): void => {
      const { left, width } = element.getBoundingClientRect();
      root.style.setProperty(COLUMN_LEFT_PROPERTY, `${Math.round(left)}px`);
      root.style.setProperty(COLUMN_WIDTH_PROPERTY, `${Math.round(width)}px`);
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(element);
    globalThis.addEventListener('resize', publish);

    return () => {
      observer.disconnect();
      globalThis.removeEventListener('resize', publish);
      root.style.removeProperty(COLUMN_LEFT_PROPERTY);
      root.style.removeProperty(COLUMN_WIDTH_PROPERTY);
    };
  }, []);

  return (
    <PostContentContainerRaw className={className}>
      {/* PostContainer is overflow-hidden, which would make it the scroll
          container for the leaderboard's sticky position and stop it pinning.
          overflow-x: clip alongside overflow-y: visible clips the column the
          same way without creating a scroll container. */}
      <PostContainer
        ref={columnRef}
        className="relative !overflow-x-clip !overflow-y-visible"
        data-testid="postContainer"
      >
        {/* Below laptop the leaderboard and the production mobile header pin
            as one block, so the header cannot ride up over the ad the way it
            did when each was sticky on its own. The header's own sticky is off
            while the block is pinned, or it would climb to the top of it and
            land on the leaderboard anyway.

            Once the ten second window closes the block releases: the ad
            scrolls away with the page and the header, back on its own sticky,
            takes the top over. `contents` rather than a class swap because the
            header's sticky is bounded by its containing block, and a wrapper
            that still generated a box would let it pin only as far as the
            wrapper's own few pixels of height.

            Transparent from laptop up, where the header does not render and
            the leaderboard pins itself against the fixed chrome instead. */}
        <div
          className={classNames(
            leaderboardReleased
              ? 'contents'
              : 'sticky top-0 z-postNavigation bg-background-default laptop:contents',
          )}
        >
          <ArbitrageTopLeaderboard released={leaderboardReleased} />

          <GoBackHeaderMobile
            className={classNames(
              '-mx-4 bg-background-subtle',
              !leaderboardReleased && '!static',
            )}
          >
            <PostHeaderActions
              post={post}
              className="ml-auto"
              contextMenuId="arbitrage-post-header-actions"
              onReadArticle={onReadArticle}
              buttonSize={ButtonSize.Small}
            />
          </GoBackHeaderMobile>
        </div>

        <div className="my-6">
          <div className="mb-3 flex items-center gap-2">
            <PostSourceInfo
              className="min-w-0 flex-1"
              post={post}
              onReadArticle={onReadArticle}
            />
          </div>
          <h1
            className="break-words font-bold typo-large-title"
            data-testid="post-modal-title"
          >
            <a
              href={post.permalink}
              title="Go to post"
              target="_blank"
              rel="noopener"
            >
              {post.title}
            </a>
          </h1>
        </div>

        {isVideoType && (
          <YoutubeVideo
            placeholderProps={{ post, onWatchVideo: () => undefined }}
            videoId={post.videoId ?? ''}
            className="mb-7"
          />
        )}

        {!!post.summary && (
          <div className="mb-6 overflow-hidden text-text-secondary">
            <p className="select-text break-words typo-markdown">
              {post.summary}
            </p>
          </div>
        )}

        {/* MPU 1 beside the tags, date and cover rather than above them, so the
            first ad shares the fold with real page furniture instead of
            standing alone. The slot is first in the DOM because a phone stacks
            the column and the brief puts the unit above the article, not below
            it; from laptop `order-last` moves it to the right of the group.

            The two halves are deliberately near equal — 336 for the unit
            against 385 for the article's, out of the column's 745 — so the ad
            reads as the cover's counterpart rather than as a tower beside it.
            items-end puts their bottom edges on the same line. */}
        <div className="mb-6 flex flex-col gap-6 laptop:flex-row laptop:items-end">
          <ArbitrageAdSlot
            slot={ARBITRAGE_SLOT.inlineMpu1}
            format={ArbitrageAdFormat.Rectangle}
            refreshes
            className="laptop:order-last"
          />

          <div className="min-w-0 flex-1">
            <PostTagList post={post} />
            <PostMetadata
              createdAt={post.createdAt}
              readTime={post.readTime}
              isVideoType={isVideoType}
              // The production post page's own spacing, verbatim.
              className="mb-8 mt-4 !typo-callout"
              domain={
                !isVideoType &&
                !!post.domain?.length && (
                  <TruncateText>
                    From{' '}
                    <a
                      href={post.permalink}
                      title={post.domain}
                      target="_blank"
                      rel="noopener"
                      className="hover:underline"
                    >
                      {post.domain}
                    </a>
                  </TruncateText>
                )
              }
            />

            {!isVideoType && (
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener"
                className="block cursor-pointer overflow-hidden rounded-16"
                style={{ maxWidth: '25.625rem' }}
              >
                <LazyImage
                  imgSrc={post.image}
                  imgAlt="Post cover image"
                  ratio="49%"
                  eager
                  fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                  fetchPriority="high"
                />
              </a>
            )}
          </div>
        </div>

        {!!post.contentHtml && (
          <Markdown
            className="my-6"
            content={post.contentHtml}
            appendTooltipTo={() => globalThis?.document?.body}
          />
        )}

        {/* The production engagement block verbatim — counts, actions, share,
            sort control, composer and thread — so everything from here to the
            end of the discussion matches the live post page exactly. The only
            addition is a native unit every few comments in a long thread. */}
        <PostEngagements
          post={post}
          onCopyLinkClick={onCopyPostLink}
          logOrigin={Origin.ArticlePage}
          interleaveEvery={COMMENTS_PER_INTERLEAVED_AD}
          renderInterleaved={() => (
            <ArbitrageAdSlot
              slot={ARBITRAGE_SLOT.commentNative}
              format={ArbitrageAdFormat.Native}
            />
          )}
        />

        {/* Everything from the action bar to the end of the thread above is the
            standard post page. Below it, multiplex units rather than a column
            of separate slots: one request returns a grid of creatives that
            Google lays out for the width it is given, which is both more
            inventory and less page than stacked single units were.

            Two grids rather than one, because past the end of the discussion
            there is no article left to interrupt — the visitor is either
            leaving or browsing, and a second grid is the only placement here
            that adds inventory without taking anything from the page. */}
        <div className="mb-10 mt-6 flex flex-col gap-6">
          <ArbitrageAdSlot
            slot={ARBITRAGE_SLOT.endOfArticleGrid}
            format={ArbitrageAdFormat.Grid}
          />
          {/* Laptop only: below it the same unit closes the stacked rail
              instead, so it is on the page exactly once at every width. */}
          <ArbitrageAdSlot
            slot={ARBITRAGE_SLOT.endOfArticleGridSecondary}
            format={ArbitrageAdFormat.Grid}
            className="hidden laptop:block"
          />
        </div>
      </PostContainer>

      {/* The production widget column, minus the signup card and the table of
          contents, with a slot after every widget that actually renders. */}
      <PostWidgets
        post={post}
        origin={Origin.ArticlePage}
        onCopyPostLink={onCopyPostLink}
        className="!gap-2 pb-8 pt-4 tablet:border-l tablet:border-border-subtlest-tertiary"
        hideSignupWidget
        hideToc
        trailing={
          <>
            {/* The rail is only a rail from laptop up; below that it stacks
                under the article, where a sticky tower has nothing to stick to
                and a 300x600 that does not fill leaves the page ending in
                600px of nothing. Each breakpoint gets the unit that suits it:
                the tower on the rail, a multiplex list closing the phone. */}
            <ArbitrageAdSlot
              slot={ARBITRAGE_SLOT.railStickyHalfPage}
              format={ArbitrageAdFormat.HalfPage}
              // Same header offset the top leaderboard uses, plus a gap,
              // rather than a hardcoded 5rem: under the v2 sidebar there is no
              // fixed header to clear and the unit would pin into empty space.
              className="hidden laptop:sticky laptop:top-[calc(var(--sticky-header-offset)+1rem)] laptop:block"
            />
            <ArbitrageAdSlot
              slot={ARBITRAGE_SLOT.endOfArticleGridSecondary}
              format={ArbitrageAdFormat.Grid}
              className="laptop:hidden"
            />
          </>
        }
        getRailAd={(position) => {
          const spec = RAIL_AD[position];

          return (
            <ArbitrageAdSlot
              slot={spec.slot}
              format={spec.format}
              className={spec.className}
              hideOnPhone={spec.hideOnPhone}
            />
          );
        }}
      />
    </PostContentContainerRaw>
  );
}

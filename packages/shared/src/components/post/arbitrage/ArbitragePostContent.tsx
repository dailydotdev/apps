import type { ReactElement } from 'react';
import React from 'react';
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
import { PostContentContainerRaw } from './common';
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
import { useStickyRelease } from './useStickyRelease';
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
 * every unit here also lands on a phone. Running all of them measured well
 * over the Better Ads Standards' 30% mobile ad density cap, which is what
 * gets a domain's ads filtered by Chrome, so the three added here are desktop
 * only and the phone keeps the two units the density review was run against.
 */
const RAIL_AD: Record<
  PostWidgetPosition,
  {
    slot: number;
    format: ArbitrageAdFormat;
    reach: string;
    className?: string;
    hideOnPhone?: boolean;
  }
> = {
  [PostWidgetPosition.Source]: {
    slot: ARBITRAGE_SLOT.railAfterSource,
    format: ArbitrageAdFormat.MediumRectangle,
    reach: '70%',
  },
  [PostWidgetPosition.Creator]: {
    slot: ARBITRAGE_SLOT.railAfterCreator,
    format: ArbitrageAdFormat.MediumRectangle,
    hideOnPhone: true,
    reach: '60%',
  },
  [PostWidgetPosition.Share]: {
    slot: ARBITRAGE_SLOT.railAfterShare,
    format: ArbitrageAdFormat.MediumRectangle,
    hideOnPhone: true,
    reach: '50%',
  },
  [PostWidgetPosition.Highlights]: {
    slot: ARBITRAGE_SLOT.railAfterHighlights,
    format: ArbitrageAdFormat.MediumRectangle,
    hideOnPhone: true,
    reach: '45%',
  },
  [PostWidgetPosition.SimilarPosts]: {
    slot: ARBITRAGE_SLOT.railBetweenFurtherReading,
    format: ArbitrageAdFormat.MediumRectangle,
    reach: '40%',
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
  const leaderboardReleased = useStickyRelease(TOP_LEADERBOARD_STICKY_MS);

  return (
    <PostContentContainerRaw className={className}>
      {/* PostContainer is overflow-hidden, which would make it the scroll
          container for the leaderboard's sticky position and stop it pinning.
          overflow-x: clip alongside overflow-y: visible clips the column the
          same way without creating a scroll container. */}
      <PostContainer
        className="relative !overflow-x-clip !overflow-y-visible"
        data-testid="postContainer"
      >
        <ArbitrageTopLeaderboard released={leaderboardReleased} />

        {/* The production post page's mobile header. It pins itself at the top
            of the viewport, which would collide with the leaderboard above it,
            so it stays static until the leaderboard's sticky window closes and
            then takes the top over — one pinned bar at a time. */}
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

            items-end so the unit's bottom edge meets the cover image's, the
            two reading as one band. The cover renders 410x201 in this column
            and the medium rectangle is the closest standard height to it —
            336x280 and either leaderboard all sit further away. */}
        <div className="mb-6 flex flex-col gap-6 laptop:flex-row laptop:items-end">
          <ArbitrageAdSlot
            slot={ARBITRAGE_SLOT.inlineMpu1}
            format={ArbitrageAdFormat.MediumRectangle}
            reach="75%"
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
              reach="30%"
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
            reach="20%"
          />
          <ArbitrageAdSlot
            slot={ARBITRAGE_SLOT.endOfArticleGridSecondary}
            format={ArbitrageAdFormat.Grid}
            reach="12%"
            hideOnPhone
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
          <ArbitrageAdSlot
            slot={ARBITRAGE_SLOT.railStickyHalfPage}
            format={ArbitrageAdFormat.HalfPage}
            reach="100%"
            // Same header offset the top leaderboard uses, plus a gap, rather
            // than a hardcoded 5rem: under the v2 sidebar there is no fixed
            // header to clear and the unit would pin 5rem into empty space.
            className="laptop:sticky laptop:top-[calc(var(--sticky-header-offset)+1rem)]"
          />
        }
        getRailAd={(position) => {
          const spec = RAIL_AD[position];

          return (
            <ArbitrageAdSlot
              slot={spec.slot}
              format={spec.format}
              reach={spec.reach}
              className={spec.className}
              hideOnPhone={spec.hideOnPhone}
            />
          );
        }}
      />
    </PostContentContainerRaw>
  );
}

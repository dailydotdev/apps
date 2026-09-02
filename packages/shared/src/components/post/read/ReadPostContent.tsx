import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
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
import { ReadAdFormat, ReadAdSlot } from './ReadAdSlot';
import { ReadTopLeaderboard } from './ReadTopLeaderboard';
import { PostAnsweredQuestions } from '../PostAnsweredQuestions';
import { splitContentForAds, splitTextForAds } from './splitContentForAds';
import {
  READ_SLOT,
  COMMENTS_PER_INTERLEAVED_AD,
  CONTENT_CHARS_PER_AD,
  MAX_CONTENT_ADS_PER_SECTION,
  TOP_LEADERBOARD_STICKY_MS,
} from './slots';
import { useTimedRelease } from './useTimedRelease';
import { GoBackHeaderMobile } from '../GoBackHeaderMobile';
import { PostWidgets, PostWidgetPosition } from '../PostWidgets';
import PostEngagements from '../PostEngagements';
import { anchorNofollowRel } from '../../../lib/strings';

/**
 * The rail carries two in-flow units between its widgets, and the closing
 * sticky half page arrives separately via PostWidgets' `trailing`. None of
 * them keep a phone placement: below laptop the rail stacks under the
 * article, and the phone's density budget is spent on the leaderboard, the
 * first in-content unit and the above-comments MPU (~17-22% of a scraped
 * page against the Better Ads 30% cap).
 */
// No DirectAd entry: following the direct-sold widget here would stack two
// ads back to back in a rail that already carries a unit per real widget.
const RAIL_AD: Partial<
  Record<
    PostWidgetPosition,
    {
      slot: number;
      format: ReadAdFormat;
      className?: string;
      hideOnPhone?: boolean;
    }
  >
> = {
  [PostWidgetPosition.Source]: {
    slot: READ_SLOT.railAfterSource,
    format: ReadAdFormat.MediumRectangle,
    hideOnPhone: true,
  },
  // In flow, not sticky: a sticky unit mid-rail slides over the widgets
  // below it, and the rail's one sticky lives at its very end (slot 19),
  // where nothing follows for it to cover.
  [PostWidgetPosition.SimilarPosts]: {
    slot: READ_SLOT.railBetweenFurtherReading,
    format: ReadAdFormat.MediumRectangle,
    hideOnPhone: true,
  },
};

export interface ReadPostContentProps {
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
export function ReadPostContent({
  post,
  className,
}: ReadPostContentProps): ReactElement {
  const isVideoType = isVideoPost(post);
  const { onReadArticle, onCopyPostLink } = usePostContent({
    origin: Origin.ArticlePage,
    post,
  });
  const leaderboardReleased = useTimedRelease(TOP_LEADERBOARD_STICKY_MS);
  // Memoised: the splits re-scan the whole text, and this component
  // re-renders on comment sorting, hover state and auth resolution. The TLDR
  // is main content here — for a scraped article it is the only content — so
  // it carries the same MPU cadence as a hosted body.
  const summaryParts = useMemo(
    () =>
      post.summary
        ? splitTextForAds(
            post.summary,
            CONTENT_CHARS_PER_AD,
            MAX_CONTENT_ADS_PER_SECTION + 1,
          )
        : [],
    [post.summary],
  );
  const bodyChunks = useMemo(
    () =>
      post.contentHtml
        ? splitContentForAds(
            post.contentHtml,
            CONTENT_CHARS_PER_AD,
            MAX_CONTENT_ADS_PER_SECTION + 1,
          )
        : [],
    [post.contentHtml],
  );

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
          <ReadTopLeaderboard released={leaderboardReleased} />

          <GoBackHeaderMobile
            className={classNames(
              '-mx-4 bg-background-subtle',
              !leaderboardReleased && '!static',
            )}
          >
            <PostHeaderActions
              post={post}
              className="ml-auto"
              contextMenuId="read-post-header-actions"
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
              rel={anchorNofollowRel}
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

        {summaryParts.map((part, index, parts) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>
            <div className="mb-6 overflow-hidden text-text-secondary">
              <p className="select-text break-words typo-markdown">{part}</p>
            </div>
            {index < parts.length - 1 && (
              // Phone density policy: only the page's first in-content unit
              // keeps a phone placement — the 250-char cadence would stack
              // the rest into a wall on a small screen.
              <ReadAdSlot
                slot={READ_SLOT.inBodyMpu}
                format={ReadAdFormat.MediumRectangle}
                className="my-6"
                hideOnPhone={index > 0}
                logExtra={{ section: 'summary', occurrence: index + 1 }}
              />
            )}
          </React.Fragment>
        ))}

        <div className="mb-6">
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
                      rel={anchorNofollowRel}
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
                rel={anchorNofollowRel}
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

        {/* One MPU per BODY_CHARS_PER_AD of visible text, only ever between
            top-level blocks — splitContentForAds cannot cut a paragraph, list
            or code block in half — and capped per section. Section and
            occurrence ride the events for per-position analytics. */}
        {bodyChunks.map((chunk, index, chunks) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={index}>
            <Markdown
              className="my-6"
              content={chunk}
              appendTooltipTo={() => globalThis?.document?.body}
            />
            {index < chunks.length - 1 && (
              <ReadAdSlot
                slot={READ_SLOT.inBodyMpu}
                format={ReadAdFormat.MediumRectangle}
                className="my-6"
                hideOnPhone={summaryParts.length > 1 || index > 0}
                logExtra={{ section: 'body', occurrence: index + 1 }}
              />
            )}
          </React.Fragment>
        ))}

        {/* Same block the post page shows: the questions that likely brought
            an anonymous visitor here (the component self-hides for logged-in
            users and question-less posts). */}
        <PostAnsweredQuestions post={post} />

        <ReadAdSlot
          slot={READ_SLOT.aboveCommentsMpu}
          format={ReadAdFormat.MediumRectangle}
          className="my-6"
        />

        {/* The production engagement block verbatim — counts, actions, share,
            sort control, composer and thread — so everything from here to the
            end of the discussion matches the live post page exactly. The only
            addition is an MPU as a long thread grows. */}
        <PostEngagements
          post={post}
          onCopyLinkClick={onCopyPostLink}
          logOrigin={Origin.ArticlePage}
          hideInternalAd
          interleaveEvery={COMMENTS_PER_INTERLEAVED_AD}
          renderInterleaved={(occurrence) => (
            // Phone-hidden until the density precondition in slots.ts is
            // satisfied: a repeating unit, and the phone figure was measured
            // without it.
            <ReadAdSlot
              slot={READ_SLOT.commentMpu}
              format={ReadAdFormat.MediumRectangle}
              hideOnPhone
              logExtra={{ occurrence }}
            />
          )}
        />
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
        hideAdWidget
        getRailAd={(position) => {
          const spec = RAIL_AD[position];

          if (!spec) {
            return null;
          }

          return (
            <ReadAdSlot
              slot={spec.slot}
              format={spec.format}
              className={spec.className}
              hideOnPhone={spec.hideOnPhone}
            />
          );
        }}
        // The page's only sticky unit, closing the rail: last in the column,
        // so pinning under the fixed chrome can never slide it over content —
        // the overlap the mid-rail sticky produced. Compliant as a publisher
        // sticky at exactly 300px wide, desktop only, one per viewport.
        trailing={
          <ReadAdSlot
            slot={READ_SLOT.railBottomSticky}
            format={ReadAdFormat.HalfPage}
            className="laptop:sticky laptop:top-[calc(var(--sticky-header-offset)+1rem)] laptop:z-1"
            hideOnPhone
          />
        }
      />
    </PostContentContainerRaw>
  );
}

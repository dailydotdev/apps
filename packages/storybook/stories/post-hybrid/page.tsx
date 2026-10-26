import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { splitTextForAds } from '@dailydotdev/shared/src/components/post/read/splitContentForAds';
import {
  COMMENTS_PER_INTERLEAVED_AD,
  CONTENT_CHARS_PER_AD,
  MAX_CONTENT_ADS_PER_SECTION,
} from '@dailydotdev/shared/src/components/post/read/slots';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { ColumnMode, FocusColumn } from './focusColumn';
import type { ActionBarStyle, ColumnAds } from './focusColumn';
import { AdSlot, ORGANIC_SLOT, ProgrammaticAdFormat } from './adSlot';
import { HybridRail } from './rail';
import { InlineAd } from './inlineAd';
import { Viewer } from './providers';

export interface OrganicAds {
  isLive: boolean;
  /** Live in production for this viewer and post, drawn or not. */
  isEligible: boolean;
  column?: ColumnAds;
  segments?: string[];
}

/**
 * Production's organic map, as useOrganicAdSlots gates it: programmatic
 * units for logged-out visitors, on articles and videos. `enabled` lets the
 * stories show the page with or without them.
 */
export const useOrganicAds = (
  post: Post,
  viewer: Viewer,
  enabled = true,
): OrganicAds =>
  useMemo(() => {
    const isEligible =
      viewer === Viewer.Anonymous &&
      (post.type === PostType.Article || post.type === PostType.VideoYouTube);
    const isLive = enabled && isEligible;
    if (!isLive) {
      return { isLive, isEligible };
    }

    return {
      isLive,
      isEligible,
      segments: post.summary
        ? splitTextForAds(
            post.summary,
            CONTENT_CHARS_PER_AD,
            MAX_CONTENT_ADS_PER_SECTION + 1,
          )
        : undefined,
      column: {
        leading: (
          <AdSlot
            slot={ORGANIC_SLOT.topLeaderboard}
            format={ProgrammaticAdFormat.Leaderboard}
            name="Top leaderboard, pinned for the first 10s"
            hideOnPhone
          />
        ),
        inSummary: (index) => (
          <AdSlot
            slot={ORGANIC_SLOT.inContentMpu}
            format={ProgrammaticAdFormat.MediumRectangle}
            name={`In the TLDR, #${index + 1}${
              index > 0 ? ' (hidden on phones)' : ''
            }`}
            hideOnPhone={index > 0}
            className="my-2"
          />
        ),
        aboveComments: (
          <AdSlot
            slot={ORGANIC_SLOT.aboveCommentsMpu}
            format={ProgrammaticAdFormat.MediumRectangle}
            name="Above the comments"
          />
        ),
        comments: {
          interleaveEvery: COMMENTS_PER_INTERLEAVED_AD,
          renderInterleaved: (occurrence) => (
            <AdSlot
              slot={ORGANIC_SLOT.commentMpu}
              format={ProgrammaticAdFormat.MediumRectangle}
              name={`In the thread, every ${COMMENTS_PER_INTERLEAVED_AD} comments (#${occurrence})`}
              hideOnPhone
            />
          ),
        },
      },
    };
  }, [post, viewer, enabled]);

export const railAdSlot = (
  <AdSlot
    slot={ORGANIC_SLOT.railAfterDirectAd}
    format={ProgrammaticAdFormat.MediumRectangle}
    name="Rail, after the direct-sold card"
  />
);

export const ShellSidebar = (): ReactElement => (
  <nav
    aria-hidden
    className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-border-subtlest-tertiary px-3 py-4 laptop:flex"
  >
    <div className="mb-4 h-8 w-28 rounded-10 bg-surface-float" />
    {['w-24', 'w-20', 'w-28', 'w-16', 'w-24', 'w-20'].map((width, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={index} className="flex h-10 items-center gap-3 px-2">
        <div className="size-5 rounded-6 bg-surface-float" />
        <div className={classNames('h-3 rounded-6 bg-surface-float', width)} />
      </div>
    ))}
    <span className="mt-auto px-2 text-text-quaternary typo-caption2">
      App sidebar (placeholder)
    </span>
  </nav>
);

export const Shell = ({
  shell,
  children,
}: {
  shell: boolean;
  children: ReactElement;
}): ReactElement =>
  shell ? (
    <div className="flex min-h-screen w-full bg-background-default text-text-primary">
      <ShellSidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  ) : (
    children
  );

const PhoneStrip = (): ReactElement => (
  <div className="sticky top-0 z-3 flex justify-center bg-background-default py-1 tablet:hidden">
    <div className="flex h-[3.125rem] w-80 items-center justify-center rounded-6 border border-border-subtlest-tertiary bg-background-subtle text-text-quaternary typo-caption2">
      {ORGANIC_SLOT.topLeaderboardPhone} · 320x50 phone strip, pinned
    </div>
  </div>
);

export interface PageProps {
  post: Post;
  viewer: Viewer;
  /** Production's logged-out programmatic units, drawn as slot boxes. */
  programmatic?: boolean;
  /** Adds the 300x600 sticky tower at the foot of the rail. */
  stickyRail?: boolean;
  /** Draws the app's sidebar so the breakpoints land as they do live. */
  shell?: boolean;
  actionBar?: ActionBarStyle;
}

/**
 * The hybrid: the redesign's reading column and discussion inside the
 * profile and Squad page frame, with production's right sidebar for the
 * post's type. From laptop the card and the 320px rail sit side by side in
 * a centered 1024px frame (1152px from laptopL); below laptop the rail
 * stacks under the discussion, where the classic page puts it.
 */
export const HybridPostPage = ({
  post,
  viewer,
  programmatic = false,
  stickyRail = false,
  shell = true,
  actionBar,
}: PageProps): ReactElement => {
  const ads = useOrganicAds(post, viewer, programmatic);

  return (
    <Shell shell={shell}>
      <ActivePostContextProvider post={post}>
        {ads.isLive && <PhoneStrip />}
        <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
          <main className="flex min-w-0 flex-1 flex-col border-border-subtlest-tertiary bg-background-default laptop:rounded-16 laptop:border">
            <FocusColumn
              post={post}
              ads={ads.column}
              summarySegments={ads.segments}
              hideCommentAd={ads.isEligible}
              actionBar={actionBar}
            />
          </main>
          <aside className="flex w-full flex-col gap-4 border-t border-border-subtlest-tertiary px-4 py-6 tablet:px-6 laptop:w-80 laptop:shrink-0 laptop:border-0 laptop:p-0">
            <HybridRail
              post={post}
              railAd={ads.isLive ? railAdSlot : undefined}
            />
            {stickyRail && viewer !== Viewer.Plus && (
              <div className="sticky top-4 hidden laptop:block">
                <AdSlot
                  slot="new"
                  format={ProgrammaticAdFormat.HalfPage}
                  name="Sticky tower, follows the reader down the thread"
                  proposed
                />
              </div>
            )}
          </aside>
        </div>
      </ActivePostContextProvider>
    </Shell>
  );
};

/**
 * The redesign as the experiment shipped it, for side-by-side review: one
 * 72rem-wide card, no sidebar, the direct-sold card flattened into the
 * column, and on laptops the rail MPU in its own 300px column (the "block"
 * placement; wider screens floated it beside the column instead).
 */
export const RedesignPostPage = ({
  post,
  viewer,
  programmatic = false,
  shell = true,
}: PageProps): ReactElement => {
  const ads = useOrganicAds(post, viewer, programmatic);

  return (
    <Shell shell={shell}>
      <ActivePostContextProvider post={post}>
        {ads.isLive && <PhoneStrip />}
        <div className="mx-auto w-full max-w-[72rem]">
          <article className="flex w-full flex-col rounded-24 bg-background-default">
            <div className="relative flex flex-col justify-center gap-8 laptop:flex-row">
              <div className="flex min-w-0 flex-1 flex-col laptop:max-w-[48rem]">
                <FocusColumn
                  post={post}
                  mode={ColumnMode.Redesign}
                  ads={ads.column}
                  summarySegments={ads.segments}
                  hideCommentAd={ads.isEligible}
                  inlineAd={
                    viewer !== Viewer.Plus && (
                      <InlineAd postId={post.id} source={post.source} />
                    )
                  }
                />
              </div>
              {ads.isLive && (
                <div className="w-full px-4 pt-2 laptop:w-[18.75rem] laptop:shrink-0 laptop:px-0 laptop:pt-6">
                  {railAdSlot}
                </div>
              )}
            </div>
          </article>
        </div>
      </ActivePostContextProvider>
    </Shell>
  );
};

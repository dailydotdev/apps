import type { ReactElement } from 'react';
import React from 'react';
import { CardList, Frame, Viewer } from './kit';
import {
  AboutBody,
  Ambient,
  Composer,
  IdentityRow,
  Kit2Styles,
  LeaderboardBody,
  LinksBody,
  PinnedBody,
  RolesBody,
  SortChips,
  StackBody,
  TeamFaces,
  Tile,
} from './kit2';
import { feedEntries, jobs, squad } from './data';

// V3 Focus. X. One column of posts with the identity as a sticky bar that
// stays while you scroll, a composer in the first seat, and a right column
// that is hairlines and text, not cards. The only colour on the page is the
// Join button and the ambient glow.

export const V3Focus = ({
  viewer = Viewer.Visitor,
}: {
  viewer?: Viewer;
}): ReactElement => (
  <Frame>
    <Kit2Styles />
    <Ambient intensity={0.2} />
    <div className="sq2-sticky-bar border-b border-border-subtlest-tertiary">
      <div className="mx-auto w-full max-w-[60rem] px-6 py-3">
        <IdentityRow viewer={viewer} size="sm" />
      </div>
    </div>
    <div className="relative">
      <div
        className="relative mx-auto grid w-full max-w-[60rem] gap-12 px-6 pb-10 pt-6"
        style={{ gridTemplateColumns: 'minmax(0, 1fr) 17rem' }}
      >
        <main className="flex min-w-0 flex-col gap-4">
          <p className="max-w-[56ch] text-text-secondary typo-callout">
            {squad.tagline}
          </p>
          {viewer === Viewer.Visitor ? (
            <div className="flex items-center justify-between rounded-16 border border-border-subtlest-tertiary px-4 py-3 text-text-tertiary typo-footnote">
              Join to post, vote and follow the team
              <span className="font-bold text-text-primary">
                {squad.totalPosts} posts
              </span>
            </div>
          ) : (
            <Composer />
          )}
          <SortChips className="-ml-3" />
          <CardList entries={feedEntries.slice(0, 6)} />
        </main>
        <aside className="sq-sticky flex flex-col self-start">
          <Tile flat title="About">
            <AboutBody />
            <LinksBody />
          </Tile>
          <Tile flat title="Pinned">
            <PinnedBody />
          </Tile>
          <Tile flat title="Top this week">
            <LeaderboardBody highlight />
          </Tile>
          <Tile flat title="Team">
            <TeamFaces />
          </Tile>
          <Tile flat title="Stack">
            <StackBody />
          </Tile>
          <Tile flat title="Open roles" meta={jobs.length}>
            <RolesBody />
          </Tile>
        </aside>
      </div>
    </div>
  </Frame>
);

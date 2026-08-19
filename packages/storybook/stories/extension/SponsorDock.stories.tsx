import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SponsorDock } from '@dailydotdev/shared/src/components/sponsors/SponsorDock';
import {
  VALUE_RAILS,
  LiveNowRail,
  StreakRail,
  TagMomentumRail,
} from '@dailydotdev/shared/src/components/sponsors/ValueRails';
import {
  MOCK_LEAD_SPONSOR,
  MOCK_PARTNER_SPONSORS,
} from '@dailydotdev/shared/src/components/sponsors/mockSponsors';
import ExtensionProviders from './_providers';
import { MockFeedGrid, MockFeedHeader } from './_mockPostFeed';

// =============================================================
// The dock — the sponsor row with a value rail stacked under it.
//
// Two problems, one shape. The browser's link-status bubble sits
// over the bottom corners and covers a flush bar most of the time
// on a feed full of links; and a permanent bar carrying only
// advertising is rent the reader never agreed to. Stacking a
// value rail underneath answers both: it takes the bubble instead
// of the paid row, and it gives the strip a reason to be there.
//
// Start with **Bubble Problem** for the argument, then **Rails**
// for the ten options, then **On The Feed** to see one in place.
// =============================================================

const strip = {
  primary: MOCK_LEAD_SPONSOR,
  partners: MOCK_PARTNER_SPONSORS,
};

const meta: Meta = {
  title: 'Extension/Sponsor Dock',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const Page = ({ children }: { children: React.ReactNode }): ReactElement => (
  <div className="min-h-dvh bg-background-default">{children}</div>
);

const Note = ({ children }: { children: React.ReactNode }): ReactElement => (
  <p className="mb-4 max-w-[60rem] text-text-tertiary typo-footnote">
    {children}
  </p>
);

// ---------------------------------------------------------------
// Why the dock exists
// ---------------------------------------------------------------
const BubbleGhost = ({ label }: { label: string }): ReactElement => (
  <span className="pointer-events-none absolute bottom-0 left-0 z-tooltip max-w-[70%] truncate rounded-t-4 bg-black px-2 py-0.5 font-mono text-white typo-caption2">
    {label}
  </span>
);

const LONG_URL =
  'https://app.daily.dev/posts/github-copilot-app-is-actually-good-just-not-with-copilot-nrl7lxzbn';

export const BubbleProblem: Story = {
  name: 'Bubble problem',
  render: () => (
    <ExtensionProviders>
      <Page>
        <div className="mx-auto flex max-w-[64rem] flex-col gap-8 p-6">
          <div>
            <h1 className="font-bold text-text-primary typo-title2">
              Why the dock has two rows
            </h1>
            <Note>
              Browsers draw a URL preview in the bottom corner whenever a link
              is hovered. It is browser chrome: it paints over the page, cannot
              be styled or detected, and moves to the opposite corner if the
              cursor comes near it — so there is no safe side, only a safe
              height. A feed is almost entirely links, so this is the normal
              state, not an edge case. The black box below is a stand-in for it
              at roughly its real size.
            </Note>
          </div>

          <figure>
            <figcaption className="mb-2 font-bold text-text-primary typo-callout">
              One row, flush — the paid slot is what gets covered
            </figcaption>
            <div className="relative overflow-hidden rounded-12 border border-border-subtlest-tertiary">
              <SponsorDock {...strip} className="!static" />
              <BubbleGhost label={LONG_URL} />
            </div>
          </figure>

          <figure>
            <figcaption className="mb-2 font-bold text-text-primary typo-callout">
              Two rows — the value rail takes it, the sponsor row is clear
            </figcaption>
            <div className="relative overflow-hidden rounded-12 border border-border-subtlest-tertiary">
              <SponsorDock {...strip} className="!static">
                <TagMomentumRail />
              </SponsorDock>
              <BubbleGhost label={LONG_URL} />
            </div>
            <Note>
              The rail opens with its label on the left, which is exactly where
              the bubble lands. What it covers is the word “Trending”, not the
              data — and the row underneath is ambient information that loses
              nothing by being briefly half-covered, unlike the row someone paid
              for.
            </Note>
          </figure>
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// The ten rails
// ---------------------------------------------------------------
export const Rails: Story = {
  render: () => (
    <ExtensionProviders>
      <Page>
        <div className="mx-auto flex max-w-[64rem] flex-col gap-6 p-6">
          <div>
            <h1 className="font-bold text-text-primary typo-title2">
              Ten value rails
            </h1>
            <Note>
              Each one is mocked, but none of them needs new plumbing: the data
              is already in the app — trendingTags, userStreak, the leaderboard
              queries, live rooms, opportunities, poll posts. They are ordered
              roughly from ambient to personal. The ambient ones are safer
              (nothing to be wrong about) and the personal ones are stickier
              (they change when the reader does).
            </Note>
          </div>
          {VALUE_RAILS.map(({ id, name, note, Rail }) => (
            <figure key={id}>
              <figcaption className="mb-2 flex items-baseline gap-2">
                <span className="font-bold text-text-primary typo-callout">
                  {name}
                </span>
                <span className="text-text-tertiary typo-caption1">{note}</span>
              </figcaption>
              <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
                <Rail />
              </div>
            </figure>
          ))}
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// Each rail, docked under the sponsor row
// ---------------------------------------------------------------
export const Docked: Story = {
  render: () => (
    <ExtensionProviders>
      <Page>
        <div className="mx-auto flex max-w-[64rem] flex-col gap-8 p-6">
          <Note>
            The same ten, each stacked under the sponsor row as it would ship.
            The dock is 72px total — a 40px sponsor row over a 32px rail.
          </Note>
          {VALUE_RAILS.map(({ id, name, Rail }) => (
            <figure key={id}>
              <figcaption className="mb-2 font-bold text-text-primary typo-callout">
                {name}
              </figcaption>
              <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
                <SponsorDock {...strip} className="!static">
                  <Rail />
                </SponsorDock>
              </div>
            </figure>
          ))}
        </div>
      </Page>
    </ExtensionProviders>
  ),
};

// ---------------------------------------------------------------
// In place on a feed
// ---------------------------------------------------------------
const OnFeed = ({ children }: { children: ReactElement }): ReactElement => (
  <ExtensionProviders>
    <Page>
      <div className="flex min-h-dvh flex-col">
        <div className="flex-1 p-6 pb-16">
          <MockFeedHeader />
          <MockFeedGrid />
        </div>
        <SponsorDock {...strip}>{children}</SponsorDock>
      </div>
    </Page>
  </ExtensionProviders>
);

export const OnTheFeed: Story = {
  name: 'On the feed · tag momentum',
  render: () => <OnFeed>{<TagMomentumRail />}</OnFeed>,
};

export const OnTheFeedStreak: Story = {
  name: 'On the feed · your streak',
  render: () => <OnFeed>{<StreakRail />}</OnFeed>,
};

export const OnTheFeedLive: Story = {
  name: 'On the feed · live now',
  render: () => <OnFeed>{<LiveNowRail />}</OnFeed>,
};

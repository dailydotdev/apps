import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BOTTOM_VARIANTS } from '@dailydotdev/shared/src/components/sponsors/BottomStripVariants';
import {
  MOCK_LEAD_SPONSOR,
  MOCK_PARTNER_SPONSORS,
} from '@dailydotdev/shared/src/components/sponsors/mockSponsors';
import ExtensionProviders from './_providers';
import { MockFeedGrid, MockFeedHeader } from './_mockPostFeed';

// =============================================================
// Ten ways to hold the strip at the bottom — no second row, no
// float, always on.
//
// A permanent bar has to justify being permanent every second it
// is on screen, and there are only a few honest ways to do that:
// yield while the reader is reading, look like part of the tool
// rather than part of the page, do an actual job, or ask for so
// little that nobody minds. Each variant below picks one.
//
// Most of these are behavioural — they answer to scroll or to
// stillness — so **Overview** is only an index. Open the
// individual stories and scroll to judge them.
// =============================================================

const strip = {
  primary: MOCK_LEAD_SPONSOR,
  partners: MOCK_PARTNER_SPONSORS,
};

const meta: Meta = {
  title: 'Extension/Bottom Strip Variants',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const Feed = ({ children }: { children: ReactElement }): ReactElement => (
  <ExtensionProviders>
    <div className="min-h-dvh bg-background-default">
      <div className="flex min-h-dvh flex-col">
        <div className="flex-1 p-6 pb-16">
          <MockFeedHeader />
          <MockFeedGrid />
        </div>
        {children}
      </div>
    </div>
  </ExtensionProviders>
);

// ---------------------------------------------------------------
// Overview
// ---------------------------------------------------------------
export const Overview: Story = {
  render: () => (
    <ExtensionProviders>
      <div className="min-h-dvh bg-background-default">
        <div className="mx-auto flex max-w-[60rem] flex-col gap-6 p-6">
          <div>
            <h1 className="font-bold text-text-primary typo-title2">
              Ten bottom strips
            </h1>
            <p className="mt-2 max-w-[46rem] text-text-tertiary typo-footnote">
              All of them are one row, always on, and flush to the bottom. What
              differs is how each one earns the right to stay there. Most are
              behavioural — they respond to scrolling or to stillness — so this
              page is an index, not a preview. Open a story and scroll it.
            </p>
          </div>
          {[
            'Get out of the way',
            'Become chrome',
            'Do a job',
            'Earn it by restraint',
          ].map((family) => (
            <section key={family}>
              <h2 className="mb-2 font-bold text-text-primary typo-callout">
                {family}
              </h2>
              <ul className="flex flex-col gap-1">
                {BOTTOM_VARIANTS.filter((v) => v.family === family).map((v) => (
                  <li className="text-text-secondary typo-footnote" key={v.id}>
                    <span className="text-text-primary">{v.name}</span>
                    <span className="text-text-tertiary"> — {v.note}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </ExtensionProviders>
  ),
};

const [
  retract,
  condense,
  hairline,
  status,
  shortcuts,
  progress,
  credits,
  colophon,
  idle,
  seam,
] = BOTTOM_VARIANTS;

export const RetractOnRead: Story = {
  name: `1 · ${retract.name}`,
  render: () => <Feed>{<retract.Strip {...strip} />}</Feed>,
};

export const CondenseOnRead: Story = {
  name: `2 · ${condense.name}`,
  render: () => <Feed>{<condense.Strip {...strip} />}</Feed>,
};

export const HairlinePeek: Story = {
  name: `3 · ${hairline.name}`,
  render: () => <Feed>{<hairline.Strip {...strip} />}</Feed>,
};

export const StatusBar: Story = {
  name: `4 · ${status.name}`,
  render: () => <Feed>{<status.Strip {...strip} />}</Feed>,
};

export const ShortcutBar: Story = {
  name: `5 · ${shortcuts.name}`,
  render: () => <Feed>{<shortcuts.Strip {...strip} />}</Feed>,
};

export const ProgressRail: Story = {
  name: `6 · ${progress.name}`,
  render: () => <Feed>{<progress.Strip {...strip} />}</Feed>,
};

export const BroadcastCredits: Story = {
  name: `7 · ${credits.name}`,
  render: () => <Feed>{<credits.Strip {...strip} />}</Feed>,
};

export const Colophon: Story = {
  name: `8 · ${colophon.name}`,
  render: () => <Feed>{<colophon.Strip {...strip} />}</Feed>,
};

export const IdleReveal: Story = {
  name: `9 · ${idle.name}`,
  render: () => <Feed>{<idle.Strip {...strip} />}</Feed>,
};

export const BrowserSeam: Story = {
  name: `10 · ${seam.name}`,
  render: () => <Feed>{<seam.Strip {...strip} />}</Feed>,
};

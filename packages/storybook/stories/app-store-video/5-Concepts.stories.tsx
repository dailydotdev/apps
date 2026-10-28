import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { cloudinaryPatchyWaiting } from '@dailydotdev/shared/src/lib/image';
import { Canvas, Case, Page, Table, Verdicts } from './parts';
import { Accent, Card, Headline, SearchFrame } from './frames';
import { realPosts } from '../hero-cover/realData';

const meta: Meta = {
  title: 'App Store Video/5. Concepts',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** Concept B: the headlines themselves, no interface, a ticker. */
const Ticker = (): ReactElement => (
  <div className="absolute inset-0 flex flex-col justify-center gap-5 px-16">
    {realPosts.slice(0, 3).map((post, index) => (
      <div
        key={post.id}
        className="flex items-center gap-4"
        style={{ opacity: index === 1 ? 1 : 0.45 }}
      >
        <img
          src={post.source?.image}
          alt=""
          className="size-12 shrink-0 rounded-max"
        />
        <span
          className="truncate font-bold text-text-primary"
          style={{ fontSize: index === 1 ? 40 : 30 }}
        >
          {post.title}
        </span>
      </div>
    ))}
    <p className="mt-2 text-text-tertiary" style={{ fontSize: 24 }}>
      What developers are reading today, with a TLDR on every post.
    </p>
  </div>
);

/** Concept C: the mascot and the stack, no feed. */
const Patchy = (): ReactElement => (
  <div className="absolute inset-0 flex items-center justify-center gap-12 px-16">
    <img src={cloudinaryPatchyWaiting} alt="" className="h-72 w-auto" />
    <div className="flex flex-col gap-4">
      <Headline size={54}>
        Your stack,
        <br />
        one <Accent>feed</Accent>
      </Headline>
      <div className="flex gap-2">
        {['react', 'python', 'docker', 'ai-agents', 'rust', 'devops'].map(
          (tag) => (
            <span
              key={tag}
              className="rounded-10 border border-border-subtlest-secondary bg-surface-float px-3 py-1 font-bold text-text-primary typo-callout"
            >
              #{tag}
            </span>
          ),
        )}
      </div>
    </div>
  </div>
);

export const Concepts: StoryObj = {
  name: '5. Concepts',
  render: () => (
    <Page
      chapter="5"
      question="Which of three directions should the video be?"
      title="Show the feed moving; keep the ticker as the challenger"
      goal="Pick one direction for all three slots so the storyboard, the motion design and the recording tell one story."
      metric="Taps on the search result (impressions to page views) per treatment."
    >
      <Case
        title="The three directions, each as its search asset at rest"
        note="The search asset is the hardest brief: a muted 3:2 thumbnail among other apps, purpose obvious at a glance. A direction that works there works everywhere."
      >
        <div className="flex flex-col gap-8">
          <Canvas
            placement="search"
            label="A · The feed, moving"
            note="production cards, real posts, TLDR opens; recommended"
          >
            <SearchFrame step={2} />
          </Canvas>
          <Canvas
            placement="search"
            label="B · Headlines ticker"
            note="the titles and sources, no interface; the challenger"
          >
            <Ticker />
          </Canvas>
          <Canvas
            placement="search"
            label="C · Patchy and the stack"
            note="mascot plus tags; rejected for this slot"
          >
            <Patchy />
          </Canvas>
        </div>
      </Case>
      <Case title="Scored">
        <Table
          head={[
            '',
            'A · The feed, moving',
            'B · Headlines ticker',
            'C · Patchy and the stack',
          ]}
          rows={[
            [
              'Purpose at a glance',
              'Yes: a feed of dev posts with a TLDR open',
              'Mostly: reads as news, could be a site',
              'No: a dog and tags do not say what the app does',
            ],
            [
              'Works muted and small',
              'Headline reads; cards read as a feed even when titles blur',
              'Best legibility of the three',
              'Reads, but says little',
            ],
            [
              'Loops seamlessly',
              'Feed advances one card and returns',
              'Ticker is a natural loop',
              'Needs an idle animation',
            ],
            [
              'Rules',
              'Public posts and source logos only; nothing to license',
              'Same',
              'Tool names as decoration invite a 2.3.14 "reference to other apps" reading',
            ],
            [
              'Reuses in the preview',
              'Yes: the preview is this footage, recorded',
              'No; the preview must show the app',
              'No',
            ],
            [
              'Consistent with the listing',
              'Matches the seven live screenshots (aurora, floating product UI)',
              'A new look next to the screenshots',
              'Matches Patchy in onboarding, not the store',
            ],
          ]}
        />
      </Case>
      <Case title="Decision">
        <Verdicts
          items={[
            {
              label: 'A ships first',
              text: 'The feed in motion is the one thing screenshots cannot show, and it is the product. Header and search are two crops of the same composition.',
              tone: 'good',
            },
            {
              label: 'B is the PPO treatment',
              text: 'Once A is live, the ticker is the second treatment of the search video test: same posts, no interface. It answers whether developers tap on headlines or on the app.',
              tone: 'warn',
            },
            {
              label: 'C stays in onboarding',
              text: 'Patchy belongs to the moments after install. In a search thumbnail he costs the one thing the slot needs: an obvious purpose.',
              tone: 'bad',
            },
          ]}
        />
      </Case>
    </Page>
  ),
};

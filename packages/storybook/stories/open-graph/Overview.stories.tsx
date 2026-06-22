import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecommendedOg } from './dailyOgImages';
import {
  Bullets,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
} from './ogStoryLayout';

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const TOC: Array<{ n: string; name: string; what: string }> = [
  {
    n: '1',
    name: 'Current Share Previews',
    what: 'Every share type as it unfurls today on 7 platforms, with a meta-tag inspector.',
  },
  {
    n: '2',
    name: 'Current vs Recommended',
    what: 'Side-by-side mock-ups and the fix for each surface.',
  },
  {
    n: '3',
    name: 'Guidelines & Research',
    what: 'Platform spec cheat-sheet, tags to emit, caching, priorities.',
  },
  {
    n: '4',
    name: 'X (Twitter) Deep Dive',
    what: 'How X actually renders links and how to win the surface where the image is everything.',
  },
  {
    n: '5',
    name: 'Recommended Template Spec',
    what: 'The real @vercel/og template, tokens, text rules and rollout.',
  },
  {
    n: '6',
    name: 'How the Best Platforms Share',
    what: 'What GitHub, X, Reddit & co. do — and which platforms drive the most shares.',
  },
  {
    n: '7',
    name: 'Link Copy, Metadata & Behavior',
    what: 'Everything outside the image: titles, descriptions, favicon, URLs, share text.',
  },
];

const Overview = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Open Graph · Initiative"
      title="Make every shared daily.dev link impossible to ignore"
    >
      When a developer shares a daily.dev link — an article, their profile, a
      squad, an invite — that preview is often the first time someone sees us.
      It’s free, high-intent distribution, and right now we’re leaving most of
      it on the table: titles get truncated by a “| daily.dev” suffix, several
      share types fall back to one generic image, and nothing feels distinctly
      ours. This initiative fixes the whole surface — the image, the copy, and
      the link behavior — across every place we’re shared.
    </PageHeader>

    <div
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        aspectRatio: '1200 / 630',
        maxWidth: 760,
        position: 'relative',
        marginBottom: 32,
      }}
    >
      <RecommendedOg
        kind="article"
        title="How we cut edge cold-starts by 90% with Rust and Wasm"
        name="The Pragmatic Engineer"
        meta="6 min read · 2.1k reads on daily.dev"
        cover="https://media.daily.dev/image/upload/s--P4t4XyoV--/f_auto/v1722860399/public/Placeholder%2001"
      />
    </div>

    <Heading>Why this matters now</Heading>
    <Bullets
      items={[
        'Shared links are the cheapest growth channel we have — every share is a free impression in front of exactly the right audience.',
        'Most real sharing happens in “dark social”: messengers (WhatsApp, Slack, Discord, iMessage) and communities (Reddit, Hacker News) — under-measured but huge. The preview has to look great there, not just on X.',
        'For developers specifically, the preview competes in fast feeds against GitHub, Stripe and Linear — all of whom generate sharp, branded, contextual cards. We currently don’t.',
        'A consistent, on-brand card makes a daily.dev link recognizable at a glance — which compounds every time someone shares.',
      ]}
    />

    <Divider />

    <Heading>What’s in this section</Heading>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {TOC.map((t) => (
        <div
          key={t.n}
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'baseline',
            padding: '12px 14px',
            borderRadius: 10,
            background: 'var(--theme-surface-float)',
            marginBottom: 8,
            fontFamily: SANS,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: 15,
              color: '#CE3DF3',
              minWidth: 18,
            }}
          >
            {t.n}
          </span>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--theme-text-primary)',
              }}
            >
              {t.name}
            </div>
            <div style={{ fontSize: 14, color: 'var(--theme-text-secondary)' }}>
              {t.what}
            </div>
          </div>
        </div>
      ))}
    </div>
    <Muted style={{ marginTop: 16 }}>
      Open the numbered pages under “Open Graph” in the sidebar in order. Start
      with Current vs Recommended (2) if you just want to see the before/after.
    </Muted>
  </Page>
);

const meta: Meta<typeof Overview> = {
  title: 'Open Graph/0. Overview',
  component: Overview,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Overview>;

export const Start: Story = { name: 'Start here' };

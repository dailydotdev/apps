import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bullets,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
  SpecTable,
} from './ogStoryLayout';

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const CardLabel = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <div
    style={{
      fontFamily: SANS,
      fontSize: 12,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: 'var(--theme-text-tertiary)',
      marginBottom: 10,
    }}
  >
    {children}
  </div>
);

/** How a YouTube link unfurls — the most-shared link type on the web. */
const YouTubeCard = (): React.ReactElement => (
  <div style={{ width: 360, maxWidth: '100%', fontFamily: SANS }}>
    <div
      style={{
        position: 'relative',
        aspectRatio: '16 / 9',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #3a1f2a, #14171c)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: 62,
            height: 44,
            borderRadius: 12,
            background: '#FF0033',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
          }}
        >
          ▶
        </span>
      </span>
      <span
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          background: 'rgba(0,0,0,0.8)',
          color: '#fff',
          fontSize: 12,
          padding: '1px 5px',
          borderRadius: 4,
        }}
      >
        12:04
      </span>
    </div>
    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#FF0033,#bb0026)',
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            color: 'var(--theme-text-primary)',
            fontWeight: 700,
            fontSize: 15,
            lineHeight: 1.3,
          }}
        >
          How we cut edge cold-starts by 90% with Rust and Wasm
        </div>
        <div
          style={{
            color: 'var(--theme-text-tertiary)',
            fontSize: 13,
            marginTop: 3,
          }}
        >
          The Pragmatic Engineer · 1.2M views
        </div>
      </div>
    </div>
  </div>
);

/** How a Reddit link post unfurls — the model that sits between GitHub and X. */
const RedditCard = (): React.ReactElement => (
  <div
    style={{
      width: 440,
      maxWidth: '100%',
      border: '1px solid var(--theme-divider-secondary)',
      borderRadius: 8,
      background: 'var(--theme-surface-float)',
      fontFamily: SANS,
      display: 'flex',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 8px',
        gap: 2,
      }}
    >
      <span style={{ color: '#FF4500', fontSize: 15 }}>▲</span>
      <span
        style={{
          fontWeight: 700,
          fontSize: 13,
          color: 'var(--theme-text-primary)',
        }}
      >
        2.4k
      </span>
      <span style={{ color: 'var(--theme-text-tertiary)', fontSize: 15 }}>
        ▼
      </span>
    </div>
    <div style={{ flex: 1, padding: '8px 12px', minWidth: 0 }}>
      <div style={{ color: 'var(--theme-text-tertiary)', fontSize: 12 }}>
        r/programming · Posted by u/idoshamun · 5h
      </div>
      <div
        style={{
          color: 'var(--theme-text-primary)',
          fontSize: 16,
          fontWeight: 600,
          margin: '4px 0',
          lineHeight: 1.3,
        }}
      >
        How we cut edge cold-starts by 90% with Rust and Wasm
      </div>
      <span
        style={{
          color: 'var(--theme-text-tertiary)',
          fontSize: 12,
          border: '1px solid var(--theme-divider-tertiary)',
          borderRadius: 4,
          padding: '2px 6px',
        }}
      >
        app.daily.dev
      </span>
      <div
        style={{
          color: 'var(--theme-text-tertiary)',
          fontSize: 12,
          marginTop: 8,
          display: 'flex',
          gap: 16,
        }}
      >
        <span>💬 340 comments</span>
        <span>↗ Share</span>
      </div>
    </div>
    <div
      style={{
        width: 86,
        alignSelf: 'stretch',
        background: 'linear-gradient(135deg,#CE3DF3,#9D70F8)',
        flexShrink: 0,
      }}
    />
  </div>
);

/** GitHub's auto-generated repo social card. */
const GitHubRepoCard = (): React.ReactElement => (
  <div
    style={{
      width: 440,
      maxWidth: '100%',
      aspectRatio: '2 / 1',
      background: '#0d1117',
      border: '1px solid #30363d',
      borderRadius: 12,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: SANS,
      color: '#e6edf3',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#6e7681',
        }}
      />
      <span style={{ color: '#7d8590', fontSize: 18 }}>
        vercel <span>/</span>{' '}
        <span style={{ color: '#e6edf3', fontWeight: 700 }}>satori</span>
      </span>
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>
      Enlightened library to convert HTML and CSS to SVG
    </div>
    <div
      style={{
        display: 'flex',
        gap: 22,
        color: '#7d8590',
        fontSize: 16,
        alignItems: 'center',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span
          style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            background: '#f1e05a',
          }}
        />
        TypeScript
      </span>
      <span>★ 11.8k</span>
      <span>⑂ 312</span>
    </div>
  </div>
);

const Benchmark = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Open Graph · Benchmark"
      title="Which links travel — and what the winners do"
    >
      The question that matters isn’t how much traffic a platform sends us —
      it’s <strong>whose links get shared everywhere else</strong>: pasted into
      WhatsApp, posted on X, dropped in a Slack channel. So we looked at the
      platforms whose links travel the most across the web and studied how they
      unfurl. The pattern is stark: the most-shared platforms have{' '}
      <strong>rich, open, contextual</strong> previews — and the ones that gate
      their metadata get shared less because their links look broken.
    </PageHeader>

    <Heading>Whose links get shared the most</Heading>
    <SpecTable
      columns={['Platform', 'Why its links travel', 'How it unfurls', 'Grade']}
      rows={[
        [
          'YouTube',
          'Most-visited site on earth; a video fits any chat or feed',
          'Rich card: big thumbnail + play shape + title + channel',
          '★ best-in-class',
        ],
        [
          'Reddit',
          '2025’s biggest riser; threads get cited everywhere',
          'Thumbnail + title + subreddit + upvotes/comments',
          '★ excellent',
        ],
        [
          'GitHub',
          'Devs share repos/PRs/issues constantly',
          'Generated card: owner + name + language + live stars/forks',
          '★ excellent',
        ],
        [
          'X / Twitter',
          'High-velocity resharing; quote-tweets',
          'Image-only large card (no body text) — image is everything',
          '◑ good, image-dependent',
        ],
        [
          'Wikipedia / news',
          'Cited as sources across the web',
          'Clean title + summary + lead image',
          '◑ good',
        ],
        [
          'Facebook',
          'Largest social graph',
          'Image + title + description bar',
          '◑ good',
        ],
        [
          'Instagram',
          '2B users, hugely shared… as raw links',
          'Gates OG behind a paid API → usually NO preview',
          '✗ broken externally',
        ],
        [
          'TikTok',
          'Massive volume; links pasted everywhere',
          'Restricted OG → text snippet, often no image',
          '✗ broken externally',
        ],
        [
          'WhatsApp / Slack / DMs',
          'The pipes that carry everyone else’s links',
          'Renders whatever OG the source provides',
          'n/a — carrier',
        ],
      ]}
    />
    <Bullets
      items={[
        'YouTube is effectively the most-shared link type on the web — its preview is the benchmark for "a link people want to tap".',
        'Messengers (WhatsApp/Slack/iMessage) are carriers, not sources — they just render the source’s OG. So our OG quality is what shows up in every DM.',
        'The clearest signal: Instagram & TikTok deliberately gate their Open Graph, so their links unfurl as broken text — and that visibly dampens how shareable they feel. Openness is a feature.',
      ]}
    />

    <Divider />

    <Heading>The three to model</Heading>
    <Muted>
      YouTube, Reddit and GitHub are where the most-shared, best-unfurling links
      live. Here’s how each looks and exactly what we should take.
    </Muted>

    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 40,
        alignItems: 'flex-start',
        margin: '12px 0 8px',
      }}
    >
      <div>
        <CardLabel>YouTube — the thumbnail IS the product</CardLabel>
        <YouTubeCard />
        <div style={{ maxWidth: 360, marginTop: 12 }}>
          <Bullets
            tone="good"
            items={[
              'Self-explanatory image — you know what you’ll get before reading.',
              'A recognizable shape (the red play button) = instant brand ID.',
              'Creator identity (channel + avatar) builds trust.',
            ]}
          />
        </div>
      </div>
      <div>
        <CardLabel>GitHub — contextual + live stats</CardLabel>
        <GitHubRepoCard />
        <div style={{ maxWidth: 440, marginTop: 12 }}>
          <Bullets
            tone="good"
            items={[
              'A fresh card per object (repo/PR/issue) — never a generic logo.',
              'Identity + live numbers (stars/forks) = instant credibility.',
              'One recognizable system across every page type.',
            ]}
          />
        </div>
      </div>
    </div>

    <Divider />

    <Heading badge="our north star">Reddit — between GitHub and X</Heading>
    <Muted>
      You called it: for developers Reddit sits right between GitHub’s
      credibility and X’s reach. It’s a social network <em>and</em> a dev
      watering hole, and its link cards are a masterclass in context — exactly
      the balance daily.dev wants.
    </Muted>
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 40,
        alignItems: 'flex-start',
        margin: '12px 0',
      }}
    >
      <div>
        <CardLabel>How a daily.dev link looks on Reddit</CardLabel>
        <RedditCard />
      </div>
      <div style={{ maxWidth: 420 }}>
        <Bullets
          tone="good"
          title="What to steal from Reddit"
          items={[
            'Community/topic context up front (r/programming) — we have Squads and tags; surface them.',
            'Engagement is the hook: upvotes + comment count. Our Feed-card direction already shows this.',
            'Literal, scannable titles win — no cleverness, no “| daily.dev” suffix.',
            'The domain badge (app.daily.dev) is a trust signal — keep it clean and consistent.',
            'Reddit fetches metadata via Embedly — so we must ship complete OG + oEmbed or the card degrades.',
          ]}
        />
      </div>
    </div>

    <Divider />

    <Heading>The anti-pattern: don’t be Instagram or TikTok</Heading>
    <Bullets
      tone="bad"
      items={[
        'Instagram gates Open Graph behind a paid API; most clients can’t unfurl it, so links show as plain text.',
        'TikTok restricts its OG too — links usually render a bare text snippet with no image.',
        'Result: despite huge volume, their individual links feel broken when shared — which suppresses re-sharing.',
      ]}
    />
    <Muted>
      The takeaway for us:{' '}
      <strong>openness + complete, valid tags is itself a growth lever.</strong>{' '}
      Every daily.dev link should unfurl richly for every scraper (Facebook, X,
      Slack, Discord, and Reddit’s Embedly) — never gated, never half-formed.
    </Muted>

    <Divider />

    <Heading>Enhanced principles (from the most-shared platforms)</Heading>
    <SpecTable
      columns={['Principle', 'Learned from', 'How we apply it']}
      rows={[
        [
          'Open & complete metadata',
          'Instagram/TikTok (anti)',
          'Always emit full, valid OG + Twitter + oEmbed; never gate. Validate per scraper.',
        ],
        [
          'The image is self-explanatory',
          'YouTube',
          'Headline + visual tell the whole story before any text is read.',
        ],
        [
          'A recognizable shape',
          'YouTube play button',
          'Persistent daily.dev mark + cabbage→onion gradient so the card is ID’d as a shape.',
        ],
        [
          'Context + engagement',
          'Reddit',
          'Show source/Squad/topic + reading time or upvotes/comments for social proof.',
        ],
        [
          'Contextual per object',
          'GitHub',
          'A distinct card per share type (article/profile/squad/invite/comment).',
        ],
        [
          'Literal, scannable titles',
          'Reddit',
          'Sentence-case, no suffix, ≤55–60 chars; say exactly what it is.',
        ],
        [
          'Image carries everything',
          'X',
          'On the large card no text shows — bake the message into the image.',
        ],
      ]}
    />

    <Divider />

    <Heading>Sources</Heading>
    <Bullets
      items={[
        'Most-visited websites / most-shared domains 2025 — proxidize.com/research/most-popular-websites & statvoo.com/blog/most-visited-websites-2025',
        'Reddit as 2025’s biggest riser; Americans’ social use — pewresearch.org/internet/2025/11/20/americans-social-media-use-2025',
        'How Reddit unfurls links via Embedly / Open Graph — opengraphplus.com/consumers/reddit & jameshfisher.com/2017/08/16/reddit-oembed-open-graph',
        'GitHub’s framework for building Open Graph images — github.blog/open-source/git/framework-building-open-graph-images',
        'Instagram/TikTok gate their Open Graph (broken previews) — share-preview.com/blog/instagram-link-preview & opengraph.io',
        'YouTube rich link previews / Open Graph for video — blog.logrocket.com/open-graph-sharable-social-media-previews',
      ]}
    />
  </Page>
);

const meta: Meta<typeof Benchmark> = {
  title: 'Open Graph/6. How the Best Platforms Share',
  component: Benchmark,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Benchmark>;

export const Benchmarks: Story = { name: 'Platform benchmark' };

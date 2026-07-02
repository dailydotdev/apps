import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bullets,
  CodeBlock,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
  SpecTable,
} from './ogStoryLayout';

const Guidelines = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Open Graph · Research"
      title="Link preview guidelines & recommendations"
    >
      A condensed field guide to how link previews actually work across
      platforms in 2026, the technical details that matter, and the concrete
      changes we should make to daily.dev’s sharing. Pair this with the “Current
      vs Recommended” page for the per-surface mock-ups.
    </PageHeader>

    <Heading>The one image spec that covers everything</Heading>
    <Muted>
      Ship a single <strong>1200 × 630 px (1.91:1)</strong> image. It satisfies
      Facebook, LinkedIn, X large cards, Slack, Discord, WhatsApp and iMessage
      without cropping the important bits. Keep the file under{' '}
      <strong>~500 KB</strong> (hard ceiling ~1 MB or some crawlers skip it),
      prefer PNG for text-heavy cards / JPEG for photographic ones, and keep all
      critical content inside a centered <strong>~80% safe area</strong> since
      some surfaces center-crop toward square.
    </Muted>

    <SpecTable
      columns={[
        'Platform',
        'Card / behavior',
        'Image',
        'Title shown',
        'Description shown',
      ]}
      rows={[
        [
          'X / Twitter',
          'summary_large_image — big image, domain pill, no body text on card',
          '1200×630 (≥1.91:1)',
          '~70 chars (in composer)',
          'Not shown on large card',
        ],
        [
          'LinkedIn',
          'Image on top, bold title, domain',
          '1200×627',
          '~60–100 chars',
          'Rarely shown',
        ],
        [
          'Facebook',
          'Image, then domain / title / description bar',
          '1200×630',
          '~88–130 chars',
          '~2 lines (~200)',
        ],
        [
          'Slack',
          'Color bar, site, title, full description, image',
          '1200×630',
          'Full (not cropped)',
          'Full; supports label/data pairs',
        ],
        [
          'Discord',
          'Dark embed, site, link title, description, image',
          '1200×630',
          '~2 lines',
          '~3 lines',
        ],
        [
          'WhatsApp / Telegram',
          'Compact bubble, thumbnail, title, host',
          'Square-safe',
          '~40–60 chars',
          '~1–2 lines',
        ],
        [
          'iMessage',
          'Large image bubble + title/host footer',
          '1200×630',
          '~2 lines',
          'Host only',
        ],
      ]}
    />

    <Muted>
      Practical takeaway: <strong>write for the strictest platform.</strong>{' '}
      Keep og:title ≤ ~60 chars and og:description ≤ ~110 chars so nothing
      important is clipped on LinkedIn/X while still reading well on
      Slack/Facebook where more is shown.
    </Muted>

    <Divider />

    <Heading>Tags we should always emit</Heading>
    <SpecTable
      columns={['Tag', 'Why it matters', 'daily.dev status']}
      rows={[
        [
          'og:title',
          'Primary headline on every platform',
          '⚠️ Has “| daily.dev” suffix that eats the headline',
        ],
        [
          'og:description',
          'Body copy on FB/Slack/Discord/WhatsApp',
          '⚠️ Often a stripped excerpt or the generic site description',
        ],
        [
          'og:image',
          'The single biggest driver of click-through',
          '✓ Set; ⚠️ generic fallback over-used',
        ],
        [
          'og:image:width / :height',
          'Lets crawlers render before fetching the image (no “first share looks broken”)',
          '⚠️ Only set on the share route',
        ],
        [
          'og:image:alt',
          'Accessibility + a few crawlers',
          '✗ Missing on most surfaces',
        ],
        [
          'og:type',
          'website vs article (article enables published_time, author, tags)',
          '✓ article on posts',
        ],
        ['og:url', 'Canonical for the unfurl; dedupes shares', '✓ Set'],
        [
          'og:site_name',
          'Renders the brand without spending title chars',
          '✓ daily.dev',
        ],
        ['og:locale', 'Correct language hint per post', '✓ locale on posts'],
        [
          'twitter:card',
          'summary_large_image for the big card',
          '✓ Set globally',
        ],
        [
          'twitter:site / :creator',
          'Attributes the account / the author',
          '⚠️ site only; no per-post creator',
        ],
        ['twitter:image:alt', 'Accessibility on X', '✗ Missing'],
        [
          'twitter:label1/data1 + label2/data2',
          'Two extra fact rows on Slack (e.g. Author, Reading time)',
          '✗ Unused — easy win for Slack-heavy dev audience',
        ],
        [
          'oEmbed <link rel="alternate">',
          'Lets Reddit (Embedly), Discord & others build richer cards',
          '✗ Likely missing — add for the Reddit/dev audience',
        ],
      ]}
    />

    <CodeBlock>{`<!-- Recommended baseline for a shared post -->
<meta property="og:title" content="How we cut edge cold-starts by 90% with Rust and Wasm" />
<meta property="og:description" content="A deep dive into taking P99 cold start from 800ms to 80ms." />
<meta property="og:image" content="https://og.daily.dev/api/posts/{id}?v={hash}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="How we cut edge cold-starts by 90% with Rust and Wasm" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="daily.dev" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@dailydotdev" />
<meta name="twitter:creator" content="@pragmaticeng" />
<meta name="twitter:image:alt" content="How we cut edge cold-starts by 90% with Rust and Wasm" />
<meta name="twitter:label1" content="Author" /><meta name="twitter:data1" content="The Pragmatic Engineer" />
<meta name="twitter:label2" content="Reading time" /><meta name="twitter:data2" content="6 min" />`}</CodeBlock>

    <Divider />

    <Heading>Design principles for the generated image</Heading>
    <Bullets
      tone="good"
      items={[
        'One recognizable template family across every share type — a daily.dev link should be identifiable at a glance in a noisy feed.',
        'The headline lives inside the image (large, ≤3 lines, high contrast) so X large cards — which show no body text — still communicate.',
        'Always show identity: author/source for articles, the sharer for shares, the inviter for invites. Social proof is what earns the click.',
        'A persistent but secondary daily.dev logo, top-right — present, never competing with the message.',
        'The recognizable daily.dev engagement bar (avocado upvote + comment) as the ownable signal on article/discussion shares.',
        'Generate text as real text (Satori/@vercel/og style), never bake copy into a static asset — it must stay legible at thumbnail size and localize.',
      ]}
    />

    <Divider />

    <Heading>Lessons from the most-shared platforms</Heading>
    <Muted>
      We studied the platforms whose links travel the most across the web (see
      the Benchmark page). The winners — YouTube, Reddit, GitHub — all share
      rich, open, contextual cards; the gated ones (Instagram, TikTok) get
      shared less because their links look broken. What that means for us:
    </Muted>
    <Bullets
      tone="good"
      items={[
        'Openness is a growth lever: emit complete, valid OG + Twitter tags (and oEmbed) for every scraper — including Reddit’s Embedly. Never gate or half-form them, or the card degrades the way Instagram/TikTok links do.',
        'Make the image self-explanatory (YouTube): the headline + visual should tell the whole story before any text renders.',
        'Own a recognizable shape (YouTube’s play button): the persistent daily.dev mark + cabbage→onion gradient should ID the card even at a glance.',
        'Lead with context + engagement (Reddit): source/Squad/topic + reading time or upvotes/comments — Reddit is our north star, sitting between GitHub’s credibility and X’s reach.',
        'One contextual card per object (GitHub): article, profile, squad, invite and comment each get their own treatment, never a generic logo.',
      ]}
    />

    <Divider />

    <Heading>Caching & invalidation</Heading>
    <Muted>
      Crawlers cache aggressively: Facebook and LinkedIn hold previews for{' '}
      <strong>up to ~7 days</strong>, and they fetch your tags exactly once per
      URL. Two consequences:
    </Muted>
    <Bullets
      items={[
        'Version the image URL with a content hash (…?v={hash}) so a redesign or edited title invalidates cleanly instead of serving stale art for a week.',
        'Set a long, immutable Cache-Control on the generated image (e.g. s-maxage + immutable) keyed by that hash — generate once, serve from CDN after.',
        'Keep og:url stable and canonical so the same post shared from different surfaces dedupes to one cached unfurl.',
        'Document the debuggers for support: LinkedIn Post Inspector, Facebook Sharing Debugger, and X’s card validator force a re-scrape.',
      ]}
    />

    <Divider />

    <Heading>Recommended rollout order</Heading>
    <SpecTable
      columns={['Priority', 'Change', 'Effort', 'Impact']}
      rows={[
        [
          'P0',
          'Stop appending “| daily.dev” to og:title on shareable content (posts, profiles, squads, sources)',
          'Low',
          'High',
        ],
        [
          'P0',
          'Replace generic-image fallbacks for invites, referrals, squads, sources, tags, Plus with generated contextual cards',
          'Med',
          'High',
        ],
        [
          'P1',
          'Unify all generated images into one template system (Layout A) — identity row + engagement bar',
          'Med/High',
          'High',
        ],
        [
          'P1',
          'Always emit og:image:width/height + og:image:alt + twitter:image:alt',
          'Low',
          'Med',
        ],
        [
          'P2',
          'Add twitter:label/data (Author, Reading time) for Slack',
          'Low',
          'Med',
        ],
        [
          'P2',
          'Add twitter:creator from the post author when known',
          'Low',
          'Low/Med',
        ],
        ['P2', 'Content-hash image URLs + immutable caching', 'Low', 'Med'],
      ]}
    />

    <Divider />

    <Heading>Sources</Heading>
    <Bullets
      items={[
        'Open Graph image sizes 2025 guide — krumzi.com/blog/open-graph-image-sizes-for-social-media-the-complete-2025-guide',
        'OG image dimensions & size guide — myogimage.com/blog/og-image-size-meta-tags-complete-guide',
        'Open Graph character limits per platform — lettercounter.org/blog/og-title-character-limit & ogtester.com',
        'OG meta tags best practices checklist — ogfixer.com/blog/open-graph-meta-tags-best-practices',
        'Clearing Facebook / X / LinkedIn caches — socialmediaexaminer.com & ogpreview.app/why-og-images-not-updating',
        'Vercel OG / Satori dynamic image generation — vercel.com/blog/introducing-vercel-og-image-generation & vercel.com/docs/og-image-generation',
        'twitter:label / twitter:data for Slack unfurls — dev.to/whitep4nth3r/level-up-your-link-previews-in-slack',
        'og:image:alt / twitter:image:alt accessibility — stefanjudis.com & zhead.dev/meta/twitter-image-alt',
      ]}
    />
  </Page>
);

const meta: Meta<typeof Guidelines> = {
  title: 'Open Graph/3. Guidelines & Research',
  component: Guidelines,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof Guidelines>;

export const Research: Story = { name: 'Guidelines & research' };

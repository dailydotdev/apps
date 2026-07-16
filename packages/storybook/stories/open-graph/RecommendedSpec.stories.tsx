import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecommendedOg } from './dailyOgImages';
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

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const Callout = ({
  n,
  top,
  left,
}: {
  n: number;
  top: string;
  left: string;
}): React.ReactElement => (
  <span
    style={{
      position: 'absolute',
      top,
      left,
      zIndex: 20,
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: '#CE3DF3',
      color: '#fff',
      fontSize: 15,
      fontWeight: 800,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 0 3px #fff, 0 2px 8px rgba(0,0,0,0.5)',
      fontFamily: SANS,
    }}
  >
    {n}
  </span>
);

const Anatomy = (): React.ReactElement => (
  <div style={{ position: 'relative', width: 600, maxWidth: '100%' }}>
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1200 / 630',
        borderRadius: 12,
        overflow: 'hidden',
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
    <Callout n={1} top="9%" left="6%" />
    <Callout n={2} top="9%" left="82%" />
    <Callout n={3} top="33%" left="7%" />
    <Callout n={4} top="80%" left="7%" />
    <Callout n={5} top="55%" left="70%" />
  </div>
);

const TEMPLATE_CODE = `// share-card.tsx — Satori (@vercel/og) template. Flexbox + inline styles only.
// One component, driven by \`kind\`. No grid, no external CSS.

type Kind =
  | 'article' | 'shared' | 'profile' | 'squad'
  | 'invite' | 'tag' | 'comment' | 'source' | 'generic';

interface ShareCardProps {
  kind: Kind;
  title: string;          // already truncated to <= 3 lines server-side
  subtitle?: string;      // 0–2 lines
  identity?: { name: string; handle?: string; avatar?: string }; // top-left
  upvotes?: string;       // article / shared / comment -> engagement bar
  comments?: string;
  meta?: string;          // other kinds -> glass meta pill ("4,210 members")
  cover?: string;         // absolute https URL; drives backdrop + art thumbnail
}

export function ShareCard(p: ShareCardProps) {
  const engage = ['article', 'shared', 'comment'].includes(p.kind);
  return (
    <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%', background: '#0B0E13' }}>
      {/* Ambient backdrop — a pre-blurred cover (Satori can't blur at runtime),
          else a brand-gradient glow. A dark gradient on top keeps text legible. */}
      {p.cover
        ? <img src={p.cover} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 90% at 100% 0, rgba(206,61,243,0.2), transparent)' }} />}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,9,13,0.5), rgba(7,9,13,0.78))' }} />

      {/* Top bar: identity (left) + the real daily.dev logo (right) */}
      <div style={{ position: 'absolute', top: 66, left: 66, right: 66, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Identity {...p.identity} kind={p.kind} />
        <Logo />
      </div>

      {/* Left content: headline + subtitle on top, the glass bar pinned to the bottom */}
      <div style={{ position: 'absolute', left: 66, top: 186, bottom: 66, right: p.cover ? '40%' : '12%',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', color: '#fff', fontSize: 62, fontWeight: 800, lineHeight: 1.07, ...clamp(3) }}>{p.title}</div>
          {p.subtitle && <div style={{ display: 'flex', color: '#A6AEBF', fontSize: 34, ...clamp(2) }}>{p.subtitle}</div>}
        </div>
        {/* Glass bar — pre-composited translucent fill (no runtime backdrop-blur in Satori) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, padding: '24px 36px', borderRadius: 28,
                      background: 'rgba(255,255,255,0.10)', border: '2px solid rgba(255,255,255,0.22)' }}>
          {engage
            ? <><Stat icon="upvote" color="#1DDC6F" value={p.upvotes ?? '0'} /><Stat icon="comment" color="#2CDCE6" value={p.comments ?? '0'} /></>
            : <span style={{ display: 'flex', color: '#D7DCE6', fontSize: 30, fontWeight: 600 }}>{p.meta}</span>}
        </div>
      </div>

      {/* Art bottom-right: cover thumbnail, avatar, or brand tile (radius 54) */}
      <div style={{ position: 'absolute', right: 66, bottom: 66, width: 384, height: 384, display: 'flex' }}>
        <Art {...p} />
      </div>
    </div>
  );
}

// Satori clamps text with the webkit box trio:
const clamp = (lines: number) =>
  ({ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lines, overflow: 'hidden' });`;

const ROUTE_CODE = `// /api/share route — edge runtime. Generates 1200×630 once, then CDN-cached.
import { ImageResponse } from '@vercel/og'; // or 'next/og'

export const runtime = 'edge';

const FONT = (w: string) =>
  fetch(\`https://og.daily.dev/fonts/Inter-\${w}.ttf\`).then((r) => r.arrayBuffer());

export async function GET(req: Request) {
  const u = new URL(req.url);
  const kind = (u.searchParams.get('kind') ?? 'generic') as Kind;
  const props = await resolveProps(kind, u.searchParams); // fetch post/squad/user, truncate title

  const [regular, bold, extrabold] = await Promise.all([FONT('Regular'), FONT('Bold'), FONT('ExtraBold')]);

  return new ImageResponse(<ShareCard {...props} kind={kind} />, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: regular,  weight: 400, style: 'normal' },
      { name: 'Inter', data: bold,     weight: 700, style: 'normal' },
      { name: 'Inter', data: extrabold, weight: 800, style: 'normal' },
    ],
    headers: {
      // version the URL with ?v={contentHash}; then this immutable cache is safe.
      'cache-control': 'public, immutable, no-transform, max-age=31536000',
    },
  });
}`;

const META_CODE = `// Webapp side — point og:image at the versioned generator and keep tags lean.
const v = post.contentHash; // bust X/LinkedIn/FB caches on edit or redesign
const img = \`https://og.daily.dev/api/share?kind=article&id=\${post.id}&v=\${v}\`;

const seo: NextSeoProps = {
  title: post.title,                                  // NO "| daily.dev" suffix
  description: clamp(post.summary, 110),
  openGraph: {
    type: 'article',
    title: post.title,
    description: clamp(post.summary, 110),
    siteName: 'daily.dev',
    images: [{ url: img, width: 1200, height: 630, alt: post.title }],
  },
  twitter: { cardType: 'summary_large_image', site: '@dailydotdev' },
  additionalMetaTags: [
    { name: 'twitter:image:alt', content: post.title },
    ...(post.author?.twitter ? [{ name: 'twitter:creator', content: post.author.twitter }] : []),
    { name: 'twitter:label1', content: 'Author' }, { name: 'twitter:data1', content: post.source.name },
    { name: 'twitter:label2', content: 'Reading time' }, { name: 'twitter:data2', content: \`\${post.readTime} min\` },
  ],
};`;

const RecommendedSpec = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Open Graph · Implementation spec"
      title="The daily.dev share-card system"
    >
      A single, contextual template that renders every share type — driven by a{' '}
      <code>kind</code> parameter — plus the text/naming rules and the actual{' '}
      <code>@vercel/og</code> (Satori) implementation it should ship as on{' '}
      <code>og.daily.dev</code>. The goal: a daily.dev link is recognizable at a
      glance on any platform, and reads perfectly even on X where the image is
      the entire message.
    </PageHeader>

    <Heading>Anatomy of the card</Heading>
    <div
      style={{
        display: 'flex',
        gap: 40,
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <Anatomy />
      <ol
        style={{
          fontFamily: SANS,
          fontSize: 15,
          lineHeight: 1.6,
          color: 'var(--theme-text-secondary)',
          maxWidth: 380,
          paddingLeft: 20,
        }}
      >
        <li>
          <strong>Identity</strong> — source / author / sharer top-left, where
          the context lives (a small avatar + name).
        </li>
        <li>
          <strong>daily.dev logo</strong> — top-right, the real wordmark;
          present but secondary, never competes with the message.
        </li>
        <li>
          <strong>Headline</strong> — the hero. ≤ 3 lines, the only thing X
          shows; sits over an ambient backdrop derived from the cover.
        </li>
        <li>
          <strong>Engagement bar</strong> — avocado upvote + comment in a
          glass/blur pill; the ownable daily.dev signal.
        </li>
        <li>
          <strong>Cover art</strong> — rounded thumbnail bottom-right (becomes
          an avatar/tile for profiles, squads, tags…).
        </li>
      </ol>
    </div>

    <Divider />

    <Heading>Design tokens</Heading>
    <SpecTable
      columns={['Token', 'Value', 'Use']}
      rows={[
        [
          'Canvas',
          '1200 × 630, #0E1217 (pepper)',
          'Dark base; reads on light & dark feeds',
        ],
        [
          'Brand gradient',
          '#CE3DF3 → #9D70F8 (cabbage→onion)',
          'Avatars, tiles (squad/tag/invite), accents',
        ],
        [
          'Ambient backdrop',
          'cover blurred ~13cqw + dark gradient',
          'Color/vibe from the image; keeps text legible',
        ],
        [
          'Headline',
          'Inter ExtraBold 64px / 1.1, #FFFFFF',
          'Down to 48px only if 3 lines overflow',
        ],
        ['Subtitle', 'Inter Regular 32px, #A8B3CF', '0–2 lines'],
        [
          'Identity',
          'Inter Medium 28px #D7DCE6 + #A6AEBF',
          'Source / author / sharer, top-left',
        ],
        [
          'Engagement bar',
          'Glass: white 10% + blur 8px; avocado #1DDC6F upvote',
          'Upvote + comment; the recognizable signal',
        ],
        [
          'Padding',
          '66px (5.5cqw) content inset',
          'Keeps all text in the ~80% safe area',
        ],
        [
          'Cover art',
          '384 × 384, radius 54',
          'Rounded thumbnail, bottom-right',
        ],
      ]}
    />

    <Divider />

    <Heading>The text system — titles, descriptions, names</Heading>
    <Muted>
      The copy matters as much as the picture. Three global rules, then a
      pattern per surface.
    </Muted>
    <Bullets
      tone="good"
      items={[
        'Title: sentence case, NO "| daily.dev" suffix on shareable content (site_name carries the brand). Target ≤ 55 chars (doubles as twitter:title); hard-clamp the in-image headline to 3 lines, truncating at a word boundary with an ellipsis.',
        'Description: ≤ 110 chars, value-framed, HTML stripped. When the source field is empty, generate a contextual one-liner instead of falling back to the generic site description.',
        'Alt text: og:image:alt and twitter:image:alt always mirror the headline.',
      ]}
    />
    <SpecTable
      columns={[
        'kind',
        'Eyebrow (top-left)',
        'og:title pattern',
        'Bottom-left',
        'Art (bottom-right)',
      ]}
      rows={[
        [
          'article',
          '{source} · {readTime}',
          '{post.title}',
          'Upvote + comment bar',
          'Cover thumbnail',
        ],
        [
          'shared',
          '{sharer} shared this',
          '{post.title}',
          'Upvote + comment bar',
          'Cover thumbnail',
        ],
        [
          'profile',
          '@{handle}',
          '{name} (@{handle})',
          '{posts} read · {streak} streak',
          'Avatar',
        ],
        [
          'squad',
          'Squad',
          '{squad} — a Squad on daily.dev',
          '{members} members · {newPosts} this week',
          'Squad tile',
        ],
        [
          'invite',
          '{inviter} invited you',
          '{inviter} invited you to {target}',
          'Join {members} — it’s free',
          'daily.dev tile',
        ],
        [
          'source',
          'daily.dev',
          '{source} on daily.dev',
          'Followed by {n} developers',
          'Source tile',
        ],
        [
          'tag',
          'Topic',
          '#{tag} on daily.dev',
          '{n} developers follow this',
          '# tile',
        ],
        [
          'comment',
          '{name} · commented',
          '“{excerpt}” — {name} on daily.dev',
          'Upvote + comment bar',
          'Quote tile',
        ],
      ]}
    />

    <Divider />

    <Heading>1 · The Satori template</Heading>
    <Muted>
      One component, switched on <code>kind</code>. Satori supports flexbox,
      inline styles, gradients, borders and the webkit line-clamp trio — no CSS
      grid, no stylesheets. Fonts must be supplied explicitly (TTF/OTF/WOFF; not
      WOFF2).
    </Muted>
    <CodeBlock>{TEMPLATE_CODE}</CodeBlock>

    <Heading>2 · The edge route</Heading>
    <Muted>
      Generate once at the edge, then serve immutable from the CDN. The{' '}
      <code>?v=</code> content hash is what lets us safely use a one-year
      immutable cache while still busting stale previews on edit.
    </Muted>
    <CodeBlock>{ROUTE_CODE}</CodeBlock>

    <Heading>3 · Meta tags on the webapp</Heading>
    <Muted>
      Point <code>og:image</code> at the versioned generator and keep the tags
      lean. Note: no title suffix, explicit width/height, alt text, and the
      Slack-only label/data pairs.
    </Muted>
    <CodeBlock>{META_CODE}</CodeBlock>

    <Divider />

    <Heading>Rollout against the existing code</Heading>
    <SpecTable
      columns={['Step', 'Where', 'Change']}
      rows={[
        [
          '1',
          'og.daily.dev service',
          'Add /api/share?kind=… Satori route with the ShareCard template + Inter fonts',
        ],
        [
          '2',
          'webapp/components/layouts/utils.ts',
          'Stop appending "| daily.dev" for shareable content (keep for nav pages)',
        ],
        [
          '3',
          'webapp/next-seo.ts + per-page SEO',
          'Route every share surface to /api/share with its kind; emit width/height + alt',
        ],
        [
          '4',
          'shared/src/lib/share.ts',
          'Append &v={contentHash} to shared links so caches refresh on edit',
        ],
        [
          '5',
          'webapp post/profile SEO',
          'Add twitter:creator + twitter:label/data (Author, Reading time)',
        ],
      ]}
    />

    <Divider />

    <Heading>Sources</Heading>
    <Bullets
      items={[
        'Satori README (supported CSS, fonts, clamping) — github.com/vercel/satori',
        '@vercel/og reference & caching headers — vercel.com/docs/og-image-generation',
        'Satori OG image guide — ogfixer.com/blog/satori-og-image-guide',
        'OG image design for legible thumbnails — ghostlyinc.com/en-us/open-graph-images-complete-guide & screenshotengine.com/blog/open-graph-image-examples',
      ]}
    />
  </Page>
);

const meta: Meta<typeof RecommendedSpec> = {
  title: 'Open Graph/5. Recommended Template Spec',
  component: RecommendedSpec,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof RecommendedSpec>;

export const Spec: Story = { name: 'Template spec & code' };

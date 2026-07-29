import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { XCard } from './platformCards';
import type { OgData } from './platformCards';
import { RecommendedOg } from './dailyOgImages';
import { USE_CASES } from './useCases';
import {
  Bullets,
  Divider,
  Heading,
  Muted,
  Page,
  PageHeader,
  SpecTable,
  TwoCol,
} from './ogStoryLayout';

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const article = USE_CASES.find((u) => u.id === 'article');

const labelStyle: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  color: '#71717a',
  marginBottom: 8,
};

/** Realistic X timeline chrome wrapped around a link card. */
const Tweet = ({
  data,
  tweetText,
}: {
  data: OgData;
  tweetText: string;
}): React.ReactElement => (
  <div
    style={{
      maxWidth: 560,
      border: '1px solid #cfd9de',
      borderRadius: 16,
      padding: 16,
      background: '#fff',
      fontFamily: SANS,
    }}
  >
    <div style={{ display: 'flex', gap: 12 }}>
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #CE3DF3, #9D70F8)',
          flexShrink: 0,
        }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#0f1419', fontWeight: 700, fontSize: 15 }}>
            Ido Shamun
          </span>
          <span style={{ color: '#536471', fontSize: 15 }}>
            @idoshamun · 2h
          </span>
        </div>
        <div
          style={{
            color: '#0f1419',
            fontSize: 15,
            lineHeight: 1.4,
            margin: '2px 0 12px',
          }}
        >
          {tweetText}
        </div>
        <XCard data={data} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            maxWidth: 360,
            marginTop: 12,
            color: '#536471',
            fontSize: 13,
          }}
        >
          <span>💬 24</span>
          <span>🔁 108</span>
          <span>♥ 642</span>
          <span>📊 23K</span>
        </div>
      </div>
    </div>
  </div>
);

/** Overlay the 80% safe area + rounded-corner danger zones on an image. */
const SafeAreaFrame = ({
  children,
}: {
  children: ReactNode;
}): React.ReactElement => (
  <div
    style={{
      position: 'relative',
      width: 480,
      maxWidth: '100%',
      aspectRatio: '1200 / 630',
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: SANS,
    }}
  >
    <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    {/* 80% safe area */}
    <div
      style={{
        position: 'absolute',
        inset: '10%',
        border: '2px dashed rgba(255,255,255,0.85)',
        borderRadius: 8,
        pointerEvents: 'none',
      }}
    />
    <span
      style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        fontSize: 11,
        padding: '2px 6px',
        borderRadius: 4,
      }}
    >
      80% safe area
    </span>
    {/* corner danger markers */}
    {['0 0 auto auto', '0 auto auto 0', 'auto 0 0 auto', 'auto auto 0 0'].map(
      (inset) => (
        <span
          key={inset}
          style={{
            position: 'absolute',
            inset,
            width: 26,
            height: 26,
            border: '2px solid #ffd23f',
            borderRadius: '0 0 0 0',
            opacity: 0.9,
            pointerEvents: 'none',
          }}
        />
      ),
    )}
  </div>
);

const XDeepDive = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Open Graph · Platform deep dive"
      title="Optimizing for X (Twitter)"
    >
      X is the highest-leverage surface for developer sharing — and the most
      unforgiving. On a modern <code>summary_large_image</code> card, X shows{' '}
      <strong>only the image and a small domain pill</strong>: no title, no
      description, no body text outside the picture. Whatever you want a reader
      to know has to live inside the 1200×630 frame. This page covers exactly
      how X behaves and how our generated image should be built for it.
    </PageHeader>

    <Heading>Why X is where the image has to do all the work</Heading>
    <Bullets
      items={[
        'On the large card, X renders the image edge-to-edge and drops og:title/og:description from the card entirely — the headline only survives if it is inside the image.',
        'Cards with a large image get materially more engagement than text-only links (commonly cited as 2–5× more clicks/retweets), so the image quality is the click.',
        'X rounds the card corners natively and overlays a domain pill bottom-left — anything in the corners gets clipped or covered.',
        'X falls back to Open Graph when twitter:* tags are missing, so the only strictly required X tag is twitter:card — but twitter:creator and twitter:image:alt add real value.',
        'X aggressively caches the first scrape; an edited title or redesigned image needs a versioned image URL to refresh.',
      ]}
    />

    <Divider />

    <Heading>The same link, in an X timeline</Heading>
    <Muted>
      Today the card leads with the publisher’s cover and a small daily.dev mark
      — the headline is barely legible and the brand is easy to miss. The
      recommended card bakes the headline, author and brand into the image, so
      it reads at a glance even at timeline scale.
    </Muted>
    {article && (
      <div style={{ margin: '20px 0 28px' }}>
        <TwoCol
          leftLabel="Current on X"
          rightLabel="Recommended on X"
          left={
            <Tweet
              data={article.current}
              tweetText="Great breakdown of edge cold-starts 👇"
            />
          }
          right={
            <Tweet
              data={article.recommended}
              tweetText="Great breakdown of edge cold-starts 👇"
            />
          }
        />
      </div>
    )}

    <Divider />

    <Heading>Design for the X thumbnail, not the full-size image</Heading>
    <Muted>
      Keep everything that matters inside the centered{' '}
      <strong>80% safe area</strong>, and out of the four corners (rounded +
      domain pill). Headline ≥ 48px at 1200px width, bold, with a hard contrast
      floor so it survives next to vibrant posts in the feed.
    </Muted>
    <div
      style={{
        display: 'flex',
        gap: 40,
        flexWrap: 'wrap',
        alignItems: 'center',
        margin: '8px 0 16px',
      }}
    >
      <SafeAreaFrame>
        <RecommendedOg
          kind="article"
          title="How we cut edge cold-starts by 90% with Rust and Wasm"
          name="The Pragmatic Engineer"
          meta="6 min read · 2.1k reads on daily.dev"
        />
      </SafeAreaFrame>
      <div style={{ maxWidth: 360 }}>
        <Bullets
          tone="good"
          title="Thumbnail rules"
          items={[
            'Dashed box = keep all text/logos inside it.',
            'Yellow corners = X clips/covers these — never put content there.',
            'Headline up to 3 lines, ≥ 48px-equivalent, weight 700–800.',
            'Domain pill sits bottom-left — leave that corner clear.',
          ]}
        />
      </div>
    </div>

    <Divider />

    <Heading>X-specific tag & image spec</Heading>
    <SpecTable
      columns={['Item', 'Spec', 'Notes']}
      rows={[
        [
          'twitter:card',
          'summary_large_image',
          'Only strictly required X tag; everything else falls back to og:*',
        ],
        [
          'Image size',
          '1200×630 (1.91:1)',
          'X also accepts 2:1; 1.91:1 is the safe cross-platform choice',
        ],
        [
          'Image format / weight',
          'PNG or WebP, < 5 MB',
          'PNG for crisp text; absolute HTTPS URL required',
        ],
        [
          'twitter:title',
          '≤ 55 chars',
          'Shown in composer/notifications, not on the large card — keep it tight',
        ],
        [
          'twitter:description',
          '≤ 125 chars',
          'Not shown on large card; still set for fallbacks',
        ],
        [
          'twitter:image:alt',
          '≤ 420 chars',
          'Accessibility; mirror the headline',
        ],
        ['twitter:site', '@dailydotdev', 'Attributes the brand account'],
        [
          'twitter:creator',
          '@author (when known)',
          'Attributes the post’s author — currently unused',
        ],
      ]}
    />

    <Divider />

    <Heading>Large vs summary card</Heading>
    <Muted>
      We should always request <code>summary_large_image</code>. The small{' '}
      <code>summary</code> card (square thumbnail + text) is the weak fallback —
      shown here only so the difference is obvious. With the small card the
      image shrinks to a tile and the text X shows is our og:title/description,
      so those still need to read well.
    </Muted>
    {article && (
      <div
        style={{
          display: 'flex',
          gap: 40,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div style={labelStyle}>summary_large_image (use this)</div>
          <XCard data={article.recommended} />
        </div>
        <div>
          <div style={labelStyle}>summary (avoid)</div>
          <XCard data={{ ...article.recommended, cardType: 'summary' }} />
        </div>
      </div>
    )}

    <Divider />

    <Heading>X recommendations</Heading>
    <Bullets
      tone="good"
      items={[
        'Treat the generated image as the entire message: headline + author/sharer + persistent daily.dev mark, all inside the safe area.',
        'Keep og:title ≤ 55 chars (it doubles as twitter:title) and drop the "| daily.dev" suffix.',
        'Emit twitter:creator from the post author’s X handle when we have it.',
        'Add twitter:image:alt mirroring the headline on every card.',
        'Version the image URL (…?v={hash}) so edits/redesigns bust X’s sticky cache.',
        'Validate with an X card preview tool before high-visibility launches.',
      ]}
    />

    <Divider />

    <Heading>Sources</Heading>
    <Bullets
      items={[
        'Twitter Card image guide & specs — ogmagic.dev/blog/twitter-card-image-guide',
        'Twitter/X card OG specifications — og-image.org/docs/platforms/twitter',
        'Twitter Card requirements & best practices — ogpreview.io/guide/twitter',
        'X card markup & fallbacks — developer.x.com/en/docs/x-for-websites/cards/overview/markup',
        'X (Twitter) image sizes 2025/26 — quirktools.com/blog/twitter-image-size & influencermarketinghub.com/twitter-image-size',
      ]}
    />
  </Page>
);

const meta: Meta<typeof XDeepDive> = {
  title: 'Open Graph/4. X (Twitter) Deep Dive',
  component: XDeepDive,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof XDeepDive>;

export const Optimizing: Story = { name: 'Optimizing for X' };

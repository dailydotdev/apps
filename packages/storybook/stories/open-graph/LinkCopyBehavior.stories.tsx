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
  TwoCol,
} from './ogStoryLayout';

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/** Anatomy of a link preview, labeling the parts that are NOT the image. */
const PreviewAnatomy = (): React.ReactElement => (
  <div
    style={{
      width: 460,
      maxWidth: '100%',
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      overflow: 'hidden',
      fontFamily: SANS,
      background: '#fff',
    }}
  >
    <div
      style={{
        height: 110,
        background: 'linear-gradient(135deg,#CE3DF3,#9D70F8)',
      }}
    />
    <div style={{ padding: '10px 14px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: '#0E1217',
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          d.
        </span>
        <span style={{ color: '#606770', fontSize: 12 }}>
          app.daily.dev · favicon + domain
        </span>
      </div>
      <div style={{ color: '#1d2129', fontSize: 16, fontWeight: 700 }}>
        og:title — the headline
      </div>
      <div style={{ color: '#606770', fontSize: 13, marginTop: 2 }}>
        og:description — the supporting line shown on FB, Slack, Discord,
        WhatsApp.
      </div>
    </div>
  </div>
);

const SHARE_TEXT_CODE = `// Today — shared/src/lib/share.ts
getTwitterShareLink(link, text) // → "{text} via @dailydotdev"
// "text" is usually just the post title, so a tweet reads:
//   "How we cut edge cold-starts… via @dailydotdev  app.daily.dev/posts/…"

// Recommended — context-aware, pre-filled share copy (still user-editable)
share.article  = \`\${title}\\n\\nvia @dailydotdev\`;
share.invite   = \`I use daily.dev to keep up with dev news — join me 👇\`;
share.profile  = \`My developer profile on @dailydotdev 👇\`;
share.squad    = \`We're sharing the best \${topic} content in this Squad 👇\`;
// Keep "via @dailydotdev" for attribution; add 1 relevant emoji max; no hashtag spam.`;

const LinkCopyBehavior = (): React.ReactElement => (
  <Page>
    <PageHeader
      eyebrow="Open Graph · Beyond the image"
      title="Link copy, metadata & sharing behavior"
    >
      The image gets the attention, but half of a great link preview is
      everything around it: the title wording, the description, the little
      favicon and brand avatar, the URL that shows, and the message we pre-fill
      when someone taps “share”. This page covers all of it — current state vs.
      what we should do — for the parts that live <em>outside</em> the Open
      Graph image.
    </PageHeader>

    <Heading>Anatomy — the non-image parts</Heading>
    <div
      style={{
        display: 'flex',
        gap: 32,
        flexWrap: 'wrap',
        alignItems: 'center',
        margin: '8px 0 16px',
      }}
    >
      <PreviewAnatomy />
      <div style={{ maxWidth: 380 }}>
        <Muted>
          On messengers and Slack/Discord/Facebook the <strong>text</strong>{' '}
          does most of the work — the image may be small or absent. The favicon
          and domain are the trust signal. The pre-filled share message is what
          actually frames the link for the recipient.
        </Muted>
      </div>
    </div>

    <Divider />

    <Heading>Title & description copy</Heading>
    <SpecTable
      columns={['Field', 'Today', 'Recommended']}
      rows={[
        [
          'og:title',
          '“{title} | daily.dev” — suffix often pushes it past 60 chars and gets truncated',
          'Drop the suffix on shareable content; sentence case; ≤ 55–60 chars',
        ],
        [
          'og:description',
          'Stripped article excerpt, or the generic site description as fallback',
          'Value-framed, ≤ 110 chars, HTML stripped; generate a contextual line when empty',
        ],
        [
          'Voice',
          'Inconsistent across surfaces',
          'Confident, concrete, developer-to-developer; no marketing fluff',
        ],
        [
          'Emoji',
          'None / inconsistent',
          'At most one, only where it adds clarity (invites, milestones)',
        ],
        [
          'Localization',
          'og:locale set on posts',
          'Keep locale; ensure copy + generated image text localize together',
        ],
      ]}
    />

    <Divider />

    <Heading>Favicon, site name & brand avatar</Heading>
    <Muted>
      Slack, Discord, iMessage and Reddit show a small favicon next to the
      domain; X shows the <code>@dailydotdev</code> profile avatar. These are
      tiny but they’re the brand’s handshake.
    </Muted>
    <SpecTable
      columns={['Asset', 'Why it matters', 'Recommendation']}
      rows={[
        [
          'favicon (16–48px)',
          'Shown beside the domain on Slack/Discord/iMessage/Reddit',
          'Crisp “d.” mark that reads at 16px; ship .ico + 32/48px PNG',
        ],
        [
          'apple-touch-icon (180px)',
          'iMessage / iOS rich links, home-screen',
          'Provide 180×180 with safe padding',
        ],
        [
          'og:site_name',
          'Renders the brand without spending title chars',
          'Always “daily.dev” (already set)',
        ],
        [
          'X profile avatar',
          'Shown on every tweet that links us',
          'Keep @dailydotdev avatar high-contrast; it frames the card',
        ],
        [
          'theme-color',
          'Tints the bubble/chrome on some mobile clients',
          'Set brand cabbage for a subtle on-brand tint',
        ],
      ]}
    />

    <Divider />

    <Heading>The pre-filled share message</Heading>
    <Muted>
      When a user shares from inside daily.dev, we pre-fill the text. Today it’s
      basically the title plus “via @dailydotdev”. Tailoring it per context (and
      keeping it editable) makes the share feel personal and lifts CTR.
    </Muted>
    <CodeBlock>{SHARE_TEXT_CODE}</CodeBlock>
    <TwoCol
      leftLabel="Today"
      rightLabel="Recommended"
      left={
        <Bullets
          tone="bad"
          items={[
            'One generic pattern: “{title} via @dailydotdev”.',
            'No framing for invites/profiles/squads — the why is missing.',
            'Same text regardless of platform norms.',
          ]}
        />
      }
      right={
        <Bullets
          tone="good"
          items={[
            'Context-aware copy per share type (article / invite / profile / squad / comment).',
            'Keep “via @dailydotdev” for attribution; one relevant emoji max.',
            'Always user-editable; we only pre-fill a strong default.',
          ]}
        />
      }
    />

    <Divider />

    <Heading>URLs & link behavior</Heading>
    <SpecTable
      columns={['Aspect', 'Today', 'Recommended']}
      rows={[
        [
          'Displayed domain',
          'app.daily.dev',
          'Fine — keep consistent; ensure canonical matches',
        ],
        [
          'Slug',
          'Readable post slugs',
          'Keep human-readable slugs; avoid IDs in the visible URL',
        ],
        [
          'Tracking params',
          'userid & cid appended to shared links (?userid=…&cid=share_post)',
          'Keep for attribution, but exclude from og:url/canonical so previews dedupe to one',
        ],
        [
          'Cache busting',
          'No version param on the image',
          'Append &v={contentHash} to the image URL so edits refresh FB/X/LinkedIn caches',
        ],
        [
          'Canonical',
          'Set on posts',
          'Always canonical to the clean post URL; strip share/tracking params',
        ],
        [
          'Link shortening',
          'Full URL shared',
          'Optional dub/short domain for messengers; ensure it preserves OG tags on unfurl',
        ],
      ]}
    />
    <Bullets
      items={[
        'Never put personal data in share URLs — userid/cid are campaign keys, which is fine; don’t add anything identifying.',
        'Make sure the share route (/posts/[id]/share) and the canonical post URL resolve to the same unfurl so a link isn’t cached twice with different art.',
      ]}
    />

    <Divider />

    <Heading>Priorities (beyond the image)</Heading>
    <SpecTable
      columns={['Priority', 'Change', 'Effort']}
      rows={[
        ['P0', 'Drop “| daily.dev” title suffix on shareable content', 'Low'],
        [
          'P0',
          'Context-aware pre-filled share copy in the share sheet',
          'Low/Med',
        ],
        [
          'P1',
          'Generated/contextual description fallbacks (no generic site copy)',
          'Med',
        ],
        ['P1', 'Crisp favicon + apple-touch-icon + theme-color audit', 'Low'],
        [
          'P2',
          'Content-hash (&v=) on image URLs; canonical strips tracking params',
          'Low',
        ],
      ]}
    />
  </Page>
);

const meta: Meta<typeof LinkCopyBehavior> = {
  title: 'Open Graph/8. Link Copy, Metadata & Behavior',
  component: LinkCopyBehavior,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof LinkCopyBehavior>;

export const CopyAndBehavior: Story = { name: 'Copy, metadata & behavior' };

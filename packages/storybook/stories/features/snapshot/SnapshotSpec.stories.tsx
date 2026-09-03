import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SNAPSHOT_SIZE } from '@dailydotdev/shared/src/features/snapshot/snapshotGradient';
import { SNAPSHOT_CARD_SIZE } from '@dailydotdev/shared/src/features/snapshot/SnapshotFrame';
import { SNAPSHOT_TEXT_LIMIT } from '@dailydotdev/shared/src/features/snapshot/snapshotText';

const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="font-bold text-text-primary typo-mega3">{children}</h1>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-4 font-bold text-text-primary typo-title1">{children}</h2>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="max-w-[52rem] text-text-secondary typo-body">{children}</p>
);

const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-left">
      <thead>
        <tr>
          {head.map((cell) => (
            <th
              key={cell}
              className="border-b border-border-subtlest-tertiary px-3 py-2 font-bold text-text-tertiary typo-footnote"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row[0])}>
            {row.map((cell, i) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className="border-b border-border-subtlest-tertiary px-3 py-2 align-top text-text-primary typo-callout"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-6 bg-surface-float px-1.5 py-0.5 text-text-primary typo-footnote">
    {children}
  </code>
);

const CANVAS = [
  ['Export', `${SNAPSHOT_SIZE} × ${SNAPSHOT_SIZE} PNG`, 'Square, one aspect for every surface'],
  ['Card', `${SNAPSHOT_CARD_SIZE} × ${SNAPSHOT_CARD_SIZE} min`, 'Grows with content; 48px radius, 2px lit edge'],
  ['Card padding', '58px', 'Cover art escapes it with negative margins'],
  ['Body', '#0B0812', 'Darker than the ground so the edge reads'],
  ['Logo', '36px tall, centred below the card', 'Always white, never themed'],
];

const TYPE = [
  ['Hero headline', '56–72px bold', 'Post title, quote, entity name'],
  ['Card title', '46–54px bold', 'Collectible name, streak label, list title'],
  ['Stat value', '52px bold (40px compact)', 'Compact for word-shaped values like a date'],
  ['Body', '28px, 1.55 line height', 'TLDR, description, comment context'],
  ['Meta', '26px', 'Date, read time, domain, counts'],
  ['Eyebrow / stat label', '22px bold uppercase, 2px tracking', 'Section labels'],
];

const CARDS = [
  ['Post', '#6350', 'Source, title, date, read time, domain, TLDR', 'Title, source'],
  ['Highlighted text', '#6352', 'Quote, source, post title, domain', 'Quote'],
  ['Happening now', '#6355', 'Gradient eyebrow, headline, age, TLDR', 'Headline'],
  ['Leaderboard rank', '#6359', 'Rank pill, avatar, name, XP, level ring, reputation', 'Rank, name, all three stats'],
  ['Watercooler post', '—', 'Author, title, body, age, comments', 'Author, title'],
  ['Hot take', '#6365', 'Fire eyebrow, take, subtitle, upvotes, flame watermark', 'Take'],
  ['Profile', '#6354', 'Cover, avatar, name, handle, bio, posts read, joined, reputation', 'Name, handle'],
  ['Reading overview', '#6358', 'Identity, streak + total days tiles, top tags, heatmap', 'Identity, both tiles'],
  ['Badges & awards', '#6360', 'Identity, badge + award tiles, keyword list, award tally', 'Identity, both tiles'],
  ['Achievements', '#6360', 'Identity, unlocked/total, points, rarest grid', 'Identity, counts'],
  ['Single achievement', '#6360', 'Full-bleed art, rarity pill, name, description, date', 'Art, name'],
  ['Invite', '#6366', 'Avatar, name, handle, headline, perk, link', 'Headline, link'],
  ['Reading streak', '#6358', 'Identity, day count, milestone, longest, total', 'Day count'],
  ['Tag / source / squad', '#6357, #6363', 'Kind label, image or hash, name, handle, description, 3 stats', 'Name, at least one stat'],
  ['Discussion', '#6349', 'Comment, post title, author, upvotes, replies', 'Comment, author'],
  ['Briefing / best-of', '#6353, #6364', 'Eyebrow, title, subtitle, up to 5 ranked rows', 'Title, ≥1 row'],
  ['Level up', '#6360', 'Identity, level ring, headline, XP, quests', 'Level'],
];

const RULES = [
  [
    'Text over the cap',
    <>
      Truncated at the last full word plus an ellipsis at{' '}
      <Code>{SNAPSHOT_TEXT_LIMIT}</Code> characters. A selection is never
      refused.
    </>,
  ],
  [
    'Text well under the cap',
    'The quote scales up instead: 72 / 60 / 48 / 40px by length. Short highlights are allowed at any length.',
  ],
  [
    'Unbreakable strings',
    <>
      <Code>overflow-wrap: anywhere</Code> keeps long URLs and type names inside
      the card.
    </>,
  ],
  [
    'Ragged wrapping',
    <>
      <Code>text-wrap: balance</Code> on every headline evens the line lengths
      and removes the orphan last word. Hyphenation is off.
    </>,
  ],
  [
    'Missing optional copy',
    'The region collapses. No empty band, no stray divider.',
  ],
  [
    'Missing image',
    'Falls back to an initial or token tile. A hung image is caught by the 15s capture timeout.',
  ],
  [
    'Zero counts',
    'The stat is hidden rather than printed as 0 — except streak and level, where zero is meaningful.',
  ],
  [
    'Large numbers',
    <>
      Run through <Code>largeNumberFormat</Code> (12.4K, 1.2M) and never wrap.
    </>,
  ],
  [
    'RTL and non-Latin',
    'Not handled yet. Needs dir="auto" on the quote and body blocks — tracked as a follow-up.',
  ],
];

const Spec = () => (
  <div className="flex flex-col gap-6 p-8">
    <H1>Snapshot share images — spec</H1>
    <P>
      A Snapshot turns a surface into a square image built for sharing. Every
      card is a real React component rasterized by snapdom and composed onto one
      canvas, so what renders in Storybook is what ships. The gradient is
      seeded from the subject&apos;s id, so a given post or profile always
      produces the same background.
    </P>

    <H2>Canvas</H2>
    <Table head={['Element', 'Value', 'Notes']} rows={CANVAS} />

    <H2>Type scale</H2>
    <Table head={['Role', 'Size', 'Used by']} rows={TYPE} />

    <H2>Cards and their content</H2>
    <P>
      &ldquo;Required&rdquo; is the content without which the card should not be
      offered. Everything else collapses when absent.
    </P>
    <Table head={['Card', 'PR', 'Carries', 'Required']} rows={CARDS} />

    <H2>Content rules</H2>
    <Table head={['Case', 'Behaviour']} rows={RULES} />

    <H2>Background</H2>
    <P>
      Sampled from the App Store screenshots: a near-black violet ground, one
      large halo behind the subject, and a quieter wash along the bottom. The
      seed only moves the halo&apos;s position, hue and intensity, so every
      image stays in one family. The card wears the device-frame treatment — a
      lit hairline brightest along the top edge, fading by the middle.
    </P>
  </div>
);

const meta: Meta<typeof Spec> = {
  title: 'Features/Snapshot/Spec',
  component: Spec,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Documentation: StoryObj<typeof Spec> = {};

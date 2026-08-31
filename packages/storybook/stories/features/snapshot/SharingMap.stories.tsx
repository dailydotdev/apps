import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Support } from './sharingMap';
import { SHARING_MAP } from './sharingMap';

const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="font-bold text-text-primary typo-mega3">{children}</h1>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-6 font-bold text-text-primary typo-title1">{children}</h2>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="max-w-[54rem] text-text-secondary typo-body">{children}</p>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="max-w-[54rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-callout">
    {children}
  </p>
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

const Primary = ({ children }: { children: string }) => (
  <span className="font-bold text-text-primary">{children}</span>
);

const SUPPORT: Record<Support, React.ReactNode> = {
  core: <span className="text-accent-avocado-default">core</span>,
  secondary: <span className="text-text-tertiary">secondary</span>,
  none: <span className="text-text-quaternary">—</span>,
};

const MAP: React.ReactNode[][] = SHARING_MAP.map((row) => [
  row.surface,
  row.pr,
  SUPPORT[row.link],
  SUPPORT[row.snapshot],
  <Primary>{row.leads}</Primary>,
  row.why,
]);

const TARGETS: React.ReactNode[][] = [
  ['Copy link', 'Link only', 'Going into a Slack thread or a DM, where a URL is the useful thing'],
  ['X', 'Image + link in text', 'Native images outperform link cards, and outbound links get demoted'],
  ['LinkedIn', 'Image + link in text', 'Same trade — native media beats an outbound link post'],
  ['WhatsApp', 'Image + link', 'Renders inline in the conversation; already 2.1k shares/30d'],
  ['Facebook', 'Image + link', 'Same inline rendering; 0.9k shares/30d'],
];

const DATA: React.ReactNode[][] = [
  ['Post page views', '1,380,365', ''],
  ['Unique viewers', '216,945', ''],
  ['Shares from post page', '10,109', '0.73% of views'],
  ['Unique sharers', '3,793', '1.75% of viewers'],
  ['Shares per sharer', '2.7', 'People who share, share repeatedly'],
];

const SharingMap = () => (
  <div className="flex flex-col gap-4 p-8">
    <H1>Where sharing lives, and what it should send</H1>
    <P>
      daily.dev has three share actions: copy link, share to a named target, and
      snapshot. This maps every surface that can be shared to the one that
      should lead there.
    </P>

    <H2>The rule</H2>
    <P>
      One question decides it: does the destination add something the payload
      does not? An article, a profile you can follow, a squad you can join — the
      destination is the value, so send a link. A quote, a rank, a streak, an
      unlocked achievement — the payload is the value, and often there is no
      page for the recipient to visit at all.
    </P>

    <H2>Surface decides the offer. Target decides the payload.</H2>
    <P>
      Copy link and share-to are not really two decisions, because the targets
      are named rather than a system sheet. Once someone picks a target, the
      payload follows from it — nobody has to choose between three buttons.
    </P>
    <Table head={['Target', 'Sends', 'Why']} rows={TARGETS} />

    <H2>The map</H2>
    <Table
      head={['Surface', 'PR', 'Link', 'Snapshot', 'Leads with', 'Why']}
      rows={MAP}
    />

    <H2>What the numbers say</H2>
    <Table head={['Post page, last 30 days', 'Value', '']} rows={DATA} />
    <Note>
      Payload is not the bottleneck. Around 99.3% of post views end in no share
      at all, while the people who do share come back and do it 2.7 times. The
      scarce event is a viewer becoming a first-time sharer — so the question
      worth testing is not link versus image, it is whether offering a snapshot
      raises the share rate at all. Copy link leading every surface is also
      confounded: it is the most prominent and lowest-friction control, so
      &ldquo;most used&rdquo; is not evidence of &ldquo;most wanted&rdquo;.
    </Note>

    <H2>Every snapshot needs a way back</H2>
    <P>
      Only the invite card carries a URL today, and only because a referral is
      useless without one. Every other snapshot is a dead end: no path back to
      daily.dev beyond the logo. Two fixes, both cheap — bake a short URL into
      every card, and put the link on the clipboard whenever a snapshot is
      taken, so pasting gives both. Without them, leading with snapshot on seven
      surfaces means removing the route back from our seven most shareable
      moments.
    </P>
  </div>
);

const meta: Meta<typeof SharingMap> = {
  title: 'Features/Snapshot/Sharing map',
  component: SharingMap,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Map: StoryObj<typeof SharingMap> = {};

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Support } from '../sharingMap';
import { SHARING_MAP } from '../sharingMap';
import { H1, Note, P } from '../surfaceChrome';

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-6 font-bold text-text-primary typo-title1">{children}</h2>
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

const SUPPORT: Record<Support, React.ReactNode> = {
  core: <span className="text-accent-avocado-default">core</span>,
  secondary: <span className="text-text-tertiary">secondary</span>,
  none: <span className="text-text-quaternary">—</span>,
};

const MAP_ROWS: React.ReactNode[][] = SHARING_MAP.map((row) => [
  row.surface,
  row.pr,
  SUPPORT[row.link],
  SUPPORT[row.snapshot],
  <span className="font-bold text-text-primary">{row.leads}</span>,
  row.why,
]);

const PAGES: React.ReactNode[][] = [
  [
    'Post page',
    '#6350 #6352 #6349 #6351',
    'Six places on one screen: the ⋯ menu, the action row, under the TLDR, the selection bar, the end-of-thread band, the post-upvote prompt',
  ],
  [
    'Happening now',
    '#6355',
    'Page, topic and highlight level — and what a page-level snapshot actually looks like at thumbnail size',
  ],
  [
    'Briefing',
    '#6353',
    'Whole briefing versus per item, plus a closing band at the end of the read',
  ],
  [
    'Profile',
    '#6354 #6360 #6356',
    'Header, the three widgets, and the DevCard — three surfaces on one page that want three different controls',
  ],
  [
    'Status moments',
    '#6358 #6360 #6359',
    'Streak, achievements, leaderboard rank. Frequency and touch support matter more than placement here',
  ],
  [
    'Feed cards & lists',
    '#6365 #6361',
    'Feed card, hot take, reading history — where hover-reveal quietly excludes mobile',
  ],
  [
    'Topic & directory pages',
    '#6357 #6363 #6364 #6359',
    'Tags, sources, squads, collections — sharing beside a primary CTA without competing with it',
  ],
  [
    'Invite & feed export',
    '#6366 #6362',
    'The two surfaces that exist to send something outward, at opposite ends of the payload question',
  ],
];

const STEPS: React.ReactNode[][] = [
  ['Today', 'What ships now — usually the ⋯ menu, or nothing at all'],
  [
    'Recommended',
    'Visible in place, leading with the action the map chose for that surface',
  ],
  [
    'Push',
    'The loudest treatment worth trying: labeled, filled, or self-opening — and snapshot promoted to primary wherever the payload can carry it',
  ],
];

const Overview = () => (
  <div className="flex flex-col gap-4 p-8">
    <H1>Share visibility — one page per surface</H1>
    <P>
      Two goals drive every variation in this section: make the share control
      impossible to miss, and lead with snapshot wherever the payload is the
      thing worth sending. Each page draws one real surface and shows every
      variation of it side by side, so the options can be compared as designs
      rather than argued as a list.
    </P>
    <Table head={['Page', 'PRs', 'What it covers']} rows={PAGES} />

    <H2>The three steps on every page</H2>
    <Table head={['Step', 'What it means']} rows={STEPS} />
    <Note>
      The controls in this section are inert — it compares where a control sits
      and how loud it is. The working buttons and live capture are on{' '}
      <span className="font-bold text-text-primary">Button placements</span>,
      and the images they produce are on{' '}
      <span className="font-bold text-text-primary">Share images</span>.
    </Note>

    <H2>The mapping this is built on</H2>
    <P>
      Unchanged from the Sharing map. Where a Push variation contradicts it, the
      note on that variation says so and why it is still worth testing — the map
      is a default, not a veto.
    </P>
    <Table
      head={['Surface', 'PR', 'Link', 'Snapshot', 'Leads with', 'Why']}
      rows={MAP_ROWS}
    />

    <H2>Where snapshot can lead</H2>
    <P>
      Seven surfaces have no useful destination to send anyone to — a streak, a
      rank, an unlocked achievement, your own briefing, your own feed. Snapshot
      is not the louder option there, it is the only one, so it leads by
      default. On the rest the destination is the value and a snapshot competes
      with it; those get a Push variation so the trade can be measured instead
      of assumed.
    </P>
    <Note>
      One caveat applies to every Push variation: only the invite card carries a
      URL today. Promoting snapshot on a surface before a short link is baked
      into the card trades a share that leads somewhere for one that does not.
    </Note>
  </div>
);

const meta: Meta<typeof Overview> = {
  title: 'Features/Snapshot/Surfaces/Overview',
  component: Overview,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Index: StoryObj<typeof Overview> = {};

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UpvoteIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  NotificationFilterCategory,
  notificationCategoryBadge,
} from '@dailydotdev/shared/src/components/notifications/utils';
import ExtensionProviders from '../../extension/_providers';
import { img } from './_mock';

// Round 3 — creative directions for the multi-actor lead (upvote milestones).
// Earlier rounds (square grid, overlapping stack, single avatar, icon-only)
// were all rejected. Two hard rules drive these:
//   1. Never overlap or break the text/layout — everything is either inside the
//      40px lead box (clipped) or in the content column where there's room.
//   2. Always show several faces, so it reads as "lots of people", never one.
// A few of these deliberately move the social proof OUT of the tiny lead box
// and into the row body, where multiple faces fit comfortably.
// STORY-LOCAL ONLY — nothing here changes the shipped component yet.

const meta: Meta = {
  title: 'Components/Notifications/Avatar alternatives',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Creative, contained ways to show that many people acted. Each obeys two rules: never overlap the text/design, and always show several faces. Shown at "a few" (3) and "many" (24).',
      },
    },
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const upvote = notificationCategoryBadge[NotificationFilterCategory.Upvotes];
const SEEDS = ['ada', 'bram', 'cleo', 'dana', 'eli'];

const Mini = ({ seed, size }: { seed: string; size: string }) => (
  <img
    src={img(`alt-${seed}`, 64)}
    alt=""
    className={`${size} rounded-full border-2 border-background-default object-cover`}
  />
);

const UpvoteCircle = ({ size = 'size-9' }: { size?: string }) => (
  <span
    className={`flex ${size} items-center justify-center rounded-full ${upvote.bg}`}
  >
    <UpvoteIcon secondary size={IconSize.Small} className={upvote.fg} />
  </span>
);

const CornerBadge = () => (
  <span
    className={`absolute -bottom-1 -right-1 z-2 flex size-4 items-center justify-center rounded-full border-2 border-background-default ${upvote.bg}`}
  >
    <UpvoteIcon secondary size={IconSize.XXSmall} className={upvote.fg} />
  </span>
);

// ---------------------------------------------------------------------------
// Idea 1 — "Liked-by" face row. The lead is just the upvote mark; the faces
// move to their own line under the title, where there's plenty of room.
// ---------------------------------------------------------------------------
const FaceRow = ({ total }: { total: number }) => {
  const shown = Math.min(4, total);
  const rest = total - shown;
  return (
    <span className="flex items-center gap-2">
      <span className="flex -space-x-1.5">
        {SEEDS.slice(0, shown).map((s) => (
          <Mini key={s} seed={s} size="size-5" />
        ))}
      </span>
      <span className="text-text-tertiary typo-footnote">
        {rest > 0 ? `and ${rest} more upvoted` : 'upvoted your comment'}
      </span>
    </span>
  );
};

// ---------------------------------------------------------------------------
// Idea 2 — faces pill. A compact rounded chip of overlapping mini-faces + count
// that sits inline in the subtitle. Self-contained, never bleeds.
// ---------------------------------------------------------------------------
const FacesPill = ({ total }: { total: number }) => {
  const shown = Math.min(3, total);
  const rest = total - shown;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-float py-0.5 pl-1 pr-2 align-middle">
      <span className="flex -space-x-1">
        {SEEDS.slice(0, shown).map((s) => (
          <Mini key={s} seed={s} size="size-4" />
        ))}
      </span>
      <span className="font-bold text-text-secondary typo-caption2">
        {rest > 0 ? `+${rest}` : 'new'}
      </span>
    </span>
  );
};

// ---------------------------------------------------------------------------
// Idea 3 — clipped cluster. Overlapping faces, but the lead box hard-clips them
// (overflow-hidden), so it can NEVER spill onto other content — and the cut-off
// edge itself implies "there are more". Badge sits outside the clip.
// ---------------------------------------------------------------------------
const ClippedCluster = ({ total }: { total: number }) => (
  <div className="relative size-10">
    <div className="flex size-10 items-center overflow-hidden rounded-12 bg-surface-float">
      <span className="flex -space-x-2 pl-0.5">
        {SEEDS.slice(0, Math.min(5, Math.max(3, total))).map((s) => (
          <Mini key={s} seed={s} size="size-7" />
        ))}
      </span>
    </div>
    <CornerBadge />
  </div>
);

// ---------------------------------------------------------------------------
// Idea 4 — diamond cluster. Three faces + the upvote mark arranged in a diamond
// inside the box. Organic, distinct from the square grid.
// ---------------------------------------------------------------------------
const Diamond = () => (
  <div className="relative size-10">
    <span className="absolute left-1/2 top-0 -translate-x-1/2">
      <Mini seed="ada" size="size-5" />
    </span>
    <span className="absolute left-0 top-1/2 -translate-y-1/2">
      <Mini seed="bram" size="size-5" />
    </span>
    <span className="absolute right-0 top-1/2 -translate-y-1/2">
      <Mini seed="cleo" size="size-5" />
    </span>
    <span
      className={`absolute bottom-0 left-1/2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background-default ${upvote.bg}`}
    >
      <UpvoteIcon secondary size={IconSize.XXSmall} className={upvote.fg} />
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// Idea 5 — count coin + mini faces. A bold count "coin" leads (instantly says
// "a lot"), with two real faces peeking from the corner so it stays human.
// ---------------------------------------------------------------------------
const CountCoin = ({ total }: { total: number }) => (
  <div className="relative size-10">
    <span
      className={`flex size-10 items-center justify-center rounded-full font-bold typo-footnote ${upvote.bg} ${upvote.fg}`}
    >
      {total}
    </span>
    <span className="absolute -bottom-1 -right-1 flex -space-x-1">
      {SEEDS.slice(0, 2).map((s) => (
        <Mini key={s} seed={s} size="size-4" />
      ))}
    </span>
  </div>
);

// ---------------------------------------------------------------------------

interface Idea {
  key: string;
  label: string;
  note: string;
  recommended?: boolean;
  // A row needs lead + subtitle; ideas 1/2 put the faces in the subtitle.
  render: (total: number) => {
    lead: React.ReactNode;
    subtitle: React.ReactNode;
  };
}

const COMMENT = '“Have you tried the new view transitions API?”';

const ideas: Idea[] = [
  {
    key: '1',
    label: '1 · “Liked-by” face row',
    note: 'Lead is just the upvote mark; the faces get their own line under the title where there is real room. Reads instantly as “a group of people”, and can never crowd the lead box.',
    recommended: true,
    render: (total) => ({
      lead: <UpvoteCircle />,
      subtitle: <FaceRow total={total} />,
    }),
  },
  {
    key: '2',
    label: '2 · Faces pill in the subtitle',
    note: 'A compact rounded chip of overlapping mini-faces + count, inline in the subtitle. Self-contained, scannable, leaves the lead for the type mark.',
    render: (total) => ({
      lead: <UpvoteCircle />,
      subtitle: (
        <span className="inline-flex items-center gap-1.5">
          <FacesPill total={total} /> upvoted your comment
        </span>
      ),
    }),
  },
  {
    key: '3',
    label: '3 · Clipped cluster (peeking crowd)',
    note: 'Overlapping faces hard-clipped to the lead box, so it physically cannot spill onto the text — and the cut-off edge implies more people. Badge stays outside the clip.',
    recommended: true,
    render: () => ({ lead: <ClippedCluster total={24} />, subtitle: COMMENT }),
  },
  {
    key: '4',
    label: '4 · Diamond cluster',
    note: 'Three faces + the upvote mark in a diamond inside the box. Organic and clearly different from the square grid; fully contained.',
    render: () => ({ lead: <Diamond />, subtitle: COMMENT }),
  },
  {
    key: '5',
    label: '5 · Count coin + peeking faces',
    note: 'A bold count “coin” leads — instantly says “a lot” — with two real faces peeking from the corner so it stays human, not just a number.',
    render: (total) => ({
      lead: <CountCoin total={total} />,
      subtitle: COMMENT,
    }),
  },
];

const Row = ({
  lead,
  subtitle,
}: {
  lead: React.ReactNode;
  subtitle: React.ReactNode;
}) => (
  <div className="flex min-h-16 flex-row items-start gap-3 bg-background-default px-4 py-3">
    <div className="flex w-10 shrink-0 items-start justify-start">{lead}</div>
    <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
      <div className="break-words font-normal text-text-primary typo-callout">
        24 upvotes on your comment!{' '}
        <span className="whitespace-nowrap text-text-tertiary typo-footnote">
          · 2h
        </span>
      </div>
      <div className="break-words text-text-tertiary typo-subhead">
        {subtitle}
      </div>
    </div>
  </div>
);

const Alternatives = (): React.ReactElement => (
  <div className="mx-auto max-w-[44rem] p-6">
    <h1 className="font-bold text-text-primary typo-title2">
      Multi-actor lead — round 3 (creative)
    </h1>
    <p className="mt-2 text-text-secondary typo-callout">
      Fresh directions, not grid tweaks. Every one obeys two rules: it never
      overlaps the text or breaks the layout, and it always shows several faces
      so it reads as “lots of people”. Ideas 1–2 move the faces into the row
      body (more room); 3–5 are contained inside the lead box. Each is shown at{' '}
      <b>a few (3)</b> and <b>many (24)</b>.
    </p>

    <div className="mt-6 flex flex-col gap-8">
      {ideas.map((idea) => {
        const few = idea.render(3);
        const many = idea.render(24);
        return (
          <section key={idea.key} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-text-primary typo-title3">
                {idea.label}
              </h2>
              {idea.recommended && (
                <span className="rounded-6 bg-accent-avocado-default px-1.5 py-0.5 font-bold text-black typo-caption2">
                  recommended
                </span>
              )}
            </div>
            <p className="text-text-tertiary typo-footnote">{idea.note}</p>
            <div className="flex flex-col gap-2">
              <span className="text-text-quaternary typo-caption1">
                A few (3)
              </span>
              <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
                <Row lead={few.lead} subtitle={few.subtitle} />
              </div>
              <span className="text-text-quaternary typo-caption1">
                Many (24)
              </span>
              <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
                <Row lead={many.lead} subtitle={many.subtitle} />
              </div>
            </div>
          </section>
        );
      })}
    </div>

    <div className="mt-8 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-footnote">
      <b className="text-text-primary">My take:</b> <b>1</b> (“liked-by” face
      row) is the boldest and most legible — the faces finally get room and the
      row reads like a social moment. <b>3</b> (clipped cluster) is the most
      striking if you want to keep the faces in the lead while guaranteeing they
      can’t spill. Tell me which number and I’ll wire it into the real
      NotificationItem (and the in-app popup).
    </div>
  </div>
);

export const Compare: Story = {
  name: 'Compare options',
  render: () => <Alternatives />,
};

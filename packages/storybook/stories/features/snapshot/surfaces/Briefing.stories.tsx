import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  AnalyticsIcon,
  LinkIcon,
  SettingsIcon,
  ShareIcon,
  TimerIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { DeviceName } from '../surfaceChrome';
import {
  AVATAR,
  Category,
  Control,
  Device,
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'allSizes' | 'closing';

/**
 * BriefPostContent renders the body through `<Markdown content={contentHtml} />`
 * — one blob, no per-item nodes — so the sections here are illustrative of the
 * copy, not of a component the UI could hang a control on.
 */
const BODY = [
  [
    'The TypeScript migration is effectively over',
    'Four of the five major frameworks now ship types first, and the fifth has an RFC open.',
  ],
  [
    'Postgres keeps eating the specialist databases',
    'Vector, queue and time-series workloads are consolidating back into one engine.',
  ],
  [
    'Nobody agrees on what an AI agent is',
    'Three definitions in circulation, and the benchmarks measure none of them.',
  ],
];

const HeaderActions = ({ spot }: { spot: Spot }) => {
  return (
    <div className="flex items-center gap-1">
      {spot !== 'closing' && (
        <Button
          aria-label="Copy link"
          icon={<LinkIcon />}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
        />
      )}
      <Button
        aria-label="Notification settings"
        icon={<SettingsIcon />}
        size={ButtonSize.Medium}
        variant={ButtonVariant.Tertiary}
      />
    </div>
  );
};

const BriefingScreen = ({
  device,
  spot,
}: {
  device: DeviceName;
  spot: Spot;
}) => (
  <Device name={device}>
    <div className="flex flex-col gap-6 p-4">
      {/* BriefUpgradeAlert — non-Plus only. */}
      <div className="rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-tertiary typo-footnote">
        Upgrade to Plus for a briefing every morning
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex min-w-full items-center justify-between gap-2">
          <span className="text-text-secondary typo-callout">
            Your Monday briefing
          </span>
          <HeaderActions spot={spot} />
        </div>
        <h1
          className={`font-bold text-text-primary ${
            device === 'Mobile' ? 'typo-title2' : 'typo-large-title'
          }`}
        >
          Tomer presidential briefing
        </h1>
        <span className="flex gap-3 text-text-secondary typo-footnote">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <TimerIcon aria-hidden /> Save 12m of reading
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <AnalyticsIcon aria-hidden /> 34 posts analyzed
          </span>
        </span>
      </div>

      <div className="-mt-3 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1 rounded-20 border border-border-subtlest-tertiary px-2.5 py-2">
          <TimerIcon aria-hidden className="text-text-tertiary" />
          <span className="text-text-primary typo-footnote">5m read</span>
        </span>
        <div className="flex w-full items-center gap-1">
          <div className="flex">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                alt=""
                className="-ml-1 size-4 rounded-full border border-background-default object-cover first:ml-0"
                src={AVATAR}
              />
            ))}
          </div>
          <span className="truncate text-text-tertiary typo-footnote">
            12 Sources
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {BODY.map(([heading, body]) => (
          <div key={heading} className="flex flex-col gap-1">
            <span className="font-bold text-text-primary typo-body">
              {heading}
            </span>
            <span className="text-text-secondary typo-footnote">{body}</span>
          </div>
        ))}
      </div>

      {spot === 'closing' && (
        <div className="flex items-center gap-3 rounded-12 bg-surface-float p-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold text-text-primary typo-footnote">
              Share your briefing
            </span>
            <span className="text-text-tertiary typo-caption1">
              Short briefing by @tomer
            </span>
          </div>
          <Control action="Snapshot" label variant={ButtonVariant.Primary} />
        </div>
      )}
    </div>
  </Device>
);

const AllDevices = ({ spot }: { spot: Spot }) => (
  <Rail>
    <BriefingScreen device="Desktop" spot={spot} />
    <BriefingScreen device="Tablet" spot={spot} />
    <BriefingScreen device="Mobile" spot={spot} />
  </Rail>
);

/* ------------------------------------------------------- the /briefing list */

const BRIEFS = [
  { title: 'Your Monday briefing', pill: 'Just in', read: false, mins: 5 },
  { title: 'Your Sunday briefing', read: true, mins: 4 },
  { title: 'Your Saturday briefing', read: true, mins: 6 },
];

/**
 * BriefShareControls from #6353: copy link on the left, then the arrow that
 * opens the social surface. One glyph per meaning — the arrow is never a
 * one-tap copy. Rendered after the full-bleed CardLink with an explicit
 * z-index, or the overlay swallows the clicks.
 */
const RowControls = () => (
  <div className="relative z-1 flex shrink-0 items-center gap-1">
    <Button
      aria-label="Copy link"
      icon={<LinkIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
    <Button
      aria-label="Share briefing"
      icon={<ShareIcon />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
    />
  </div>
);

const BriefRow = ({
  brief,
  device,
}: {
  brief: (typeof BRIEFS)[number];
  device: DeviceName;
}) => (
  <article className="relative flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-3">
    {/* BriefGradientIcon — `hidden mobileXL:flex`. */}
    {device !== 'Mobile' && (
      <span className="size-12 shrink-0 rounded-12 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default" />
    )}
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`min-w-0 shrink truncate font-bold typo-title3 ${
            brief.read ? 'text-text-quaternary' : 'text-text-primary'
          }`}
        >
          {brief.title}
        </span>
        {brief.pill && (
          <span className="shrink-0 rounded-10 bg-accent-bacon-default px-2 py-0.5 text-text-primary typo-caption1">
            {brief.pill}
          </span>
        )}
      </div>
      <span className="truncate text-text-tertiary typo-subhead">
        <span className="text-text-primary">{brief.mins}m read time</span>
        {' • '}
        Based on 34 posts from 12 sources
      </span>
    </div>
    <RowControls />
  </article>
);

const BriefListScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <h1
          className={`flex-1 font-bold text-text-primary ${
            device === 'Mobile' ? 'typo-title2' : 'typo-title1'
          }`}
        >
          Presidential briefings
        </h1>
        <Button size={ButtonSize.Small} variant={ButtonVariant.Primary}>
          Generate Brief
        </Button>
        <Button
          aria-label="Notification settings"
          icon={<SettingsIcon />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
        />
      </div>

      <div className="rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 text-text-tertiary typo-footnote">
        Upgrade to Plus for a briefing every morning
      </div>

      <section className="flex w-full flex-col gap-4">
        {BRIEFS.map((brief) => (
          <BriefRow key={brief.title} brief={brief} device={device} />
        ))}
      </section>

      <span className="px-4 pb-2 pt-6 font-bold text-text-quaternary typo-title3">
        2025
      </span>
    </div>
  </Device>
);

const AllLists = () => (
  <Rail>
    <BriefListScreen device="Desktop" />
    <BriefListScreen device="Tablet" />
    <BriefListScreen device="Mobile" />
  </Rail>
);

const Briefing = () => (
  <SurfacePage
    intro="Two surfaces, not one: the list at /briefing and the briefing itself. The most personal artifact we produce, and the one surface where a link is actively wrong: send someone the URL and they get their own briefing, or a login wall. The image is the only payload that survives the trip."
    map="Sharing map: lead with Snapshot (#6353). Link is not a secondary option here, it is a broken one — which makes this the clearest case in the product for snapshot as the primary control."
    title="Presidential briefing"
  >
    <Category
      covers="webapp/pages/briefing · BriefListItem.tsx · #6353 BriefShareControls.tsx"
      title="The list at /briefing"
      verdict="Tsahi already built this in #6353: a copy-link button and a share arrow on every row, behind the `share_briefing_digest` gate. The PR is closed and stacked on #6343, so none of it reached main — but the component exists and the decisions in it are settled."
    >
      <Variant
        headline="Copy link and share arrow per row"
        note="#6353's BriefShareControls, unchanged: copy on the left, then the arrow that opens the popover on desktop and the native sheet on mobile. One glyph per meaning — the arrow is never a one-tap copy. Both render after the CardLink with `relative z-1`, or the overlay swallows the clicks."
        step="Shipping · #6353"
      >
        <AllLists />
      </Variant>
    </Category>

    <Category
      covers="BriefPostContent.tsx · BriefPostHeader.tsx · BriefPostHeaderActions.tsx"
      title="What actually ships today"
      verdict="Corrected: the briefing is not missing a share control. BriefPostHeaderActions already renders a copy-link button beside the settings gear — but the whole cluster is wrapped in `hidden laptop:block`, so it exists on desktop and nowhere else. The gap is a breakpoint, not a missing feature."
    >
      <Variant
        headline="The same control, at every width"
        note="The cheapest fix on this page and the one that needs no new design: drop `hidden laptop:block`. Everything else here is an argument about payload; this is an argument about a class name."
        step="Shipping"
      >
        <AllDevices spot="allSizes" />
      </Variant>
    </Category>

    <Category
      covers="#6353 · briefing and personalized digest"
      title="Where snapshot goes"
      verdict="One caveat first: the body is a single `<Markdown content={contentHtml} />` blob, so there are no per-item nodes to hang a control on. Per-item sharing is not a placement decision here, it is a renderer change — which rules out the obvious option and leaves two."
    >
      <Variant
        headline="A closing band after the last section"
        note="Finishing the briefing is itself the trigger, and this is the only variant that catches people at the end rather than asking them to scroll back to a header they passed minutes ago."
        step="Shipping"
      >
        <AllDevices spot="closing" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof Briefing> = {
  title: 'Features/Snapshot/Surfaces/Briefing',
  component: Briefing,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof Briefing> = {};

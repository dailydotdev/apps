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

type Spot = 'today' | 'allSizes' | 'snapshot' | 'closing';

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

const HeaderActions = ({
  device,
  spot,
}: {
  device: DeviceName;
  spot: Spot;
}) => {
  // `hidden laptop:block` in BriefPostHeaderActions — the whole cluster,
  // copy link included, is absent below 1020px today.
  const hiddenToday = device !== 'Desktop' && spot === 'today';

  if (hiddenToday) {
    return null;
  }

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
      {spot === 'snapshot' && (
        <Control action="Snapshot" size={ButtonSize.Medium} />
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
          <HeaderActions device={device} spot={spot} />
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

const Briefing = () => (
  <SurfacePage
    intro="The most personal artifact we produce, and the one surface where a link is actively wrong: send someone the URL and they get their own briefing, or a login wall. The image is the only payload that survives the trip."
    map="Sharing map: lead with Snapshot (#6353). Link is not a secondary option here, it is a broken one — which makes this the clearest case in the product for snapshot as the primary control."
    title="Presidential briefing"
  >
    <Category
      covers="BriefPostContent.tsx · BriefPostHeader.tsx · BriefPostHeaderActions.tsx"
      title="What actually ships today"
      verdict="Corrected: the briefing is not missing a share control. BriefPostHeaderActions already renders a copy-link button beside the settings gear — but the whole cluster is wrapped in `hidden laptop:block`, so it exists on desktop and nowhere else. The gap is a breakpoint, not a missing feature."
    >
      <Variant
        headline="Copy link on desktop, nothing below 1020px"
        note="Kicker, heading, the two stats, then the read-time pill and source avatars. The copy and settings buttons sit to the right of the kicker on desktop and vanish entirely on tablet and mobile — where most briefings are read."
        step="Today"
      >
        <AllDevices spot="today" />
      </Variant>
      <Variant
        headline="The same control, at every width"
        note="The cheapest fix on this page and the one that needs no new design: drop `hidden laptop:block`. Everything else here is an argument about payload; this is an argument about a class name."
        step="Recommended · first"
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
        headline="Snapshot beside copy link in the header"
        note="Recommended. One control, one card, titled ‘Short briefing by @tomer’. Sits with the copy button it complements, matched to it at Medium."
        step="Recommended"
      >
        <AllDevices spot="snapshot" />
      </Variant>
      <Variant
        headline="A closing band after the last section"
        note="Finishing the briefing is itself the trigger, and this is the only variant that catches people at the end rather than asking them to scroll back to a header they passed minutes ago."
        step="Push"
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

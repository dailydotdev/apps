import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons';
import {
  AVATAR,
  Category,
  Control,
  OverflowMenu,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'menu' | 'header' | 'item' | 'closing';

const ITEMS = [
  {
    title: 'The TypeScript migration is effectively over',
    body: 'Four of the five major frameworks now ship types first.',
  },
  {
    title: 'Postgres keeps eating the specialist databases',
    body: 'Vector, queue and time-series workloads are consolidating back.',
  },
  {
    title: 'Nobody agrees on what an AI agent is',
    body: 'Three definitions in circulation, and the benchmarks measure none of them.',
  },
];

const BriefingScreen = ({ spot }: { spot: Spot }) => (
  <Screen>
    <div className="flex flex-col gap-4 p-4">
      <div className="relative flex items-center gap-3">
        <img alt="" className="size-9 rounded-full object-cover" src={AVATAR} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold uppercase text-text-quaternary typo-caption2">
            Presidential briefing
          </span>
          <span className="font-bold text-text-primary typo-title3">
            5 things worth your morning
          </span>
          <span className="text-text-quaternary typo-caption1">
            Prepared for @tomer · today
          </span>
        </div>
        {spot === 'header' ? (
          <Control action="Snapshot" />
        ) : (
          <Button
            aria-label="Options"
            icon={<MenuIcon />}
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
          />
        )}
        {spot === 'menu' && <OverflowMenu action="Link" />}
      </div>

      <div className="flex flex-col gap-3">
        {ITEMS.map((item, index) => (
          <div
            key={item.title}
            className="flex items-start gap-3 border-t border-border-subtlest-tertiary pt-3"
          >
            <span className="font-bold text-text-quaternary typo-footnote">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-bold text-text-primary typo-footnote">
                {item.title}
              </span>
              <span className="text-text-tertiary typo-caption1">
                {item.body}
              </span>
            </div>
            {spot === 'item' && <Control action="Snapshot" />}
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
  </Screen>
);

const Briefing = () => (
  <SurfacePage
    intro="The most personal artifact we produce, and the one surface where a link is actively wrong: send someone the URL and they get their own briefing, or a login wall. The image is the only payload that survives the trip."
    map="Sharing map: lead with Snapshot (#6353). Link is not a secondary option here, it is a broken one — which makes this the clearest case in the product for snapshot as the only control."
    title="Presidential briefing & digest"
  >
    <Category
      covers="#6353 · briefing and personalized digest"
      title="Whole briefing, or per item"
      verdict="Two different products. The whole-briefing card says something about you; the per-item card says something about the news."
    >
      <Variant
        headline="No share control at all"
        note="The digest currently cannot leave the product in any form."
        step="Today"
      >
        <BriefingScreen spot="menu" />
      </Variant>
      <Variant
        headline="Snapshot in the briefing header"
        note="Recommended. One control, one card, titled ‘Short briefing by @tomer’ — the whole briefing as a single image."
        step="Recommended"
      >
        <BriefingScreen spot="header" />
      </Variant>
      <Variant
        headline="Snapshot per item"
        note="Turns each line into its own quotable card. More shares available, but three controls in a five-item list is a lot of chrome for a reading surface."
        step="Per item"
      >
        <BriefingScreen spot="item" />
      </Variant>
      <Variant
        headline="A closing band after the last item"
        note="Finishing the briefing is itself the trigger, and this is the only variant that catches people at the end rather than asking them to scroll back up."
        step="Closing"
      >
        <BriefingScreen spot="closing" />
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

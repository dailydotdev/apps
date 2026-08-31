import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Category,
  Control,
  OverflowMenu,
  Screen,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

type Spot = 'menu' | 'row' | 'expanded' | 'page';

const HIGHLIGHTS = [
  {
    title: 'OpenAI ships a cheaper model tier',
    body: 'Priced at a third of the previous tier, with the same context window.',
    meta: '12 sources · 2h ago',
  },
  {
    title: 'React 20 drops the legacy render path',
    body: 'The codemod covers most apps; class components are the exception.',
    meta: '8 sources · 4h ago',
  },
  {
    title: 'Postgres 19 lands async I/O by default',
    body: 'Early benchmarks show double-digit gains on write-heavy workloads.',
    meta: '5 sources · 6h ago',
  },
];

const LivePill = () => (
  <span className="flex items-center gap-1.5 rounded-8 bg-overlay-float-ketchup px-2 py-0.5 font-bold uppercase text-accent-ketchup-default typo-caption2">
    <span className="size-1.5 rounded-full bg-accent-ketchup-default" />
    Live
  </span>
);

const HappeningScreen = ({ spot }: { spot: Spot }) => (
  <Screen>
    <div className="flex flex-col gap-4 p-4">
      <div className="relative flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <LivePill />
          <span className="font-bold text-text-primary typo-title3">
            Happening now
          </span>
          <span className="text-text-quaternary typo-caption1">
            Updated 4 minutes ago
          </span>
        </div>
        {spot === 'page' ? (
          <Control action="Snapshot" label variant={ButtonVariant.Secondary} />
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

      {HIGHLIGHTS.map((item, index) => {
        const expanded = spot === 'expanded' && index === 0;

        return (
          <div
            key={item.title}
            className={`flex flex-col gap-2 rounded-12 border p-3 ${
              expanded
                ? 'border-border-subtlest-tertiary bg-surface-float'
                : 'border-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent-cabbage-default" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-bold text-text-primary typo-footnote">
                  {item.title}
                </span>
                <span className="text-text-tertiary typo-caption1">
                  {expanded ? item.body : item.meta}
                </span>
              </div>
              {spot === 'row' && <Control action="Snapshot" />}
            </div>

            {expanded && (
              <div className="flex items-center gap-2 border-t border-border-subtlest-tertiary pt-2">
                <span className="flex-1 text-text-quaternary typo-caption1">
                  {item.meta}
                </span>
                <Control action="Link" />
                <Control
                  action="Snapshot"
                  label
                  variant={ButtonVariant.Primary}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  </Screen>
);

const HappeningNow = () => (
  <SurfacePage
    intro="Three levels can be shared here — the whole page, a topic, and a single highlight — and today none of them can. The page also has the shortest shelf life in the product, which is exactly why the image matters: a link sends someone to a page that has already moved on."
    map="Sharing map: lead with Snapshot (#6355). The payload is effectively the whole page, and news travels through chat apps where an image renders inline and a link collapses to a grey card."
    title="Happening now"
  >
    <Category
      covers="#6355 · page, topic and highlight level"
      title="Where the control goes"
      verdict="Snapshot leads at every level. The open question is per-highlight versus page-level, not which action wins."
    >
      <Variant
        headline="Nothing to share, at any level"
        note="The fastest-moving page we publish and nothing can be lifted out of it."
        step="Today"
      >
        <HappeningScreen spot="menu" />
      </Variant>
      <Variant
        headline="Snapshot on every highlight"
        note="Recommended. Each highlight is already a self-contained claim with sources behind it — exactly the shape a snapshot card wants."
        step="Recommended"
      >
        <HappeningScreen spot="row" />
      </Variant>
      <Variant
        headline="Expanded highlight, snapshot leading"
        note="Built and live. Expansion is the intent signal, and there is finally room for a label without crowding the row."
        step="Expanded"
      >
        <HappeningScreen spot="expanded" />
      </Variant>
      <Variant
        headline="One control on the page header"
        note="Cheapest to build and the weakest offer: a snapshot of the whole page is a wall of headlines nobody reads at thumbnail size."
        step="Alternative"
      >
        <HappeningScreen spot="page" />
      </Variant>
    </Category>
  </SurfacePage>
);

const meta: Meta<typeof HappeningNow> = {
  title: 'Features/Snapshot/Surfaces/Happening now',
  component: HappeningNow,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Variations: StoryObj<typeof HappeningNow> = {};

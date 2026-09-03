import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { DeviceName } from '../surfaceChrome';
import {
  Category,
  Control,
  Device,
  Rail,
  SurfacePage,
  Variant,
} from '../surfaceChrome';

const TABS = ['Major headlines', 'All highlights', 'AI', 'Web'];

const HIGHLIGHTS = [
  {
    headline: 'OpenAI ships a cheaper model tier',
    time: '2h ago',
    tldr: 'Priced at a third of the previous tier with the same context window. Existing keys work unchanged, and the older tier stays available until March.',
  },
  { headline: 'React 20 drops the legacy render path', time: '4h ago' },
  { headline: 'Postgres 19 lands async I/O by default', time: '6h ago' },
  { headline: 'Cloudflare open-sources its edge router', time: '9h ago' },
];

const HappeningScreen = ({ device }: { device: DeviceName }) => (
  <Device name={device}>
    <div className="flex flex-col">
      <header className="flex items-center gap-3 px-4 py-4">
        {/* feed-highlights-title-gradient in production. */}
        <h1
          className={`flex-1 bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default bg-clip-text font-bold text-transparent ${
            device === 'Mobile' ? 'typo-title2' : 'typo-large-title'
          }`}
        >
          Happening Now
        </h1>
        <Control action="Snapshot" />
      </header>

      <div className="no-scrollbar flex gap-4 overflow-x-auto border-b border-border-subtlest-tertiary px-4">
        {TABS.map((tab, index) => (
          <span
            key={tab}
            className={`whitespace-nowrap border-b-2 pb-2 typo-callout ${
              index === 0
                ? 'border-text-primary font-bold text-text-primary'
                : 'border-transparent text-text-tertiary'
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      {HIGHLIGHTS.map((item, index) => {
        const open = index === 0;

        return (
          <article key={item.headline}>
            <div className="flex w-full items-center gap-2 px-4 py-3 text-left">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-bold text-text-primary typo-body">
                  {item.headline}
                </span>
                <span className="mt-0.5 text-text-quaternary typo-footnote">
                  {item.time}
                </span>
              </div>
              <ArrowIcon
                className={`shrink-0 text-text-tertiary ${
                  open ? 'rotate-180' : 'rotate-90'
                }`}
                size={IconSize.Small}
              />
            </div>

            {open && item.tldr && (
              <div className="flex flex-col gap-3 px-4 pb-3">
                <p className="text-text-secondary typo-footnote">{item.tldr}</p>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-text-link typo-footnote">
                    Read more
                  </span>
                  <Control
                    action="Snapshot"
                    label
                    variant={ButtonVariant.Secondary}
                  />
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  </Device>
);

const AllDevices = () => (
  <Rail>
    <HappeningScreen device="Desktop" />
    <HappeningScreen device="Tablet" />
    <HappeningScreen device="Mobile" />
  </Rail>
);

const HappeningNow = () => (
  <SurfacePage
    intro="A gradient title, a tab strip, and a list of collapsed headlines that expand in place. The page has the shortest shelf life in the product, which is exactly why the image matters: a link sends someone to a page that has already moved on."
    map="Sharing map: lead with Snapshot (#6355). Each highlight is a self-contained claim with sources behind it, and news travels through chat apps where an image renders inline and a link collapses to a grey card."
    title="Happening now"
  >
    <Category
      covers="HighlightsPage.tsx · HighlightItem.tsx"
      title="What actually ships today"
      verdict="Corrected: a highlight is a collapsed row — headline, relative time, chevron — that expands to a TLDR with a Read more link. There is no live pill, no source count on the row, and no share control until it is expanded."
    >
      <Variant
        headline="Expanded: Read more, then snapshot"
        note="Built and live. Expansion is the intent signal and the TLDR is the payload, so the control appears exactly where the content it captures does."
        step="Shipping · the expanded row"
      >
        <AllDevices />
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

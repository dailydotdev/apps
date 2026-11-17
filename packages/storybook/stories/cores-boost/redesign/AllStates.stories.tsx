import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Frame } from '../../startups-onboarding/frame';

// Every case of "Wallet and buy Cores" (the "3. States" stories) in real
// iframes at each device width, in the toolbar's theme. Frames load one at a
// time as they near the screen; "Open full size" opens a case on its own.

type Theme = 'dark' | 'light';

const devices = [
  { key: 'phone', label: 'Phone · 375', width: 375, height: 812, shown: 220 },
  { key: 'tablet', label: 'Tablet · 768', width: 768, height: 1024, shown: 320 },
  { key: 'laptop', label: 'Laptop · 1280', width: 1280, height: 800, shown: 440 },
  {
    key: 'laptopL',
    label: 'Laptop L · 1440',
    width: 1440,
    height: 900,
    shown: 480,
  },
  {
    key: 'desktop',
    label: 'Desktop · 1920',
    width: 1920,
    height: 1080,
    shown: 540,
  },
] as const;

type DeviceKey = (typeof devices)[number]['key'];

interface Case {
  story: string;
  title: string;
  note: string;
}

const groups: { title: string; cases: Case[] }[] = [
  {
    title: 'Your first Cores',
    cases: [
      {
        story: 'first-cores-reader',
        title: 'Reader',
        note: 'After claiming the first quest: Award leads the uses.',
      },
      {
        story: 'first-cores-poster',
        title: 'Poster',
        note: 'Someone who has posted: Boost leads the uses.',
      },
    ],
  },
  {
    title: 'Wallet',
    cases: [
      {
        story: 'wallet-default',
        title: 'Wallet',
        note: 'A balance, a pending purchase and history; Startups and Plus deals over Buy Cores.',
      },
      {
        story: 'wallet-loading',
        title: 'Loading',
        note: 'Totals and history still on their way.',
      },
      {
        story: 'wallet-empty',
        title: 'No Cores yet',
        note: 'Balance 0 and no transactions.',
      },
      {
        story: 'wallet-first-cores',
        title: 'First Cores only',
        note: 'The quest reward is the only row.',
      },
      {
        story: 'wallet-pending-long',
        title: 'Pending 10+ minutes',
        note: 'A purchase still processing after ten minutes.',
      },
      {
        story: 'wallet-after-purchase',
        title: 'After a purchase',
        note: 'The purchase landed: +300 on Purchased.',
      },
      {
        story: 'wallet-streak-broke',
        title: 'Streak broke yesterday',
        note: 'The streak tile offers the restore instead of freezes.',
      },
      {
        story: 'wallet-plus',
        title: 'Plus member',
        note: 'No Plus deal; Startups stays.',
      },
    ],
  },
  {
    title: 'Boost deal',
    cases: [
      {
        story: 'deal-picker-short',
        title: 'Not enough Cores',
        note: 'Pick a post; the footer buys the Cores that are missing.',
      },
      {
        story: 'deal-picker-enough',
        title: 'Enough Cores',
        note: 'Pick a post and boost at the deal price.',
      },
    ],
  },
  {
    title: 'Buy Cores',
    cases: [
      {
        story: 'buy-from-wallet',
        title: 'From the wallet',
        note: 'Nothing to cover, so no pack is preselected.',
      },
      {
        story: 'buy-for-boost',
        title: 'For the boost deal',
        note: 'Says what is missing and preselects the pack that covers it.',
      },
      {
        story: 'buy-for-award',
        title: 'For an award',
        note: 'No Startups deal when the Cores are for an award.',
      },
      {
        story: 'buy-plus',
        title: 'Plus member',
        note: 'No Plus deal.',
      },
      {
        story: 'buy-checkout',
        title: 'Checkout',
        note: 'After picking a pack: the checkout replaces the art.',
      },
      {
        story: 'purchased',
        title: 'You got your Cores!',
        note: 'The purchase landed, over the wallet.',
      },
    ],
  },
  {
    title: '/cores',
    cases: [
      {
        story: 'cores-default',
        title: '/cores',
        note: 'Deals over the packages, the art beside them.',
      },
      {
        story: 'cores-plus',
        title: 'Plus member',
        note: 'No Plus deal.',
      },
    ],
  },
];

const storyId = (story: string): string =>
  `cores-boost-redesign-3-states--${story}`;

const DeviceFrame = ({
  item,
  device,
  theme,
}: {
  item: Case;
  device: (typeof devices)[number];
  theme: Theme;
}): ReactElement => (
  <div className="flex flex-col gap-2" style={{ width: device.shown }}>
    <span className="text-text-tertiary typo-footnote">{device.label}</span>
    <Frame
      storyId={storyId(item.story)}
      title={`${item.title}, ${device.label}`}
      width={device.width}
      height={device.height}
      theme={theme}
    />
    <a
      href={`/?path=/story/${storyId(item.story)}&globals=theme:${theme}`}
      target="_blank"
      rel="noreferrer"
      className="text-text-link typo-caption1"
    >
      Open full size
    </a>
  </div>
);

const AllStates = ({ theme }: { theme: Theme }): ReactElement => {
  const [shown, setShown] = useState<DeviceKey | 'all'>('all');
  const shownDevices = devices.filter(
    ({ key }) => shown === 'all' || key === shown,
  );

  return (
    <div className="flex min-h-screen flex-col gap-12 bg-background-default p-6">
      <header className="flex flex-col gap-3">
        <h1 className="font-bold typo-title1">Wallet and buy Cores · All states</h1>
        <div className="flex flex-wrap gap-2">
          {[{ key: 'all' as const, label: 'All widths' }, ...devices].map(
            ({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={shown === key}
                onClick={() => setShown(key)}
                className={classNames(
                  'rounded-10 border px-3 py-1.5 typo-footnote',
                  shown === key
                    ? 'border-text-primary bg-surface-float font-bold'
                    : 'border-border-subtlest-tertiary text-text-tertiary',
                )}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </header>
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-8">
          <h2 className="border-b border-border-subtlest-tertiary pb-2 font-bold typo-title2">
            {group.title}
          </h2>
          {group.cases.map((item) => (
            <figure key={item.story} className="flex flex-col gap-3">
              <figcaption className="flex flex-col gap-1">
                <span className="font-bold typo-callout">{item.title}</span>
                <span className="text-text-tertiary typo-footnote">
                  {item.note}
                </span>
              </figcaption>
              <div className="flex flex-wrap items-start gap-6">
                {shownDevices.map((device) => (
                  <DeviceFrame
                    key={device.key}
                    item={item}
                    device={device}
                    theme={theme}
                  />
                ))}
              </div>
            </figure>
          ))}
        </section>
      ))}
    </div>
  );
};

const meta: Meta = {
  title: 'Cores & Boost/Redesign/2. All states',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Catalog: StoryObj = {
  name: 'All states',
  render: (_, { globals }) => (
    <AllStates theme={globals.theme === 'light' ? 'light' : 'dark'} />
  ),
};

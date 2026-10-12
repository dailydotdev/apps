import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { variants } from './scrollStopperVariants';
import { Providers } from './providers';

// Ten takes on the in-feed Plus scroll stopper, stacked at feed width with
// the lever each one pulls. Reload a story to replay its motion.

const styles = `
@keyframes ss-caret { 50% { opacity: 0; } }
.ss-caret { animation: ss-caret 1s steps(1) infinite; }
.ss-strike { position: relative; }
.ss-strike::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  height: 1px;
  width: 100%;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 360ms cubic-bezier(0.16, 1, 0.3, 1);
}
.ss-strike-on::after { transform: scaleX(1); }
@media (prefers-reduced-motion: reduce) {
  .ss-caret { animation: none; }
  .ss-strike::after { transition: none; }
}
`;

const Page = (): ReactElement => (
  <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-10 px-4 py-6">
    <style>{styles}</style>
    <header className="flex flex-col gap-1">
      <h1 className="font-bold text-text-primary typo-large-title">
        Plus scroll stopper, ten ways
      </h1>
      <p className="text-text-secondary typo-callout">
        Same slot, same once-a-day cadence, same Get Plus button. What changes
        is the lever: a demo, the reader’s own numbers, a price, a joke at the
        ad’s expense, or just restraint. Sample numbers stand in for what the
        loaded feed would report.
      </p>
    </header>
    {variants.map(({ name, lever, why, Component }, index) => (
      <section key={name} className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-text-quaternary tabular-nums typo-footnote">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h2 className="font-bold text-text-primary typo-title3">{name}</h2>
          <span className="rounded-4 bg-surface-float px-1.5 text-text-tertiary typo-caption1">
            {lever}
          </span>
        </div>
        <Component />
        <p className="max-w-[48rem] text-text-tertiary typo-footnote">{why}</p>
      </section>
    ))}
  </div>
);

const meta: Meta = {
  title: 'Features/Plus scroll stopper',
  id: 'plus-scroll-stopper',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Providers>
        <style>{styles}</style>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const AllVariations: Story = {
  name: 'All variations',
  render: () => <Page />,
};

const single = (index: number): Story => ({
  name: `${String(index + 1).padStart(2, '0')} ${variants[index].name}`,
  render: () => {
    const { Component } = variants[index];
    return (
      <div className="mx-auto w-full max-w-[64rem] px-4 py-6">
        <Component />
      </div>
    );
  },
});

export const Shipped = single(0);
export const Flip = single(1);
export const Receipt = single(2);
export const Stopwatch = single(3);
export const LastAd = single(4);
export const Terminal = single(5);
export const Quiet = single(6);
export const CleanTitle = single(7);
export const Strip = single(8);
export const Price = single(9);
export const Depth = single(10);

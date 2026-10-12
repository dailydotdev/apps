import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusShowcaseStrip, STRIP_STYLES } from './plusShowcaseStrip';
import { Providers } from './providers';

// The Plus scroll stopper as a branded showcase, shown in the feed slot it
// replaces: a row of cards above, a row below.

const cardLines = [
  ['w-10/12', 'w-7/12'],
  ['w-11/12', 'w-5/12'],
  ['w-9/12', 'w-8/12'],
  ['w-10/12', 'w-6/12'],
];

const MockCard = ({ lines }: { lines: string[] }): ReactElement => (
  <div
    aria-hidden
    className="flex h-64 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4"
  >
    <span className="size-8 rounded-10 bg-surface-float" />
    <div className="flex flex-col gap-2">
      {lines.map((width) => (
        <span
          key={width}
          className={`h-3 rounded-4 bg-surface-float ${width}`}
        />
      ))}
    </div>
    <span className="mt-auto h-24 rounded-12 bg-surface-float" />
  </div>
);

const MockRow = (): ReactElement => (
  <div className="grid grid-cols-2 gap-4 laptop:grid-cols-4">
    {cardLines.map((lines) => (
      <MockCard key={lines.join()} lines={lines} />
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
        <style>{STRIP_STYLES}</style>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const InTheFeed: Story = {
  name: 'In the feed',
  render: () => (
    <div className="mx-auto flex w-full max-w-[68rem] flex-col gap-4 px-4 py-6">
      <MockRow />
      <PlusShowcaseStrip />
      <MockRow />
    </div>
  ),
};

export const StripOnly: Story = {
  name: 'Strip only',
  render: () => (
    <div className="mx-auto w-full max-w-[68rem] px-4 py-6">
      <PlusShowcaseStrip />
    </div>
  ),
};

export const Paused: Story = {
  name: 'Strip, no autoplay',
  render: () => (
    <div className="mx-auto w-full max-w-[68rem] px-4 py-6">
      <PlusShowcaseStrip autoplay={false} initialFeature="clean-titles" />
    </div>
  ),
};

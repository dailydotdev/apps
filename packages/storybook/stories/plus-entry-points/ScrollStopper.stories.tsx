import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusShowcaseStrip, STRIP_STYLES } from './plusShowcaseStrip';
import ExtensionProviders from '../extension/_providers';

// The Plus scroll stopper as a branded showcase, shown in the feed slot it
// replaces. Real cards need the production boot providers. The feed runs 1 to 6 columns across the app's breakpoints and the
// strip lays itself out by its own width (container queries), so the matrix
// story renders every width it will meet side by side.

const cardLines = [
  ['w-10/12', 'w-7/12'],
  ['w-11/12', 'w-5/12'],
  ['w-9/12', 'w-8/12'],
  ['w-10/12', 'w-6/12'],
  ['w-8/12', 'w-7/12'],
  ['w-11/12', 'w-6/12'],
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

// Matches the feed: 1 column on phones, 2 from tablet, 3 from laptop,
// 4 from laptopL, 5 from laptopXL, 6 on desktop.
const feedGrid =
  'grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3 laptopL:grid-cols-4 laptopXL:grid-cols-5 desktop:grid-cols-6';

const MockRow = (): ReactElement => (
  <div className={feedGrid}>
    {cardLines.map((lines) => (
      <div
        key={lines.join()}
        className={
          lines === cardLines[4]
            ? 'hidden laptopXL:block'
            : lines === cardLines[5]
            ? 'hidden desktop:block'
            : lines === cardLines[3]
            ? 'hidden laptopL:block'
            : lines === cardLines[2]
            ? 'hidden laptop:block'
            : lines === cardLines[1]
            ? 'hidden tablet:block'
            : ''
        }
      >
        <MockCard lines={lines} />
      </div>
    ))}
  </div>
);

const widths = [320, 375, 430, 560, 656, 768, 900, 1020, 1180, 1360, 1600];

const meta: Meta = {
  title: 'Features/Plus scroll stopper',
  id: 'plus-scroll-stopper',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <style>{STRIP_STYLES}</style>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const InTheFeed: Story = {
  name: 'In the feed',
  render: () => (
    <div className="mx-auto flex w-full flex-col gap-4 px-4 py-6">
      <MockRow />
      <PlusShowcaseStrip />
      <MockRow />
    </div>
  ),
};

export const StripOnly: Story = {
  name: 'Strip only',
  render: () => (
    <div className="mx-auto w-full px-4 py-6">
      <PlusShowcaseStrip />
    </div>
  ),
};

export const Paused: Story = {
  name: 'Strip, no autoplay',
  render: () => (
    <div className="mx-auto w-full px-4 py-6">
      <PlusShowcaseStrip autoplay={false} initialFeature="clean-titles" />
    </div>
  ),
};

export const Matrix: Story = {
  name: 'Every width',
  render: () => (
    <div className="flex flex-col gap-8 px-4 py-6">
      {widths.map((width) => (
        <div key={width} className="flex flex-col gap-2">
          <span className="text-text-quaternary tabular-nums typo-footnote">
            {width}px
          </span>
          <div style={{ width, maxWidth: '100%' }}>
            <PlusShowcaseStrip autoplay={false} />
          </div>
        </div>
      ))}
    </div>
  ),
};

import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Frame } from '../../startups-onboarding/frame';

// Today, 100% production, next to the redesign, screen by screen: both are
// the live stories, dark mode, 1440×900, scaled into their column. Frames load
// one at a time as they near the screen; "Open full size" opens one alone.

type Pair = {
  name: string;
  /** Id of the production story */
  today: string;
  /** Id of the redesign story */
  redesign: string;
};

const today = (story: string): string =>
  `cores-boost-today-production--${story}`;
const flow = (story: string): string =>
  `cores-boost-redesign-1-wallet-and-buy-cores--${story}`;
const state = (story: string): string =>
  `cores-boost-redesign-3-states--${story}`;

const Column = ({ label, id }: { label: string; id: string }): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col gap-2">
    <span className="font-bold text-text-tertiary typo-caption1">{label}</span>
    <Frame storyId={id} title={`${label}: ${id}`} width={1440} height={900} />
    <a
      href={`/?path=/story/${id}`}
      target="_top"
      className="text-text-link typo-caption1"
    >
      Open full size
    </a>
  </div>
);

const ComparePage = ({ pairs }: { pairs: Pair[] }): ReactElement => (
  <div className="flex min-h-screen flex-col gap-10 bg-background-default p-6">
    {pairs.map((pair) => (
      <section key={pair.name} className="flex flex-col gap-3">
        <h2 className="font-bold typo-title3">{pair.name}</h2>
        <div className="flex flex-col gap-4 laptop:flex-row">
          <Column label="Today · production" id={pair.today} />
          <Column label="Redesign" id={pair.redesign} />
        </div>
      </section>
    ))}
  </div>
);

const meta: Meta = {
  title: 'Cores & Boost/Redesign/0. Today vs redesign',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const WalletAndBuyCores: Story = {
  name: '1. Wallet and buy Cores',
  render: () => (
    <ComparePage
      pairs={[
        {
          name: '1 · Your first Cores',
          today: today('first-cores-after-claim'),
          redesign: flow('your-first-cores'),
        },
        {
          name: '2 · Wallet',
          today: today('wallet'),
          redesign: flow('wallet-screen'),
        },
        {
          // Production's wallet sends Buy Cores to /cores
          name: '3 · Wallet · Buy Cores',
          today: today('cores'),
          redesign: flow('buy-cores-popup'),
        },
        {
          name: '4 · /cores',
          today: today('cores'),
          redesign: flow('cores'),
        },
        {
          name: 'You got your Cores!',
          today: today('cores-purchased'),
          redesign: state('purchased'),
        },
      ]}
    />
  ),
};

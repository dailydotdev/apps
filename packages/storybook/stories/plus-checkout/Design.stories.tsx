import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PrototypeArgs } from './checkout/Prototype';
import { Prototype } from './checkout/Prototype';

/* The kept design (Tsahi, 12 Oct): split screen on the primary background,
   two radio buttons for the cycle, all ten features in two columns, the bill
   as a timeline, Paddle's frame on the right with a white button.
   This story is the page itself — resize the window to see every breakpoint. */

const meta: Meta<PrototypeArgs> = {
  title: 'Plus Checkout/1. The design',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  args: {
    cycle: 'annual',
    purchase: 'personal',
    viewer: 'member',
    entry: 'default',
    platform: 'web',
    phase: 'ready',
    method: 'card',
    sale: false,
    seats: 3,
    browser: 'chrome',
    decline: false,
    country: 'DE',
    featureList: 'plays',
    pricesLoading: false,
    giftedPlus: false,
    mobileStep: 'plan',
    express: false,
  },
  argTypes: {
    cycle: { control: 'inline-radio', options: ['annual', 'monthly'] },
    purchase: { control: 'inline-radio', options: ['personal', 'team', 'gift'] },
    viewer: { control: 'inline-radio', options: ['member', 'anonymous', 'plus', 'unavailable'] },
    entry: { control: 'select', options: ['default', 'ads', 'brief', 'custom-feed', 'clickbait', 'bookmarks'], description: '?ref= — which three features lead' },
    platform: { control: 'inline-radio', options: ['web', 'ios'] },
    phase: { control: 'inline-radio', options: ['loading', 'ready', 'processing', 'authenticating', 'declined', 'blocked', 'success'] },
    featureList: { control: 'inline-radio', options: ['plays', 'static'], description: 'plays = hover/auto scenes (15 Oct, default); static = the 12 Oct checklist' },
    pricesLoading: { description: 'Prices not loaded yet (isPricesPending)' },
    giftedPlus: { description: 'With viewer = plus: Plus came as a gift (no Manage subscription)' },
    mobileStep: { control: 'inline-radio', options: ['plan', 'payment'], description: 'Phones/tablets (< 1020px): step 1 (plan) or step 2 (payment). Desktop shows both.' },
    method: { control: 'inline-radio', options: ['card', 'paypal', 'apple'] },
    browser: { control: 'inline-radio', options: ['chrome', 'safari', 'other'], description: 'Which wallet tile Paddle shows' },
    seats: { control: { type: 'number', min: 1, max: 50 } },
    decline: { description: 'The first Subscribe fails (card declined), the retry succeeds' },
    country: { control: 'select', options: ['DE', 'FR', 'GB', 'US-NY', 'US-CA', 'US', 'IL', 'IN', 'BR'], description: 'geo.region. Paddle’s renewal reminder row shows for annual in the EU, UK and 11 US states only' },
    express: { description: 'Open decision: Paddle express variant (wallets first)' },
    giftTo: { table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<PrototypeArgs>;

export const Page: Story = {
  name: 'Interactive prototype',
  render: (args) => (
    <Prototype
      {...args}
      giftTo={args.purchase === 'gift' ? { name: 'Alex Rivera', username: 'alexr' } : undefined}
    />
  ),
};

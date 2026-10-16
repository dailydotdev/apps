import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusCheckoutV2 } from '@dailydotdev/shared/src/components/plus/checkout/PlusCheckoutV2';
import { PlusSuccessV2 } from '@dailydotdev/shared/src/components/plus/checkout/PlusSuccessV2';
import { Providers } from './mocks';

/* The production components (packages/shared/src/components/plus/checkout)
   with mocked prices and auth — what the flag renders on /plus. No Paddle
   here, so the payment form area stays empty and turns into the
   "didn't load" message after 10s, as it would with a blocker. */

const meta: Meta = {
  title: 'Plus Checkout/10. Built (production component)',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

export const Checkout: Story = {
  name: 'Checkout · signed in',
  render: () => (
    <Providers>
      <PlusCheckoutV2 />
    </Providers>
  ),
};

export const Team: Story = {
  name: 'Checkout · team',
  render: () => (
    <Providers isOrganization>
      <PlusCheckoutV2 />
    </Providers>
  ),
};

export const AlreadyPlus: Story = {
  name: 'Checkout · already Plus',
  render: () => (
    <Providers isPlus>
      <PlusCheckoutV2 />
    </Providers>
  ),
};

export const Unavailable: Story = {
  name: 'Checkout · region unavailable',
  render: () => (
    <Providers isPlusAvailable={false}>
      <PlusCheckoutV2 />
    </Providers>
  ),
};

export const Success: Story = {
  name: 'Success',
  render: () => (
    <Providers>
      <PlusSuccessV2 />
    </Providers>
  ),
};

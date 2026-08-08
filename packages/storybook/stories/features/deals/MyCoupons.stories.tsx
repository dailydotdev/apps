import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MyCouponsWallet } from '@dailydotdev/shared/src/features/deals/components/MyCouponsWallet';
import { mockClaims, mockDeals, MOCK_NOW_MS, withDeals } from './deals.mocks';

const meta: Meta<typeof MyCouponsWallet> = {
  title: 'Features/Deals/My coupons',
  component: MyCouponsWallet,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [withDeals()],
};

export default meta;

type Story = StoryObj<typeof MyCouponsWallet>;

const noop = (): void => undefined;

export const Wallet: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-2xl">
      <MyCouponsWallet
        claims={mockClaims}
        deals={mockDeals}
        now={MOCK_NOW_MS}
        onBrowse={noop}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-2xl">
      <MyCouponsWallet
        claims={[]}
        deals={mockDeals}
        now={MOCK_NOW_MS}
        onBrowse={noop}
      />
    </div>
  ),
};

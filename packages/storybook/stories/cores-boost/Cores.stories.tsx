import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import { BuyCoresModal } from '@dailydotdev/shared/src/components/modals/award/BuyCoresModal';
import GiveAwardModal from '@dailydotdev/shared/src/components/modals/award/GiveAwardModal';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { userEvent, within } from 'storybook/test';
import Wallet from '../../../webapp/pages/wallet';
import { CoresProviders, coresHandlers, noop } from './mocks';

const modal = { isOpen: true, onRequestClose: noop, ariaHideApp: false };

const meta: Meta = {
  title: 'Cores and Boost/Cores',
  parameters: { layout: 'fullscreen', msw: { handlers: coresHandlers() } },
};

export default meta;

type Story = StoryObj;

const awardEntity = {
  id: 'nimrod',
  receiver: {
    id: 'nimrod',
    name: 'Nimrod Kramer',
    username: 'nimrod',
    image: 'https://media.daily.dev/sb/avatar-nimrod',
  },
};

/** Opened from a boost that is 32.6K Cores short. */
export const BuyCoresNeeded: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <BuyCoresModal
        {...modal}
        origin={Origin.BoostPost}
        minCoresToBuy={32600}
      />
    </CoresProviders>
  ),
};

/** Opened from the wallet, with nothing to cover. */
export const BuyCores: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <BuyCoresModal {...modal} origin={Origin.WalletPageCTA} />
    </CoresProviders>
  ),
};

export const GiveAward: Story = {
  render: (): ReactElement => (
    <CoresProviders balance={400}>
      <GiveAwardModal {...modal} type="USER" entity={awardEntity} />
    </CoresProviders>
  ),
};

/** Picked an Award that costs more than the balance. */
export const GiveAwardNotEnough: Story = {
  ...GiveAward,
  play: async () => {
    const awards = await within(document.body).findAllByRole('button', {
      pressed: false,
    });
    await userEvent.click(awards[awards.length - 1]);
  },
};

export const WalletPage: Story = {
  beforeEach: () => {
    (
      useRouter as unknown as { mockReturnValue: (value: unknown) => void }
    ).mockReturnValue({
      isReady: true,
      pathname: '/wallet',
      query: {},
      push: noop,
      replace: noop,
      events: { on: noop, off: noop },
    });
  },
  render: (): ReactElement => (
    <CoresProviders>
      <Wallet />
    </CoresProviders>
  ),
};

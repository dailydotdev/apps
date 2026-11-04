import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { BoostPostModal } from '@dailydotdev/shared/src/features/boost/BoostPostModal';
import { BoostSquadModal } from '@dailydotdev/shared/src/features/boost/BoostSquadModal';
import { AdsDashboardModal } from '@dailydotdev/shared/src/features/boost/AdsDashboardModal';
import { BoostedViewModal } from '@dailydotdev/shared/src/features/boost/BoostedViewModal';
import {
  activeCampaign,
  CoresProviders,
  coresHandlers,
  noop,
  post,
  squad,
  squadCampaign,
} from './mocks';

const modal = { isOpen: true, onRequestClose: noop, ariaHideApp: false };

const meta: Meta = {
  title: 'Cores and Boost/Boost',
  parameters: { layout: 'fullscreen', msw: { handlers: coresHandlers() } },
};

export default meta;

type Story = StoryObj;

/** A paid seat of a Startups squad: the squad wallet pays by default. */
export const BoostPostSquadWallet: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <BoostPostModal {...modal} post={post} />
    </CoresProviders>
  ),
};

/** The squad wallet can't cover the boost. */
export const BoostPostSquadWalletShort: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <BoostPostModal {...modal} post={post} />
    </CoresProviders>
  ),
  parameters: { msw: { handlers: coresHandlers({ squadBalance: 12000 }) } },
};

/** No squad wallet and not enough Cores: the button buys the rest. */
export const BoostPostNotEnoughCores: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <BoostPostModal {...modal} post={post} />
    </CoresProviders>
  ),
  parameters: { msw: { handlers: coresHandlers({ squadBalance: null }) } },
};

export const BoostPostEnoughCores: Story = {
  render: (): ReactElement => (
    <CoresProviders balance={52000}>
      <BoostPostModal {...modal} post={post} />
    </CoresProviders>
  ),
  parameters: { msw: { handlers: coresHandlers({ squadBalance: null }) } },
};

export const BoostSquad: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <BoostSquadModal {...modal} squad={squad} />
    </CoresProviders>
  ),
};

export const Boosts: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <AdsDashboardModal {...modal} />
    </CoresProviders>
  ),
};

export const BoostsEmpty: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <AdsDashboardModal {...modal} />
    </CoresProviders>
  ),
  parameters: { msw: { handlers: coresHandlers({ campaignList: [] }) } },
};

export const ActivePostBoost: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <BoostedViewModal {...modal} campaign={activeCampaign} onBack={noop} />
    </CoresProviders>
  ),
};

export const CompletedSquadBoost: Story = {
  render: (): ReactElement => (
    <CoresProviders>
      <BoostedViewModal {...modal} campaign={squadCampaign} onBack={noop} />
    </CoresProviders>
  ),
};

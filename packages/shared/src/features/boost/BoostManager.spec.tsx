import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import post from '../../../__tests__/fixture/post';
import type { Campaign } from '../../graphql/campaigns';
import {
  CAMPAIGNS_LIST,
  CampaignState,
  CampaignType,
  USER_CAMPAIGN_STATS,
} from '../../graphql/campaigns';
import * as lazyModal from '../../hooks/useLazyModal';
import { LazyModal } from '../../components/modals/common/types';
import { Origin } from '../../lib/log';
import { BoostManager } from './BoostManager';

const openModal = jest.fn();

const createCampaign = (props: Partial<Campaign>): Campaign => ({
  id: 'c1',
  referenceId: post.id,
  state: CampaignState.Completed,
  type: CampaignType.Post,
  createdAt: new Date('2026-10-01'),
  endedAt: new Date('2026-10-08'),
  flags: { budget: 14000, spend: 14000, impressions: 1000, clicks: 30 },
  post,
  user: loggedUser,
  ...props,
});

const renderManager = (campaigns: Campaign[]) => {
  mockGraphQL({
    request: { query: USER_CAMPAIGN_STATS },
    result: {
      data: {
        userCampaignStats: { impressions: 0, clicks: 0, users: 0, spend: 0 },
      },
    },
  });
  mockGraphQL({
    request: { query: CAMPAIGNS_LIST, variables: { first: 20, after: '' } },
    result: {
      data: {
        campaignsList: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: campaigns.map((node) => ({ cursor: node.id, node })),
        },
      },
    },
  });

  render(
    <TestBootProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
      auth={{ user: loggedUser }}
    >
      <BoostManager />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
  openModal.mockReset();
  jest.spyOn(lazyModal, 'useLazyModal').mockReturnValue({
    openModal,
    closeModal: jest.fn(),
    modal: undefined,
  } as unknown as ReturnType<typeof lazyModal.useLazyModal>);
});

it('should boost a completed post again with its daily budget and days', async () => {
  renderManager([createCampaign({})]);

  fireEvent.click(await screen.findByRole('button', { name: 'Boost again' }));

  expect(openModal).toHaveBeenCalledWith({
    type: LazyModal.BoostPost,
    props: {
      post,
      origin: Origin.AdsDashboard,
      lastBoost: { coresPerDay: 2000, totalDays: 7 },
    },
  });
});

it('should not prefill a stopped boost, whose days ended early', async () => {
  renderManager([createCampaign({ state: CampaignState.Cancelled })]);

  fireEvent.click(await screen.findByRole('button', { name: 'Boost again' }));

  expect(openModal).toHaveBeenCalledWith({
    type: LazyModal.BoostPost,
    props: { post, origin: Origin.AdsDashboard, lastBoost: undefined },
  });
});

it('should not offer to stop a bundle boost, which its package manages', async () => {
  renderManager([
    createCampaign({
      id: 'c1',
      state: CampaignState.Active,
      endedAt: new Date(Date.now() + 86400000),
    }),
    createCampaign({
      id: 'c2',
      state: CampaignState.Active,
      endedAt: new Date(Date.now() + 86400000),
      flags: { budget: 10000, spend: 0, origin: 'bundle' },
    }),
  ]);

  await screen.findByText('Live (2)');

  expect(screen.getAllByText('Stop')).toHaveLength(1);
});

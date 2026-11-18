import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { useRouter } from 'next/router';
import { useCampaignByIdModal } from './useCampaignByIdModal';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import post from '../../../__tests__/fixture/post';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import type { Campaign } from '../../graphql/campaigns';
import {
  CAMPAIGN_BY_ID,
  CampaignState,
  CampaignType,
  DAILY_CAMPAIGN_REACH_ESTIMATE,
} from '../../graphql/campaigns';
import { boostManagerUrl } from '../../lib/constants';
import { MODAL_KEY } from '../useLazyModal';

const replace = jest.fn();
const push = jest.fn();

const CampaignByIdModal = (): null => {
  useCampaignByIdModal();
  return null;
};

const createCampaign = (props: Partial<Campaign>): Campaign => ({
  id: 'c1',
  referenceId: 'r1',
  state: CampaignState.Completed,
  type: CampaignType.Post,
  createdAt: new Date('2026-10-01'),
  endedAt: new Date('2026-10-08'),
  flags: { budget: 5000, spend: 5000, users: 100, impressions: 1000 },
  user: loggedUser,
  ...props,
});

const mockCampaign = (campaign: Campaign) =>
  mockGraphQL({
    request: { query: CAMPAIGN_BY_ID, variables: { id: campaign.id } },
    result: { data: { campaignById: campaign } },
  });

const renderComponent = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // _app closes the open modal on every route change
  replace.mockImplementation(async () => {
    client.setQueryData(MODAL_KEY, null);
    return true;
  });

  return render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <CampaignByIdModal />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    query: { c_id: 'c1' },
    pathname: '/notifications',
    replace,
    push,
  });
});

it('should open the boost form with the last budget for an ended post', async () => {
  mockCampaign(createCampaign({ type: CampaignType.Post, post }));
  mockGraphQL({
    request: {
      query: DAILY_CAMPAIGN_REACH_ESTIMATE,
      variables: {
        type: CampaignType.Post,
        value: post.id,
        budget: 714,
      },
    },
    result: { data: { dailyCampaignReachEstimate: { min: 100, max: 200 } } },
  });
  renderComponent();

  expect(await screen.findByText('Boost your post')).toBeInTheDocument();
  expect(
    screen.getByText('Last boost: 4,998 Cores over 7 days'),
  ).toBeInTheDocument();
  expect(replace).toHaveBeenCalledWith('/notifications');
});

it('should open the squad boost modal for an ended squad boost', async () => {
  mockCampaign(
    createCampaign({ type: CampaignType.Squad, source: generateTestSquad() }),
  );
  renderComponent();

  expect(await screen.findByText('Boost your Squad')).toBeInTheDocument();
  expect(replace).toHaveBeenCalledWith('/notifications');
});

it('should open Boost manager for a live boost', async () => {
  mockCampaign(
    createCampaign({
      type: CampaignType.Post,
      post,
      state: CampaignState.Active,
    }),
  );
  renderComponent();

  await waitFor(() => expect(push).toHaveBeenCalledWith(boostManagerUrl));
});

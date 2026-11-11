import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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
import { boostSettingsFeature } from '../../lib/featureManagement';
import { MODAL_KEY } from '../useLazyModal';

const replace = jest.fn();

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
    push: jest.fn(),
  });
});

it('should open the post boost modal when boosting an ended post again', async () => {
  mockCampaign(createCampaign({ type: CampaignType.Post, post }));
  mockGraphQL({
    request: {
      query: DAILY_CAMPAIGN_REACH_ESTIMATE,
      variables: {
        type: CampaignType.Post,
        value: post.id,
        budget: boostSettingsFeature.defaultValue.default_cores,
      },
    },
    result: { data: { dailyCampaignReachEstimate: { min: 100, max: 200 } } },
  });
  renderComponent();

  fireEvent.click(await screen.findByRole('button', { name: 'Boost again' }));

  expect(await screen.findByText('Boost your post')).toBeInTheDocument();
  expect(replace).toHaveBeenCalledWith('/notifications');
});

it('should open the squad boost modal when boosting an ended squad again', async () => {
  mockCampaign(
    createCampaign({ type: CampaignType.Squad, source: generateTestSquad() }),
  );
  renderComponent();

  fireEvent.click(await screen.findByRole('button', { name: 'Boost again' }));

  expect(await screen.findByText('Boost your Squad')).toBeInTheDocument();
  expect(replace).toHaveBeenCalledWith('/notifications');
});

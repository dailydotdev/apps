import type { ReactElement } from 'react';
import React from 'react';
import nock from 'nock';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { getFeedSettingsQueryKey } from '../../../../hooks/useFeedSettings';
import { generateQueryKey } from '../../../../lib/query';
import { SharedFeedPage } from '../../../utilities/common';
import type {
  FeedControls,
  FeedProfile,
} from '../../../../features/feedExplain/types';
import {
  FeedAuthorMode,
  FeedTopicMode,
} from '../../../../features/feedExplain/types';
import {
  feedControlsQueryKey,
  feedProfileQueryKey,
} from '../../../../features/feedExplain/queries';
import {
  FEED_CONTROLS_QUERY,
  RESET_FEED_PERSONALIZATION_MUTATION,
  SET_FEED_LEARNING_MUTATION,
  SET_FEED_TOPIC_MODE_MUTATION,
} from '../../../../features/feedExplain/graphql';
import { FeedSettingsOverviewSection } from './FeedSettingsOverviewSection';

const controls: FeedControls = {
  topics: [],
  sources: [],
  authors: [],
  learning: true,
  fillIns: true,
  ranking: [],
};
const profile: FeedProfile = {
  cohort: true,
  learning: true,
  interests: [],
  muted: [],
  blocked: [],
  ranking: [],
};
const fetchForYou = jest.fn(async () => ({ pages: [] }));

// A For You feed on screen while the settings change.
const ForYouFeed = (): ReactElement | null => {
  useQuery({
    queryKey: generateQueryKey(SharedFeedPage.MyFeed, defaultUser, 'v2'),
    queryFn: fetchForYou,
    staleTime: Infinity,
  });
  return null;
};

const renderOverview = ({
  version = 116,
  feedControls = controls,
}: { version?: number; feedControls?: FeedControls } = {}) => {
  const gb = new GrowthBook({
    features: {
      feed_version: { defaultValue: version },
      feed_explain: { defaultValue: true },
    },
  });
  const client = new QueryClient();
  client.setQueryData(feedControlsQueryKey(defaultUser), feedControls);
  client.setQueryData(feedProfileQueryKey(defaultUser, version), profile);
  client.setQueryData(getFeedSettingsQueryKey(defaultUser), {
    feedSettings: { includeTags: ['webdev'] },
  });

  return render(
    <TestBootProvider client={client} auth={{ user: defaultUser }} gb={gb}>
      <ForYouFeed />
      <FeedSettingsOverviewSection />
    </TestBootProvider>,
  );
};

const findResetRow = async (title: string) =>
  (await screen.findByText(title)).closest('li') as HTMLElement;

beforeEach(() => {
  nock.cleanAll();
  fetchForYou.mockClear();
});

describe('FeedSettingsOverviewSection', () => {
  it('should leave the controls out where the For You ranking ignores them', async () => {
    renderOverview({ version: 15 });

    expect(await screen.findByText('You follow 1 topic.')).toBeInTheDocument();
    expect(screen.queryByText('Learn from my reading')).not.toBeInTheDocument();
    expect(screen.queryByText('Start over')).not.toBeInTheDocument();
    expect(screen.queryByText('Connect your agent')).not.toBeInTheDocument();
    expect(screen.queryByText('Ranking')).not.toBeInTheDocument();
  });

  it('should turn learning off', async () => {
    let sent = false;
    mockGraphQL({
      request: {
        query: SET_FEED_LEARNING_MUTATION,
        variables: { enabled: false },
      },
      result: () => {
        sent = true;
        return { data: { setFeedLearning: { _: true } } };
      },
    });
    renderOverview();

    await userEvent.click(await screen.findByText('Learn from my reading'));

    await waitFor(() => expect(sent).toBe(true));
  });

  it('should end a timed change now, keeping its row', async () => {
    let sent = false;
    mockGraphQL({
      request: {
        query: SET_FEED_TOPIC_MODE_MUTATION,
        variables: { keyword: 'docker', mode: null },
      },
      result: () => {
        sent = true;
        return { data: { setFeedTopicMode: { _: true } } };
      },
    });
    renderOverview({
      feedControls: {
        ...controls,
        topics: [
          {
            keyword: 'docker',
            mode: FeedTopicMode.Demote,
            weight: null,
            expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          },
        ],
      },
    });

    await userEvent.click(
      await screen.findByRole('button', { name: 'End now: #docker' }),
    );

    await waitFor(() => expect(sent).toBe(true));
    expect(screen.getByText('Ended, back to Auto')).toBeInTheDocument();
  });

  it('should reset only once confirmed, then reload For You from page 1', async () => {
    let sent = false;
    mockGraphQL({
      request: {
        query: RESET_FEED_PERSONALIZATION_MUTATION,
        variables: {
          learned: true,
          seen: false,
          levels: false,
          ranking: false,
        },
      },
      result: () => {
        sent = true;
        return { data: { resetFeedPersonalization: { _: true } } };
      },
    });
    renderOverview();
    await waitFor(() => expect(fetchForYou).toHaveBeenCalledTimes(1));

    const [forgetReading] = await screen.findAllByRole('button', {
      name: 'Reset',
    });
    await userEvent.click(forgetReading);
    expect(sent).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Yes, reset' }));

    await waitFor(() => expect(sent).toBe(true));
    await waitFor(() => expect(fetchForYou).toHaveBeenCalledTimes(2));
  });

  it('should clear the boosts set, then read the levels again', async () => {
    let sent = false;
    mockGraphQL({
      request: {
        query: RESET_FEED_PERSONALIZATION_MUTATION,
        variables: {
          learned: false,
          seen: false,
          levels: true,
          ranking: false,
        },
      },
      result: () => {
        sent = true;
        return { data: { resetFeedPersonalization: { _: true } } };
      },
    });
    mockGraphQL({
      request: { query: FEED_CONTROLS_QUERY },
      result: { data: { feedControls: controls } },
    });
    const level = { mode: FeedTopicMode.Boost, weight: null, expiresAt: null };
    renderOverview({
      feedControls: {
        ...controls,
        topics: [
          { keyword: 'docker', ...level },
          { keyword: 'rust', ...level },
        ],
        authors: [{ user: { id: 'u1' }, ...level, mode: FeedAuthorMode.Boost }],
      },
    });

    const row = await findResetRow('Clear the boosts I set');
    expect(
      within(row).getByText('2 topics and 1 creator go back to Auto.'),
    ).toBeInTheDocument();
    await userEvent.click(within(row).getByRole('button', { name: 'Reset' }));
    await userEvent.click(
      within(row).getByRole('button', { name: 'Yes, reset' }),
    );

    await waitFor(() => expect(sent).toBe(true));
    expect(
      await within(row).findByText("You haven't set any boosts."),
    ).toBeInTheDocument();
  });

  it('should reset everything in one call', async () => {
    let sent = false;
    mockGraphQL({
      request: {
        query: RESET_FEED_PERSONALIZATION_MUTATION,
        variables: { learned: true, seen: true, levels: true, ranking: true },
      },
      result: () => {
        sent = true;
        return { data: { resetFeedPersonalization: { _: true } } };
      },
    });
    renderOverview();

    const row = await findResetRow('Reset everything');
    await userEvent.click(within(row).getByRole('button', { name: 'Reset' }));
    await userEvent.click(
      within(row).getByRole('button', { name: 'Yes, reset' }),
    );

    await waitFor(() => expect(sent).toBe(true));
  });
});

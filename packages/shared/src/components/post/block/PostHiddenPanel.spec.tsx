import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import defaultFeedPage from '../../../../__tests__/fixture/feed';
import { ActiveFeedNameContext } from '../../../contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '../../utilities/common';
import { QueryStateKeys } from '../../../hooks/utils/useQueryState';
import { getFeedSettingsQueryKey } from '../../../hooks/useFeedSettings';
import type { Post } from '../../../graphql/posts';
import type { FeedItemExplain } from '../../../features/feedExplain/types';
import { feedControlsQueryKey } from '../../../features/feedExplain/queries';
import { PostHiddenPanel } from './PostHiddenPanel';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest
    .mocked(useRouter)
    .mockImplementation(
      () => ({ pathname: '/', query: {} } as unknown as NextRouter),
    );
});

const post = defaultFeedPage.edges[0].node as Post;
const rankedExplain = {
  lane: 'chal',
  v: 1,
  score: 0.8,
  base: { value: 1, viewers: 100 },
  match: {
    tag: 'javascript',
    origin: 'declared',
    role: 'central',
    role_weight: 1,
    weight: 0.6,
    computed_weight: 0.6,
    factor: 1.6,
  },
  follow: { factor: 1 },
  age: { days: 1, factor: 0.9 },
  seen: { shows: 0, factor: 1 },
} as FeedItemExplain;

const renderPanel = ({
  explain,
  isExplaining,
}: {
  explain?: FeedItemExplain;
  isExplaining: boolean;
}) => {
  const gb = new GrowthBook({
    features: {
      feed_version: { defaultValue: 116 },
      feed_explain: { defaultValue: true },
    },
  });
  const client = new QueryClient();
  client.setQueryData([QueryStateKeys.FeedExplain], isExplaining);
  client.setQueryData(feedControlsQueryKey(defaultUser), {
    topics: [],
    sources: [],
    learning: true,
    fillIns: true,
  });
  client.setQueryData(getFeedSettingsQueryKey(defaultUser), {
    feedSettings: { blockedTags: [] },
  });

  return render(
    <TestBootProvider client={client} auth={{ user: defaultUser }} gb={gb}>
      <ActiveFeedNameContext.Provider
        value={{ feedName: SharedFeedPage.MyFeed }}
      >
        <PostHiddenPanel post={{ ...post, explain }} />
      </ActiveFeedNameContext.Provider>
    </TestBootProvider>,
  );
};

describe('PostHiddenPanel', () => {
  it('should offer to show less of the topic that brought the post in, in Debug mode', async () => {
    renderPanel({ explain: rankedExplain, isExplaining: true });

    expect(
      await screen.findByRole('button', { name: 'Show less #javascript?' }),
    ).toBeInTheDocument();
  });

  it('should not offer it out of Debug mode, where its level cannot be set back', () => {
    renderPanel({ explain: rankedExplain, isExplaining: false });

    expect(
      screen.getByText("Got it. You'll see less like this."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Show less #javascript?' }),
    ).not.toBeInTheDocument();
  });

  it('should not offer it for a post without an explanation', () => {
    renderPanel({ isExplaining: true });

    expect(
      screen.getByText("Got it. You'll see less like this."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Show less/ }),
    ).not.toBeInTheDocument();
  });
});

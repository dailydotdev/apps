import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import defaultFeedPage from '../../../../__tests__/fixture/feed';
import { getFeedSettingsQueryKey } from '../../../hooks/useFeedSettings';
import type { Post } from '../../../graphql/posts';
import type { FeedItemExplain } from '../../../features/feedExplain/types';
import { feedControlsQueryKey } from '../../../features/feedExplain/queries';
import { PostHiddenPanel } from './PostHiddenPanel';

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

const renderPanel = (explain?: FeedItemExplain) => {
  const client = new QueryClient();
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
    <TestBootProvider client={client} auth={{ user: defaultUser }}>
      <PostHiddenPanel post={{ ...post, explain }} />
    </TestBootProvider>,
  );
};

describe('PostHiddenPanel', () => {
  it('should offer to show less of the topic that brought the post in', async () => {
    renderPanel(rankedExplain);

    expect(
      await screen.findByRole('button', { name: 'Show less #javascript?' }),
    ).toBeInTheDocument();
  });

  it('should not offer it for a post without an explanation', () => {
    renderPanel();

    expect(
      screen.getByText("Got it. You'll see less like this."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Show less/ }),
    ).not.toBeInTheDocument();
  });
});

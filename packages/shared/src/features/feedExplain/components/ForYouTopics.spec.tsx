import React from 'react';
import nock from 'nock';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import type { FeedControls, FeedProfile } from '../types';
import { ExplainOrigin, ExplainStrength, FeedTopicMode } from '../types';
import { feedControlsQueryKey, feedProfileQueryKey } from '../queries';
import { SET_FEED_TOPIC_MODE_MUTATION } from '../graphql';
import { ForYouTopics } from './ForYouTopics';

const interest = (
  tag: string,
  origin: ExplainOrigin,
  weight: number,
): FeedProfile['interests'][number] => ({
  tag,
  origin,
  strength: ExplainStrength.Strong,
  stories: 4,
  hiddenStories: 0,
  computedWeight: weight,
  control: null,
  weight,
  backed: true,
});

const profile: FeedProfile = {
  cohort: true,
  learning: true,
  interests: [
    interest('webdev', ExplainOrigin.Declared, 0.4),
    interest('react', ExplainOrigin.Declared, 0.7),
    interest('rust', ExplainOrigin.Inferred, 0.5),
  ],
  muted: [],
  blocked: [],
  ranking: [],
};
const controls: FeedControls = {
  topics: [
    {
      keyword: 'crypto',
      mode: FeedTopicMode.Demote,
      weight: null,
      expiresAt: null,
    },
  ],
  sources: [],
  authors: [],
  learning: true,
  fillIns: true,
  ranking: [],
};

const renderTopics = (version = 116) => {
  const gb = new GrowthBook({
    features: {
      feed_version: { defaultValue: version },
      feed_explain: { defaultValue: true },
    },
  });
  const client = new QueryClient();
  client.setQueryData(feedControlsQueryKey(defaultUser), controls);
  client.setQueryData(feedProfileQueryKey(defaultUser, version), profile);
  const onToggleFollow = jest.fn();
  const topics = (followedTags: string[]) => (
    <TestBootProvider client={client} auth={{ user: defaultUser }} gb={gb}>
      <ForYouTopics
        followedTags={new Set(followedTags)}
        onToggleFollow={onToggleFollow}
      />
    </TestBootProvider>
  );
  const { rerender } = render(topics(['webdev', 'react']));

  return {
    onToggleFollow,
    setFollowedTags: (tags: string[]) => rerender(topics(tags)),
  };
};

const getList = (title: string): HTMLElement =>
  screen
    .getByRole('heading', { name: title })
    .closest('section') as HTMLElement;

beforeEach(() => {
  nock.cleanAll();
});

describe('ForYouTopics', () => {
  it('should list followed and learned topics by boost, each with its level', async () => {
    renderTopics();

    await screen.findByText('Topics you follow');
    const followed = getList('Topics you follow');
    expect(
      within(followed)
        .getAllByText(/^#/)
        .map((name) => name.textContent),
    ).toEqual(['#react', '#webdev']);
    expect(
      within(followed).getByRole('button', { name: /^Boost for #react/ }),
    ).toBeInTheDocument();
    expect(
      within(getList('Topics from your reading')).getByText('#rust'),
    ).toBeInTheDocument();
  });

  it('should keep an unfollowed topic in place, ready to follow again', async () => {
    const { onToggleFollow, setFollowedTags } = renderTopics();

    fireEvent.keyDown(
      await screen.findByRole('button', { name: 'Options for #react' }),
      { key: 'Enter' },
    );
    await userEvent.click(await screen.findByText('Unfollow #react'));
    expect(onToggleFollow).toHaveBeenCalledWith('react');
    setFollowedTags(['webdev']);

    const followed = within(getList('Topics you follow'));
    expect(followed.getByText('#react')).toBeInTheDocument();
    expect(followed.getByText('You no longer follow it.')).toBeInTheDocument();
  });

  it('should put a turned down topic back to Auto', async () => {
    let sent = false;
    mockGraphQL({
      request: {
        query: SET_FEED_TOPIC_MODE_MUTATION,
        variables: { keyword: 'crypto', mode: null },
      },
      result: () => {
        sent = true;
        return { data: { setFeedTopicMode: { _: true } } };
      },
    });
    renderTopics();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Put #crypto back to Auto' }),
    );

    await waitFor(() => expect(sent).toBe(true));
  });

  it('should not show where the For You ranking ignores the levels', () => {
    renderTopics(15);

    expect(screen.queryByText('Topics you follow')).not.toBeInTheDocument();
  });
});

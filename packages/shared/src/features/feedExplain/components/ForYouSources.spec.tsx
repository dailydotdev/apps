import React from 'react';
import nock from 'nock';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { FeedSettingsEditContext } from '../../../components/feeds/FeedSettings/FeedSettingsEditContext';
import type { FeedSettingsEditContextValue } from '../../../components/feeds/FeedSettings/types';
import { FeedType } from '../../../graphql/feed';
import {
  CONTENT_PREFERENCE_UNFOLLOW_MUTATION,
  ContentPreferenceType,
  DEFAULT_FOLLOW_LIMIT,
} from '../../../graphql/contentPreference';
import { getFeedSettingsQueryKey } from '../../../hooks/useFeedSettings';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import type { FeedControls, FeedProfile } from '../types';
import { FeedSourceMode } from '../types';
import { feedControlsQueryKey, feedProfileQueryKey } from '../queries';
import { ForYouSources } from './ForYouSources';

const profile: FeedProfile = {
  cohort: true,
  learning: true,
  interests: [],
  muted: [],
  blocked: [],
  ranking: [
    { key: 'follows.source_multiplier', value: 1.7, defaultValue: 1.7 },
    { key: 'follows.author_multiplier', value: 1.5, defaultValue: 1.5 },
  ],
};
const controls: FeedControls = {
  topics: [],
  sources: [
    {
      source: { id: 'echojs', name: 'Echo JS' },
      mode: FeedSourceMode.Demote,
      weight: null,
      expiresAt: null,
    },
  ],
  authors: [],
  learning: true,
  fillIns: true,
  ranking: [],
};
const feedId = defaultUser.id;

const renderSources = (version = 116) => {
  const gb = new GrowthBook({
    features: {
      feed_version: { defaultValue: version },
      feed_explain: { defaultValue: true },
    },
  });
  const client = new QueryClient();
  client.setQueryData(feedControlsQueryKey(defaultUser), controls);
  client.setQueryData(feedProfileQueryKey(defaultUser, version), profile);
  client.setQueryData(getFeedSettingsQueryKey(defaultUser), {
    feedSettings: {
      includeSources: [{ id: 'daily', name: 'daily.dev', image: '' }],
    },
  });
  client.setQueryData(
    generateQueryKey(
      RequestKey.ContentPreference,
      defaultUser,
      RequestKey.UserFollowing,
      {
        id: defaultUser.id,
        entity: ContentPreferenceType.User,
        first: DEFAULT_FOLLOW_LIMIT,
        feedId,
      },
    ),
    {
      pages: [
        {
          edges: [
            {
              node: {
                referenceUser: { id: 'u2', name: 'Ada', username: 'ada' },
              },
            },
          ],
          pageInfo: { hasNextPage: false },
        },
      ],
      pageParams: [''],
    },
  );
  const context = {
    feed: { id: feedId, type: FeedType.Main },
  } as unknown as FeedSettingsEditContextValue;

  return render(
    <TestBootProvider client={client} auth={{ user: defaultUser }} gb={gb}>
      <FeedSettingsEditContext.Provider value={context}>
        <ForYouSources />
      </FeedSettingsEditContext.Provider>
    </TestBootProvider>,
  );
};

const getList = (title: string): HTMLElement =>
  screen
    .getByRole('heading', { name: title })
    .closest('section') as HTMLElement;

beforeEach(() => {
  nock.cleanAll();
});

describe('ForYouSources', () => {
  it('should list followed sources, sources with a level and creators, each with its boost', async () => {
    renderSources();

    await screen.findByText('Sources you follow');
    const sources = within(getList('Sources you follow'));
    expect(
      sources.getByRole('button', { name: /^Boost for daily\.dev: ×1\.70/ }),
    ).toBeInTheDocument();
    expect(sources.getByText('Showing less')).toBeInTheDocument();
    expect(
      within(getList('Creators you follow')).getByRole('button', {
        name: /^Boost for Ada/,
      }),
    ).toBeInTheDocument();
  });

  it('should unfollow a source and keep its row, ready to follow again', async () => {
    let sent = false;
    mockGraphQL({
      request: {
        query: CONTENT_PREFERENCE_UNFOLLOW_MUTATION,
        variables: {
          id: 'daily',
          entity: ContentPreferenceType.Source,
          feedId,
        },
      },
      result: () => {
        sent = true;
        return { data: { unfollow: { _: true } } };
      },
    });
    renderSources();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Unfollow daily.dev' }),
    );

    await waitFor(() => expect(sent).toBe(true));
    expect(
      screen.getByRole('button', { name: 'Follow daily.dev' }),
    ).toBeInTheDocument();
  });

  it('should not show where the For You ranking ignores the levels', () => {
    renderSources(15);

    expect(screen.queryByText('Sources you follow')).not.toBeInTheDocument();
  });
});

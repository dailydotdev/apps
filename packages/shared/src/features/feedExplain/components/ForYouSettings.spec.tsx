import React from 'react';
import nock from 'nock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { getFeedSettingsQueryKey } from '../../../hooks/useFeedSettings';
import { generateQueryKey } from '../../../lib/query';
import { SharedFeedPage } from '../../../components/utilities/common';
import type { FeedControls } from '../types';
import { feedControlsQueryKey } from '../queries';
import {
  RESET_FEED_PERSONALIZATION_MUTATION,
  SET_FEED_LEARNING_MUTATION,
} from '../graphql';
import { ForYouSettings } from './ForYouSettings';

const controls: FeedControls = {
  topics: [],
  sources: [],
  learning: true,
  fillIns: true,
};
const forYouKey = generateQueryKey(SharedFeedPage.MyFeed, defaultUser, 'v2');

let client: QueryClient;

const renderSettings = (version = 116) => {
  const gb = new GrowthBook({
    features: {
      feed_version: { defaultValue: version },
      feed_explain: { defaultValue: true },
    },
  });
  client = new QueryClient();
  client.setQueryData(feedControlsQueryKey(defaultUser), controls);
  client.setQueryData(getFeedSettingsQueryKey(defaultUser), {
    feedSettings: { includeTags: ['webdev'] },
  });
  client.setQueryData(forYouKey, { pages: [{ page: { edges: [] } }] });

  return render(
    <TestBootProvider client={client} auth={{ user: defaultUser }} gb={gb}>
      <ForYouSettings />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
});

describe('ForYouSettings', () => {
  it('should not show where the For You ranking ignores the controls', () => {
    renderSettings(15);

    expect(screen.queryByText('Learn from my reading')).not.toBeInTheDocument();
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
    renderSettings();

    await userEvent.click(await screen.findByText('Learn from my reading'));

    await waitFor(() => expect(sent).toBe(true));
  });

  it('should reset only once confirmed, then start For You over', async () => {
    let sent = false;
    mockGraphQL({
      request: {
        query: RESET_FEED_PERSONALIZATION_MUTATION,
        variables: { learned: true, seen: false },
      },
      result: () => {
        sent = true;
        return { data: { resetFeedPersonalization: { _: true } } };
      },
    });
    renderSettings();

    const [forgetReading] = await screen.findAllByRole('button', {
      name: 'Reset',
    });
    await userEvent.click(forgetReading);
    expect(sent).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Yes, reset' }));

    await waitFor(() => expect(sent).toBe(true));
    await waitFor(() => expect(client.getQueryData(forYouKey)).toBeUndefined());
  });
});

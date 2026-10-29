import React from 'react';
import nock from 'nock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { Origin } from '../../../lib/log';
import type { FeedControls } from '../types';
import { FeedTopicMode } from '../types';
import { feedControlsQueryKey } from '../queries';
import { SET_FEED_TOPIC_MODE_MUTATION } from '../graphql';
import { ShowLessTopicOffer } from './ShowLessTopicOffer';

const renderOffer = (topics: FeedControls['topics'] = []) => {
  const client = new QueryClient();
  client.setQueryData(feedControlsQueryKey(defaultUser), {
    topics,
    sources: [],
    learning: true,
    fillIns: true,
  });

  return render(
    <TestBootProvider client={client} auth={{ user: defaultUser }}>
      <ShowLessTopicOffer tag="react" origin={Origin.PostHiddenPanel} />
    </TestBootProvider>,
  );
};

const mockSetMode = (mode: FeedTopicMode | null) => {
  const request = { sent: false };
  mockGraphQL({
    request: {
      query: SET_FEED_TOPIC_MODE_MUTATION,
      variables: { keyword: 'react', mode },
    },
    result: () => {
      request.sent = true;
      return { data: { setFeedTopicMode: { _: true } } };
    },
  });
  return request;
};

beforeEach(() => {
  nock.cleanAll();
});

describe('ShowLessTopicOffer', () => {
  it('should show less of the topic and undo it', async () => {
    const demote = mockSetMode(FeedTopicMode.Demote);
    renderOffer();

    await userEvent.click(
      screen.getByRole('button', { name: 'Show less #react?' }),
    );
    await waitFor(() => expect(demote.sent).toBe(true));
    expect(screen.getByText('Showing less #react')).toBeInTheDocument();

    const auto = mockSetMode(null);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => expect(auto.sent).toBe(true));
    expect(
      screen.getByRole('button', { name: 'Show less #react?' }),
    ).toBeInTheDocument();
  });

  it('should not offer it once the reader set the topic', () => {
    renderOffer([{ keyword: 'react', mode: FeedTopicMode.Boost }]);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

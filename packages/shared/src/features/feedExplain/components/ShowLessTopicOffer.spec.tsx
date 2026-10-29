import React from 'react';
import nock from 'nock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { GraphQLResult } from '../../../../__tests__/helpers/graphql';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { getFeedSettingsQueryKey } from '../../../hooks/useFeedSettings';
import type { ToastNotification } from '../../../hooks/useToastNotification';
import { TOAST_NOTIF_KEY } from '../../../hooks/useToastNotification';
import { ApiError } from '../../../graphql/common';
import { Origin } from '../../../lib/log';
import type { FeedControls } from '../types';
import { FeedTopicMode } from '../types';
import { feedControlsQueryKey } from '../queries';
import { SET_FEED_TOPIC_MODE_MUTATION } from '../graphql';
import { ShowLessTopicOffer } from './ShowLessTopicOffer';

let client: QueryClient;

const renderOffer = ({
  topics = [],
  blockedTags = [],
}: {
  topics?: FeedControls['topics'];
  blockedTags?: string[];
} = {}) => {
  client = new QueryClient();
  client.setQueryData(feedControlsQueryKey(defaultUser), {
    topics,
    sources: [],
    learning: true,
    fillIns: true,
    ranking: [],
  });
  client.setQueryData(getFeedSettingsQueryKey(defaultUser), {
    feedSettings: { blockedTags },
  });

  return render(
    <TestBootProvider client={client} auth={{ user: defaultUser }}>
      <ShowLessTopicOffer tag="react" origin={Origin.PostHiddenPanel} />
    </TestBootProvider>,
  );
};

const mockSetMode = (
  mode: FeedTopicMode | null,
  result: GraphQLResult = { data: { setFeedTopicMode: { _: true } } },
) => {
  const request = { sent: false };
  mockGraphQL({
    request: {
      query: SET_FEED_TOPIC_MODE_MUTATION,
      variables: { keyword: 'react', mode },
    },
    result: () => {
      request.sent = true;
      return result;
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
    await userEvent.click(
      screen.getByRole('button', { name: 'Undo show less #react' }),
    );
    await waitFor(() => expect(auto.sent).toBe(true));
    expect(
      screen.getByRole('button', { name: 'Show less #react?' }),
    ).toBeInTheDocument();
  });

  it('should roll back and say why when the change is refused', async () => {
    const message = 'Too many topics set, set some back to Auto first';
    const demote = mockSetMode(FeedTopicMode.Demote, {
      errors: [
        {
          message,
          extensions: { code: ApiError.GraphqlValidationFailed },
        },
      ],
    } as unknown as GraphQLResult);
    renderOffer();

    await userEvent.click(
      screen.getByRole('button', { name: 'Show less #react?' }),
    );
    await waitFor(() => expect(demote.sent).toBe(true));

    await waitFor(() =>
      expect(
        client.getQueryData<ToastNotification>(TOAST_NOTIF_KEY)?.message,
      ).toBe(message),
    );
    expect(
      await screen.findByRole('button', { name: 'Show less #react?' }),
    ).toBeInTheDocument();
    expect(
      client.getQueryData<FeedControls>(feedControlsQueryKey(defaultUser))
        ?.topics,
    ).toEqual([]);
  });

  it('should not offer it once the reader set the topic', () => {
    renderOffer({
      topics: [
        {
          keyword: 'react',
          mode: FeedTopicMode.Boost,
          weight: null,
          expiresAt: null,
        },
      ],
    });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should not offer it for a blocked topic', () => {
    renderOffer({ blockedTags: ['react'] });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

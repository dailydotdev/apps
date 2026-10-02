import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { SlackDigestOptIn } from './SlackDigestOptIn';
import type { SlackDigest } from '../../graphql/integrations';
import {
  SLACK_DIGESTS_QUERY,
  UPSERT_SLACK_DIGEST_MUTATION,
} from '../../graphql/integrations';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';

const channel = { id: 'c1', name: 'engineering' };

const digest: SlackDigest = {
  id: 'd1',
  integrationId: 'i1',
  channelId: channel.id,
  channelName: channel.name,
  weekday: 1,
  hour: 9,
  timezone: 'Europe/London',
  tags: [],
  includeTeamStats: true,
};

const mockDigests = (slackDigests: SlackDigest[]) =>
  mockGraphQL({
    request: { query: SLACK_DIGESTS_QUERY, variables: { integrationId: 'i1' } },
    result: { data: { slackDigests } },
  });

const renderComponent = () =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: { ...loggedUser, timezone: 'Europe/London' } }}
    >
      <SlackDigestOptIn integrationId="i1" channel={channel} />
    </TestBootProvider>,
  );

beforeEach(() => {
  nock.cleanAll();
});

it('should subscribe the channel to the Monday digest when ticked', async () => {
  mockDigests([]);
  let isSubscribed = false;
  mockGraphQL({
    request: {
      query: UPSERT_SLACK_DIGEST_MUTATION,
      variables: {
        input: {
          integrationId: 'i1',
          channelId: channel.id,
          weekday: 1,
          hour: 9,
          timezone: 'Europe/London',
          tags: [],
          includeTeamStats: true,
        },
      },
    },
    result: () => {
      isSubscribed = true;
      return { data: { upsertSlackDigest: digest } };
    },
  });
  renderComponent();

  fireEvent.click(
    await screen.findByText('Also post a weekly digest in #engineering'),
  );

  await screen.findByText(/First digest: Monday 9:00/);
  expect(isSubscribed).toBe(true);
});

it('should not offer the digest to a channel that already has one', async () => {
  mockDigests([digest]);
  renderComponent();

  await screen.findByText('Sent. Your team will see it now.');
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  expect(
    screen.queryByText('Also post a weekly digest in #engineering'),
  ).not.toBeInTheDocument();
});

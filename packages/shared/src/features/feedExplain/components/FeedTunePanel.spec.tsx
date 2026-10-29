import React from 'react';
import nock from 'nock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { QueryStateKeys } from '../../../hooks/utils/useQueryState';
import type { FeedControls, FeedProfile } from '../types';
import { ExplainOrigin, FeedTopicMode, FeedTuneTab } from '../types';
import { feedControlsQueryKey, feedProfileQueryKey } from '../queries';
import { SET_FEED_TOPIC_MODE_MUTATION } from '../graphql';
import { FeedTuneProvider } from '../FeedTuneContext';
import { FeedTunePanel } from './FeedTunePanel';

const user = { ...defaultUser, isPlus: true };
const baseKey = ['feed', 'base'];
const previewKey = ['feed', 'base', 'draft'];

const page = (ids: string[]) => ({
  pages: [
    {
      page: {
        pageInfo: { hasNextPage: false },
        edges: ids.map((id) => ({
          node: {
            itemType: 'post',
            post: { id, source: { id: 'daily', name: 'daily.dev' } },
          },
        })),
      },
    },
  ],
  pageParams: [''],
});

const openPanel = (seed?: (client: QueryClient) => void) => {
  const client = new QueryClient();
  client.setQueryData<FeedProfile>(feedProfileQueryKey(user, 116), {
    cohort: true,
    learning: true,
    interests: [
      {
        tag: 'rust',
        origin: ExplainOrigin.Inferred,
        strength: null,
        stories: 4,
        hiddenStories: 0,
        computedWeight: 0.5,
        control: null,
        weight: 0.5,
        backed: true,
      },
    ],
    muted: [],
    blocked: [],
    ranking: [],
  });
  client.setQueryData<FeedControls>(feedControlsQueryKey(user), {
    topics: [],
    sources: [],
    authors: [],
    learning: true,
    fillIns: true,
    ranking: [],
  });
  client.setQueryData([QueryStateKeys.FeedTune], FeedTuneTab.Topics);
  client.setQueryData(baseKey, page(['p1', 'p2']));
  seed?.(client);

  render(
    <TestBootProvider client={client} auth={{ user }}>
      <FeedTuneProvider
        baseQueryKey={baseKey}
        previewQueryKey={seed ? previewKey : undefined}
      >
        <FeedTunePanel version={116} />
      </FeedTuneProvider>
    </TestBootProvider>,
  );
  return client;
};

beforeEach(() => {
  nock.cleanAll();
});

describe('FeedTunePanel', () => {
  it('should keep changes as a draft the feed ranks with until Save', async () => {
    let saved = false;
    mockGraphQL({
      request: {
        query: SET_FEED_TOPIC_MODE_MUTATION,
        variables: { keyword: 'rust', mode: 'demote' },
      },
      result: () => {
        saved = true;
        return { data: { setFeedTopicMode: { _: true } } };
      },
    });
    const client = openPanel();

    await userEvent.click(screen.getByLabelText('Boost for #rust: ×1.50'));
    await userEvent.click(screen.getByRole('radio', { name: /^Show less/ }));

    expect(client.getQueryData([QueryStateKeys.FeedTuneChanges])).toEqual([
      {
        kind: 'topic',
        keyword: 'rust',
        value: { mode: FeedTopicMode.Demote },
      },
    ]);
    expect(saved).toBe(false);

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(() => expect(saved).toBe(true));
    expect(client.getQueryData([QueryStateKeys.FeedTune])).toBeNull();
  });

  it('should say how the draft moved the page', () => {
    openPanel((client) => {
      client.setQueryData(
        [QueryStateKeys.FeedTuneChanges],
        [{ kind: 'learning', enabled: false }],
      );
      client.setQueryData(previewKey, page(['p2', 'p3']));
    });

    expect(
      screen.getByText('1 new post, 1 moved, 1 left the page.'),
    ).toBeInTheDocument();
  });

  it('should close on Done with nothing changed', async () => {
    const client = openPanel();

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(client.getQueryData([QueryStateKeys.FeedTune])).toBeNull();
  });
});

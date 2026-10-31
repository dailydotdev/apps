import React from 'react';
import nock from 'nock';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { QueryStateKeys } from '../../../hooks/utils/useQueryState';
import { LogEvent } from '../../../lib/log';
import type { FeedControls, FeedControlsDraft, FeedProfile } from '../types';
import { ExplainOrigin, FeedTopicMode, FeedTuneTab } from '../types';
import { feedControlsQueryKey, feedProfileQueryKey } from '../queries';
import { SET_FEED_TOPIC_MODE_MUTATION } from '../graphql';
import { FeedTuneProvider } from '../FeedTuneContext';
import { useFeedTuneState } from '../useFeedTune';
import { FeedTunePanel } from './FeedTunePanel';

const user = { ...defaultUser, isPlus: true };
const logEvent = jest.fn();
const baseKey = ['feed', 'base'];

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

const createClient = () => {
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
  return client;
};

const openPanel = () => {
  const client = createClient();

  render(
    <TestBootProvider client={client} auth={{ user }} log={{ logEvent }}>
      <FeedTuneProvider baseQueryKey={baseKey}>
        <FeedTunePanel version={116} />
      </FeedTuneProvider>
    </TestBootProvider>,
  );
  return client;
};

// The feed beside Tune, as MainFeedLayout ranks it: with the draft last
// previewed.
const TunedFeed = ({
  fetchFeed,
}: {
  fetchFeed: (draft: FeedControlsDraft) => Promise<unknown>;
}) => {
  const { hasPreview, previewDraft } = useFeedTuneState();
  const queryKey = hasPreview ? [...baseKey, previewDraft] : baseKey;
  useQuery({
    queryKey,
    queryFn: () => fetchFeed(previewDraft),
    staleTime: Infinity,
  });

  return (
    <FeedTuneProvider
      baseQueryKey={baseKey}
      previewQueryKey={hasPreview ? queryKey : undefined}
    >
      <FeedTunePanel version={116} />
    </FeedTuneProvider>
  );
};

beforeEach(() => {
  nock.cleanAll();
  logEvent.mockClear();
});

describe('FeedTunePanel', () => {
  it('should keep changes as a draft until Save, previewed or not', async () => {
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
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.CloseFeedTune }),
    );
  });

  it('should re-rank the feed only when asked to preview', async () => {
    let resolvePreview: (data: unknown) => void;
    const fetchFeed = jest.fn(
      () =>
        new Promise((resolve) => {
          resolvePreview = resolve;
        }),
    );
    render(
      <TestBootProvider
        client={createClient()}
        auth={{ user }}
        log={{ logEvent }}
      >
        <TunedFeed fetchFeed={fetchFeed} />
      </TestBootProvider>,
    );

    await userEvent.click(screen.getByLabelText('Boost for #rust: ×1.50'));
    await userEvent.click(screen.getByRole('radio', { name: /^Show less/ }));

    expect(fetchFeed).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Preview to see these changes in your feed.'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Preview 1 change' }),
    );

    expect(await screen.findByText('Updating your feed.')).toBeInTheDocument();
    expect(fetchFeed).toHaveBeenCalledWith({
      topics: [{ keyword: 'rust', mode: FeedTopicMode.Demote }],
    });
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.PreviewFeedTune,
      extra: JSON.stringify({ changes: 1, pending: 1 }),
    });
    act(() => resolvePreview(page(['p2', 'p3'])));
    expect(
      await screen.findByText('1 new post, 1 moved, 1 left the page.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Preview/ }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByText('Learn from my reading'));

    expect(
      await screen.findByText('Out of date. Your feed shows the last preview.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Preview 1 change' }),
    ).toBeInTheDocument();

    // Undoing past the preview leaves the feed as previewed.
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(
      await screen.findByText('1 new post, 1 moved, 1 left the page.'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(
      await screen.findByText('Out of date. Your feed shows the last preview.'),
    ).toBeInTheDocument();
    expect(fetchFeed).toHaveBeenCalledTimes(1);
  });

  it('should log the changes it drops when closed without saving', async () => {
    const client = openPanel();

    await userEvent.click(screen.getByLabelText('Boost for #rust: ×1.50'));
    await userEvent.click(screen.getByRole('radio', { name: /^Show less/ }));
    await screen.findByRole('button', { name: 'Save' });
    await userEvent.click(screen.getByLabelText('Close Tune'));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.CloseFeedTune,
      extra: JSON.stringify({ changes: 1 }),
    });
    expect(client.getQueryData([QueryStateKeys.FeedTuneChanges])).toEqual([]);
  });

  it('should close on Done with nothing changed', async () => {
    const client = openPanel();

    await userEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(client.getQueryData([QueryStateKeys.FeedTune])).toBeNull();
  });
});

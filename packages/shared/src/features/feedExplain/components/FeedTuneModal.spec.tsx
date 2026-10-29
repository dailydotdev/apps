import React from 'react';
import nock from 'nock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import type {
  FeedControls,
  FeedControlsDraft,
  FeedProfile,
  FeedTune,
} from '../types';
import { ExplainOrigin, FeedTopicMode } from '../types';
import { feedControlsQueryKey, feedProfileQueryKey } from '../queries';
import { FEED_TUNE_QUERY, SET_FEED_TOPIC_MODE_MUTATION } from '../graphql';
import FeedTuneModal from './FeedTuneModal';

const user = { ...defaultUser, isPlus: true };
const onRequestClose = jest.fn();

const post = (id: string) => ({
  post: {
    id,
    title: `Post ${id}`,
    commentsPermalink: `https://daily.dev/posts/${id}`,
    source: { id: 'daily', name: 'daily.dev', image: '' },
  },
  explain: { lane: 'chal' },
});

const tune = (ids: string[], leftOut: FeedTune['leftOut'] = []): FeedTune => ({
  items: ids.map(post),
  leftOut,
  summary: { candidates: 50, eligible: 40, leftOut: 10, reasons: {} },
});

const mockTune = (draft: FeedControlsDraft, result: FeedTune) =>
  mockGraphQL({
    request: {
      query: FEED_TUNE_QUERY,
      variables: { version: 116, first: 20, draft },
    },
    result: { data: { feedTune: result } },
  });

const renderTune = ({
  muted = [],
  topics = [],
}: Partial<Pick<FeedProfile, 'muted'> & Pick<FeedControls, 'topics'>> = {}) => {
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
    muted,
    blocked: [],
    ranking: [],
  });
  client.setQueryData<FeedControls>(feedControlsQueryKey(user), {
    topics,
    sources: [],
    learning: true,
    fillIns: true,
    ranking: [],
  });

  return render(
    <TestBootProvider client={client} auth={{ user }}>
      <FeedTuneModal isOpen version={116} onRequestClose={onRequestClose} />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
  onRequestClose.mockClear();
});

describe('FeedTuneModal', () => {
  it('should preview a draft against the feed as it is, and save it only on Save', async () => {
    mockTune(
      {},
      tune(
        ['p1', 'p2'],
        [{ ...post('p9'), explain: { lane: 'chal', reasons: ['hidden'] } }],
      ),
    );
    mockTune(
      { topics: [{ keyword: 'rust', mode: FeedTopicMode.Demote }] },
      tune(['p2', 'p3']),
    );
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
    renderTune();

    expect(await screen.findByText('You hid it')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Boost for #rust: ×1.50'));
    await userEvent.click(screen.getByRole('radio', { name: /^Show less/ }));

    expect(
      await screen.findByText('1 new post, 1 moved, 1 left the page.'),
    ).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(saved).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(saved).toBe(true));
    expect(onRequestClose).toHaveBeenCalled();
  });

  it('should take the last change back on Undo', async () => {
    mockTune({}, tune(['p1']));
    mockTune(
      { topics: [{ keyword: 'rust', mode: FeedTopicMode.Off }] },
      tune(['p1']),
    );
    renderTune();

    await userEvent.click(
      await screen.findByLabelText('Boost for #rust: ×1.50'),
    );
    await userEvent.click(screen.getByRole('radio', { name: /^Off/ }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('should list a topic turned off so it can come back', async () => {
    mockTune({}, tune(['p1']));
    renderTune({
      muted: ['python'],
      topics: [
        {
          keyword: 'python',
          mode: FeedTopicMode.Off,
          weight: null,
          expiresAt: null,
        },
      ],
    });

    expect(await screen.findByText('#python')).toBeInTheDocument();
    expect(screen.getByText('Off in For You')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Boost for #python: No boost'));
    await userEvent.click(screen.getByRole('radio', { name: /^Auto/ }));

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });
});

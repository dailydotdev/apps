import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../__tests__/fixture/squads';
import { ActionType } from '../../graphql/actions';
import type { Post } from '../../graphql/posts';
import { SourceType } from '../../graphql/sources';
import { SQUAD_JOIN_MUTATION, SQUAD_QUERY } from '../../graphql/squads';
import { AdActions } from '../../lib/ads';
import { LogEvent } from '../../lib/log';
import { PostSidebarAdWidget } from './PostSidebarAdWidget';

const boostedSquad = generateTestSquad({
  id: 'boosted-squad',
  handle: 'boosted',
  name: 'Boosted squad',
  public: false,
  currentMember: undefined,
});
const postSource = {
  id: 'daily',
  handle: 'daily',
  name: 'daily.dev',
  type: SourceType.Machine,
} as Post['source'];

const logEvent = jest.fn();

const renderComponent = (
  ad: Record<string, unknown>,
  source: Post['source'] = postSource,
): void => {
  nock('http://localhost:3000')
    .get('/v1/a')
    .query(true)
    .reply(
      200,
      [{ providerId: 'Direct', pixel: ['https://pixel.test/i'], ...ad }],
      { 'x-generation-id': 'gen-1' },
    );

  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <PostSidebarAdWidget postId="p1" source={source} />
    </TestBootProvider>,
  );
};

const getEvents = (eventName: string) =>
  logEvent.mock.calls
    .map(([event]) => event)
    .filter((event) => event.event_name === eventName);

const getAdImpressions = () =>
  getEvents(AdActions.Impression).filter((event) => event.target_type === 'ad');

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

it.each([
  [
    'a boosted post',
    { source: 'booster', data: { post: { id: 'boosted-post' } } },
    postSource,
  ],
  [
    "a boost for the post's own squad",
    { source: 'booster', data: { source: boostedSquad } },
    { ...boostedSquad, features: {} } as Post['source'],
  ],
])(
  'should log no impression for %s, which it does not render',
  async (_, ad, source) => {
    renderComponent(ad, source);

    await waitFor(() => expect(nock.isDone()).toBe(true));
    await waitFor(() =>
      expect(document.querySelector('[aria-busy]')).toBeNull(),
    );
    expect(screen.queryByTestId('pixel')).not.toBeInTheDocument();
    expect(getAdImpressions()).toHaveLength(0);
  },
);

it('should render a boosted squad and credit joins from it', async () => {
  mockGraphQL({
    request: { query: SQUAD_QUERY, variables: { handle: 'boosted' } },
    result: { data: { source: boostedSquad } },
  });
  renderComponent({ source: 'booster', data: { source: boostedSquad } });

  await screen.findByText('Boosted squad');
  expect(screen.getByTestId('pixel')).toBeInTheDocument();
  expect(getAdImpressions()).toHaveLength(1);

  mockGraphQL({
    request: {
      query: SQUAD_JOIN_MUTATION,
      variables: { sourceId: boostedSquad.id },
    },
    result: { data: { source: boostedSquad } },
  });
  mockGraphQL(completeActionMock({ action: ActionType.JoinSquad }));
  (await screen.findByText('Join Squad')).click();

  await waitFor(() =>
    expect(getEvents(LogEvent.CompleteJoiningSquad)).toHaveLength(1),
  );
  expect(
    JSON.parse(getEvents(LogEvent.CompleteJoiningSquad)[0].extra),
  ).toMatchObject({
    gen_id: 'gen-1',
    referrer_target_id: boostedSquad.id,
    referrer_target_type: 'source',
  });
});

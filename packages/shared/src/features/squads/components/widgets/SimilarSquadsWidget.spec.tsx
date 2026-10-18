import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../../../__tests__/helpers/graphql';
import loggedUser from '../../../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../../../__tests__/fixture/squads';
import { ActionType } from '../../../../graphql/actions';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import {
  getTopMembersBySquadSince,
  MAX_TOP_MEMBERS_BY_SQUAD,
  SIMILAR_SQUADS_QUERY,
  SQUAD_JOIN_MUTATION,
  SQUAD_QUERY,
  TOP_MEMBERS_BY_SQUAD_QUERY,
} from '../../../../graphql/squads';
import { AdActions } from '../../../../lib/ads';
import { LogEvent, TargetType } from '../../../../lib/log';
import { SimilarSquadsWidget } from './SimilarSquadsWidget';

const noFeatures = {
  verified: null,
  adFree: null,
  links: null,
  products: null,
};
const viewedSquad = generateTestSquad({
  id: 'viewed',
  handle: 'viewed',
  name: 'Viewed squad',
  currentMember: undefined,
  features: noFeatures,
});
const boostedSquad = generateTestSquad({
  id: 'boosted',
  handle: 'boosted',
  name: 'Boosted squad',
  currentMember: undefined,
});
const similarSquads = [1, 2, 3, 4, 5].map((index) =>
  generateTestSquad({
    id: `similar-${index}`,
    handle: `similar${index}`,
    name: `Similar ${index}`,
    currentMember: undefined,
  }),
);

const logEvent = jest.fn();

const mockSimilarSquads = (squads: Squad[] = similarSquads) =>
  mockGraphQL({
    request: {
      query: SIMILAR_SQUADS_QUERY,
      variables: { sourceId: viewedSquad.id, limit: 5 },
    },
    result: { data: { similarSquads: squads } },
  });

const mockAd = (source: Squad) =>
  nock('http://localhost:3000')
    .get('/v1/a/squads_directory')
    .query(true)
    .reply(
      200,
      [
        {
          source: 'booster',
          providerId: 'Direct',
          pixel: ['https://pixel.test/i'],
          data: { source },
        },
      ],
      { 'x-generation-id': 'gen-1' },
    );

const mockSquad = (squad: Squad) => {
  mockGraphQL({
    request: { query: SQUAD_QUERY, variables: { handle: squad.handle } },
    result: { data: { source: squad } },
  });
  mockGraphQL({
    request: {
      query: TOP_MEMBERS_BY_SQUAD_QUERY,
      variables: {
        sourceId: squad.id,
        since: getTopMembersBySquadSince(),
        limit: MAX_TOP_MEMBERS_BY_SQUAD,
      },
    },
    result: { data: { topMembersBySquad: [] } },
  });
};

const renderComponent = ({
  squad = viewedSquad,
  user = loggedUser,
}: { squad?: Squad; user?: typeof loggedUser } = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user, squads: [] }}
      log={{ logEvent }}
    >
      <SimilarSquadsWidget squad={squad} />
    </TestBootProvider>,
  );

const getEvents = (eventName: string) =>
  logEvent.mock.calls
    .map(([event]) => event)
    .filter((event) => event.event_name === eventName);

const getAdEvents = () =>
  logEvent.mock.calls
    .map(([event]) => event)
    .filter((event) => event.target_type === 'ad');

const findRows = async () => {
  const list = await screen.findByRole('list');
  return within(list).getAllByRole('listitem');
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

it.each([
  ['an ad-free squad', { ...noFeatures, adFree: true }],
  ['a squad whose features are still loading', undefined],
])('should render nothing and fire no queries for %s', async (_, features) => {
  mockSimilarSquads();
  mockAd(boostedSquad);
  renderComponent({ squad: { ...viewedSquad, features } });

  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

  expect(screen.queryByText('Similar squads')).not.toBeInTheDocument();
  expect(nock.pendingMocks()).toHaveLength(2);
});

it('should give a Plus member the organic rows without requesting an ad', async () => {
  mockSimilarSquads();
  mockAd(boostedSquad);
  renderComponent({ user: { ...loggedUser, isPlus: true } });

  expect(await findRows()).toHaveLength(5);
  expect(screen.queryByTestId('pixel')).not.toBeInTheDocument();
  expect(nock.pendingMocks()).toEqual([
    expect.stringContaining('/v1/a/squads_directory'),
  ]);
});

it.each([
  ['the viewed squad', viewedSquad],
  [
    'a squad the reader belongs to',
    {
      ...boostedSquad,
      currentMember: {
        ...generateTestSquad().currentMember,
        role: SourceMemberRole.Member,
      },
    } as Squad,
  ],
])(
  'should give the slot to an organic row on a boost of %s',
  async (_, adSquad) => {
    mockSimilarSquads();
    mockAd(adSquad);
    mockSquad(adSquad);
    renderComponent();

    expect(await findRows()).toHaveLength(5);
    mockAllIsIntersecting(true);

    expect(screen.queryByTestId('pixel')).not.toBeInTheDocument();
    expect(getAdEvents()).toHaveLength(0);
    expect(nock.isDone()).toBe(true);
  },
);

it('should put the boost generation id only on joins from the promoted row', async () => {
  mockSimilarSquads([boostedSquad, ...similarSquads]);
  mockAd(boostedSquad);
  mockSquad(boostedSquad);
  renderComponent();

  const rows = await findRows();
  expect(rows).toHaveLength(5);
  expect(within(rows[0]).getByText('Boosted squad')).toBeInTheDocument();
  expect(within(rows[0]).getByTestId('pixel')).toBeInTheDocument();
  expect(screen.getAllByText('Boosted squad')).toHaveLength(1);
  expect(screen.getAllByTestId('pixel')).toHaveLength(1);
  mockAllIsIntersecting(true);
  await waitFor(() =>
    expect(
      getAdEvents().filter(
        ({ event_name: name }) => name === AdActions.Impression,
      ),
    ).toHaveLength(1),
  );
  expect(
    getEvents(LogEvent.Impression).filter(
      ({ target_type: type }) => type === TargetType.SimilarSquads,
    ),
  ).toHaveLength(1);

  [similarSquads[0], boostedSquad].forEach((squad) => {
    mockGraphQL({
      request: {
        query: SQUAD_JOIN_MUTATION,
        variables: { sourceId: squad.id },
      },
      result: {
        data: {
          source: {
            ...squad,
            currentMember: generateTestSquad().currentMember,
          },
        },
      },
    });
    mockGraphQL(completeActionMock({ action: ActionType.JoinSquad }));
  });
  within(rows[1]).getByRole('button', { name: 'Join' }).click();
  await waitFor(() =>
    expect(getEvents(LogEvent.CompleteJoiningSquad)).toHaveLength(1),
  );
  within(rows[0]).getByRole('button', { name: 'Join' }).click();
  await waitFor(() =>
    expect(getEvents(LogEvent.CompleteJoiningSquad)).toHaveLength(2),
  );
  expect(
    within((await findRows())[0]).getByTestId('pixel'),
  ).toBeInTheDocument();

  const [organicJoin, promotedJoin] = getEvents(
    LogEvent.CompleteJoiningSquad,
  ).map(({ extra }) => JSON.parse(extra));
  expect(organicJoin).toMatchObject({
    squad: similarSquads[0].id,
    origin: 'similar squads',
  });
  expect(organicJoin).not.toHaveProperty('gen_id');
  expect(promotedJoin).toMatchObject({
    squad: boostedSquad.id,
    origin: 'similar squads promoted',
    gen_id: 'gen-1',
  });
});

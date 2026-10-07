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
import {
  getTopMembersBySquadSince,
  MAX_TOP_MEMBERS_BY_SQUAD,
  SIMILAR_SQUADS_QUERY,
  SQUAD_JOIN_MUTATION,
  SQUAD_QUERY,
  TOP_MEMBERS_BY_SQUAD_QUERY,
} from '../../../../graphql/squads';
import { LogEvent, Origin, TargetType } from '../../../../lib/log';
import { SquadActionButton } from '../../../../components/squads/SquadActionButton';
import { SquadJoinSuggestionsPopup } from './SquadJoinSuggestionsPopup';

type NavigationHandler = (url: string, options?: { shallow?: boolean }) => void;

const mockNavigationHandlers = new Set<NavigationHandler>();

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    pathname: '/',
    push: jest.fn(),
    events: {
      on: (_: string, handler: NavigationHandler) =>
        mockNavigationHandlers.add(handler),
      off: (_: string, handler: NavigationHandler) =>
        mockNavigationHandlers.delete(handler),
    },
  }),
}));

// The shared mock only resolves default exports
jest.mock('next/dynamic', () => (load: () => Promise<unknown>) => {
  let Component: React.ComponentType | undefined;
  load().then((mod) => {
    Component = mod as React.ComponentType;
  });
  const DynamicComponent = (props: Record<string, unknown>) =>
    Component ? <Component {...props} /> : null;

  return DynamicComponent;
});

const noFeatures = {
  verified: null,
  adFree: null,
  links: null,
  products: null,
};
const joinedSquad = generateTestSquad({
  id: 'joined',
  handle: 'joined',
  name: 'Joined squad',
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
      variables: { sourceId: joinedSquad.id, limit: 5 },
    },
    result: { data: { similarSquads: squads } },
  });

const mockAd = () =>
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
          data: { source: boostedSquad },
        },
      ],
      { 'x-generation-id': 'gen-1' },
    );

const mockBoostedSquad = () => {
  mockGraphQL({
    request: {
      query: SQUAD_QUERY,
      variables: { handle: boostedSquad.handle },
    },
    result: { data: { source: boostedSquad } },
  });
  mockGraphQL({
    request: {
      query: TOP_MEMBERS_BY_SQUAD_QUERY,
      variables: {
        sourceId: boostedSquad.id,
        since: getTopMembersBySquadSince(),
        limit: MAX_TOP_MEMBERS_BY_SQUAD,
      },
    },
    result: { data: { topMembersBySquad: [] } },
  });
};

const mockJoin = (squad: Squad = joinedSquad) => {
  mockGraphQL({
    request: { query: SQUAD_JOIN_MUTATION, variables: { sourceId: squad.id } },
    result: {
      data: {
        source: { ...squad, currentMember: generateTestSquad().currentMember },
      },
    },
  });
  mockGraphQL(completeActionMock({ action: ActionType.JoinSquad }));
};

const renderComponent = ({
  squad = joinedSquad,
  origin = Origin.Feed,
}: { squad?: Squad; origin?: Origin } = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser, squads: [] }}
      log={{ logEvent }}
    >
      <SquadActionButton squad={squad} origin={origin} alwaysShow />
      <SquadJoinSuggestionsPopup />
    </TestBootProvider>,
  );

const getEvents = (eventName: string) =>
  logEvent.mock.calls
    .map(([event]) => event)
    .filter((event) => event.event_name === eventName);

const joinAndSettle = async () => {
  screen.getByRole('button', { name: 'Join Squad' }).click();
  await waitFor(() =>
    expect(getEvents(LogEvent.CompleteJoiningSquad)).toHaveLength(1),
  );
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
};

const findCard = () =>
  screen.findByRole('region', { name: `Squads like ${joinedSquad.name}` });

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mockNavigationHandlers.clear();
  window.sessionStorage.clear();
  window.localStorage.clear();
});

it('should suggest similar squads after a join, with the boost on top', async () => {
  mockJoin();
  mockSimilarSquads();
  mockAd();
  mockBoostedSquad();
  renderComponent();
  screen.getByRole('button', { name: 'Join Squad' }).click();

  const card = await findCard();
  const rows = within(card).getAllByRole('listitem');
  expect(rows).toHaveLength(3);
  expect(within(rows[0]).getByText('Boosted squad')).toBeInTheDocument();
  mockAllIsIntersecting(true);
  await waitFor(() =>
    expect(
      getEvents(LogEvent.Impression).filter(
        ({ target_type: type }) => type === TargetType.SimilarSquads,
      ),
    ).toHaveLength(1),
  );
  const [impression] = getEvents(LogEvent.Impression).filter(
    ({ target_type: type }) => type === TargetType.SimilarSquads,
  );
  expect(JSON.parse(impression.extra)).toMatchObject({
    origin: Origin.SquadJoinSuggestions,
    trigger: Origin.Feed,
    promoted: boostedSquad.id,
  });

  within(card)
    .getByRole('button', { name: 'Dismiss suggested squads' })
    .click();
  await waitFor(() => expect(card).not.toBeInTheDocument());
  expect(
    JSON.parse(getEvents(LogEvent.DismissSquadJoinSuggestions)[0].extra),
  ).toMatchObject({ trigger: Origin.Feed });
});

it.each([
  ['the squad directory', Origin.SquadDirectory],
  ['the similar squads rows', Origin.SimilarSquads],
  ['the suggestions themselves', Origin.SquadJoinSuggestions],
  ['the squad page, which shows them inline', Origin.SquadPage],
])('should float nothing after a join from %s', async (_, origin) => {
  mockJoin();
  mockSimilarSquads();
  renderComponent({ origin });
  await joinAndSettle();

  expect(
    screen.queryByRole('region', { name: /Squads like/ }),
  ).not.toBeInTheDocument();
});

it('should suggest nothing for an ad-free squad', async () => {
  const adFreeSquad = {
    ...joinedSquad,
    features: { ...noFeatures, adFree: true },
  };
  mockJoin(adFreeSquad);
  mockSimilarSquads();
  mockAd();
  renderComponent({ squad: adFreeSquad });
  await joinAndSettle();

  expect(
    screen.queryByRole('region', { name: /Squads like/ }),
  ).not.toBeInTheDocument();
  expect(nock.pendingMocks()).toHaveLength(2);
});

it('should show nothing with fewer than two organic squads', async () => {
  mockJoin();
  mockSimilarSquads(similarSquads.slice(0, 1));
  mockAd();
  mockBoostedSquad();
  renderComponent();
  await joinAndSettle();
  await waitFor(() => expect(nock.isDone()).toBe(true));
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));

  expect(
    screen.queryByRole('region', { name: /Squads like/ }),
  ).not.toBeInTheDocument();
});

it('should close on navigation but stay through a shallow route change', async () => {
  mockJoin();
  mockSimilarSquads();
  mockAd();
  mockBoostedSquad();
  renderComponent();
  screen.getByRole('button', { name: 'Join Squad' }).click();
  const card = await findCard();

  act(() =>
    mockNavigationHandlers.forEach((handler) =>
      handler('/posts/post', { shallow: true }),
    ),
  );
  expect(card).toBeInTheDocument();

  act(() =>
    mockNavigationHandlers.forEach((handler) => handler('/squads/other')),
  );
  await waitFor(() => expect(card).not.toBeInTheDocument());
});

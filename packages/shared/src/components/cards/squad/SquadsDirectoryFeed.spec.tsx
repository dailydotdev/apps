import React from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../../__tests__/helpers/graphql';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import { ActionType } from '../../../graphql/actions';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import type { Squad } from '../../../graphql/sources';
import { SQUAD_JOIN_MUTATION, SQUAD_QUERY } from '../../../graphql/squads';
import { LogEvent } from '../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { consumeSquadBoostClick } from '../../../features/monetization/squadBoostClick';
import { SquadsDirectoryFeed } from './SquadsDirectoryFeed';

const organicSquad = generateTestSquad({
  id: 'organic-squad',
  handle: 'organic',
  name: 'Organic squad',
  currentMember: undefined,
});
const boostedSquad = generateTestSquad({
  id: 'boosted-squad',
  handle: 'boosted',
  name: 'Boosted squad',
  currentMember: undefined,
});
const query = { isPublic: true, featured: true, first: 10 };

const logEvent = jest.fn();

const renderComponent = (): { client: QueryClient } => {
  const client = new QueryClient();
  client.setQueryData(
    generateQueryKey(
      RequestKey.Sources,
      undefined,
      query.featured,
      query.isPublic,
      undefined,
      query.first,
    ),
    {
      pages: [
        {
          sources: {
            edges: [{ node: organicSquad }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      ],
      pageParams: [''],
    },
  );
  [organicSquad, boostedSquad].forEach(({ id }) =>
    client.setQueryData(
      generateQueryKey(RequestKey.ContentPreference, loggedUser, {
        id,
        entity: ContentPreferenceType.Source,
      }),
      null,
    ),
  );

  nock('http://localhost:3000')
    .get('/v1/a/squads_directory')
    .query(true)
    .reply(
      200,
      [
        {
          source: 'booster',
          providerId: 'Direct',
          pixel: ['https://pixel.test/impression'],
          data: {
            source: { ...boostedSquad, flags: { campaignId: 'campaign' } },
          },
        },
      ],
      { 'x-generation-id': 'gen-1' },
    );

  render(
    <TestBootProvider
      client={client}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <SquadsDirectoryFeed
        title={{ copy: 'Featured' }}
        linkToSeeAll="/squads/discover/featured"
        query={query}
        firstItemShouldBeAd
      />
    </TestBootProvider>,
  );

  return { client };
};

const getRow = (name: string): HTMLElement =>
  screen.getByText(name).closest('.group\\/squad-row') as HTMLElement;

const joinFromRow = async (squad: Squad): Promise<Record<string, unknown>> => {
  mockGraphQL({
    request: { query: SQUAD_JOIN_MUTATION, variables: { sourceId: squad.id } },
    result: { data: { source: squad } },
  });
  mockGraphQL(completeActionMock({ action: ActionType.JoinSquad }));
  logEvent.mockClear();

  within(getRow(squad.name)).getByText('Join').click();

  let extra: Record<string, unknown> = {};
  await waitFor(() => {
    const call = logEvent.mock.calls.find(
      ([event]) => event.event_name === LogEvent.CompleteJoiningSquad,
    );
    expect(call).toBeTruthy();
    extra = JSON.parse(call[0].extra);
  });

  return extra;
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  window.sessionStorage.clear();
});

const mockBoostedSquad = (): void =>
  mockGraphQL({
    request: { query: SQUAD_QUERY, variables: { handle: 'boosted' } },
    // Private, so loading it skips the top members request.
    result: { data: { source: { ...boostedSquad, public: false } } },
  });

it('should credit only the boosted squad with the ad', async () => {
  mockBoostedSquad();
  renderComponent();

  await screen.findByText('Boosted squad');
  expect(
    within(getRow('Boosted squad')).getByTestId('pixel'),
  ).toBeInTheDocument();
  expect(
    within(getRow('Organic squad')).queryByTestId('pixel'),
  ).not.toBeInTheDocument();

  expect(await joinFromRow(organicSquad)).not.toHaveProperty('gen_id');
  expect(await joinFromRow(boostedSquad)).toMatchObject({
    gen_id: 'gen-1',
    referrer_target_id: boostedSquad.id,
  });
});

it('should promote nothing when the boosted squad does not load', async () => {
  mockGraphQL({
    request: { query: SQUAD_QUERY, variables: { handle: 'boosted' } },
    result: { errors: [{ message: 'not found' }] },
  });
  const { client } = renderComponent();

  await waitFor(() =>
    expect(
      client.getQueryState(
        generateQueryKey(RequestKey.Squad, loggedUser, 'boosted'),
      )?.status,
    ).toBe('error'),
  );
  expect(screen.queryByTestId('pixel')).not.toBeInTheDocument();
  expect(await joinFromRow(organicSquad)).not.toHaveProperty('gen_id');
});

it('should log a click on the promoted card and remember it for a later join', async () => {
  mockBoostedSquad();
  renderComponent();

  await screen.findByText('Boosted squad');
  within(getRow('Boosted squad')).getByTitle('Boosted squad').click();

  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_name: LogEvent.Click, target_type: 'ad' }),
  );
  expect(consumeSquadBoostClick('organic-squad')).toBeUndefined();
  expect(consumeSquadBoostClick('boosted-squad')).toBe('gen-1');
});

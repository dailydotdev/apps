import React from 'react';
import type { ReactNode } from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../__tests__/helpers/graphql';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { generateTestSquad } from '../../__tests__/fixture/squads';
import { ActionType } from '../graphql/actions';
import type { Ad } from '../graphql/posts';
import type { Squad } from '../graphql/sources';
import { SQUAD_JOIN_MUTATION } from '../graphql/squads';
import { LogEvent } from '../lib/log';
import {
  SQUAD_BOOST_CLICK_TTL_MS,
  storeSquadBoostClick,
} from '../features/monetization/squadBoostClick';
import { useJoinSquad } from './useJoinSquad';

const boostedSquad = generateTestSquad({
  id: 'boosted-squad',
  handle: 'boosted',
  currentMember: undefined,
});
const otherSquad = generateTestSquad({
  id: 'other-squad',
  handle: 'other',
  currentMember: undefined,
});
const boostAd = {
  source: 'booster',
  generationId: 'gen-1',
  data: { source: boostedSquad },
} as Ad;

const logEvent = jest.fn();

const joinSquad = async (squad: Squad): Promise<Record<string, unknown>> => {
  mockGraphQL({
    request: { query: SQUAD_JOIN_MUTATION, variables: { sourceId: squad.id } },
    result: { data: { source: squad } },
  });
  mockGraphQL(completeActionMock({ action: ActionType.JoinSquad }));

  const client = new QueryClient();
  const { result } = renderHook(() => useJoinSquad({ squad }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TestBootProvider
        client={client}
        auth={{ user: loggedUser }}
        log={{ logEvent }}
      >
        {children}
      </TestBootProvider>
    ),
  });

  logEvent.mockClear();
  await result.current();

  const [event] = logEvent.mock.calls.find(
    ([call]) => call.event_name === LogEvent.CompleteJoiningSquad,
  );

  return JSON.parse(event.extra);
};

beforeEach(() => {
  nock.cleanAll();
  jest.restoreAllMocks();
  window.sessionStorage.clear();
});

it('should credit a boost click only to a join of the clicked squad, once', async () => {
  storeSquadBoostClick(boostAd);

  expect(await joinSquad(otherSquad)).not.toHaveProperty('gen_id');
  expect(await joinSquad(boostedSquad)).toMatchObject({
    gen_id: 'gen-1',
    referrer_target_id: boostedSquad.id,
    referrer_target_type: 'source',
  });
  expect(await joinSquad(boostedSquad)).not.toHaveProperty('gen_id');
});

it('should not credit a boost click older than the attribution window', async () => {
  const clickedAt = Date.now();
  jest.spyOn(Date, 'now').mockReturnValue(clickedAt);
  storeSquadBoostClick(boostAd);
  jest
    .spyOn(Date, 'now')
    .mockReturnValue(clickedAt + SQUAD_BOOST_CLICK_TTL_MS + 1);

  expect(await joinSquad(boostedSquad)).not.toHaveProperty('gen_id');
});

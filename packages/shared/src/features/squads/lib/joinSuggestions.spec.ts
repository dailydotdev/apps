import { QueryClient } from '@tanstack/react-query';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import { Origin } from '../../../lib/log';
import {
  markSquadJoinSuggestionsShown,
  muteSquadJoinSuggestions,
  SQUAD_JOIN_SUGGESTIONS_KEY,
  SQUAD_JOIN_SUGGESTIONS_MUTE_MS,
  suggestSquadsAfterJoin,
} from './joinSuggestions';

const squad = generateTestSquad();

const suggest = (origin = Origin.Feed) => {
  const client = new QueryClient();
  suggestSquadsAfterJoin(client, { squad, origin });

  return client.getQueryData(SQUAD_JOIN_SUGGESTIONS_KEY);
};

beforeEach(() => {
  jest.useRealTimers();
  window.sessionStorage.clear();
  window.localStorage.clear();
});

it('should suggest squads after a join', () => {
  expect(suggest()).toEqual({ squad, origin: Origin.Feed });
});

it('should suggest squads once a session', () => {
  markSquadJoinSuggestionsShown();

  expect(suggest()).toBeUndefined();
});

it('should stay quiet for a week after a dismiss', () => {
  jest.useFakeTimers();
  muteSquadJoinSuggestions();
  jest.advanceTimersByTime(SQUAD_JOIN_SUGGESTIONS_MUTE_MS - 1000);

  expect(suggest()).toBeUndefined();

  jest.advanceTimersByTime(2000);

  expect(suggest()).toEqual({ squad, origin: Origin.Feed });
});

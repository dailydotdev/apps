import type { QueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import { Origin } from '../../../lib/log';
import { storageWrapper } from '../../../lib/storageWrapper';

export const SQUAD_JOIN_SUGGESTIONS_KEY = ['squad_join_suggestions'];
const SHOWN_KEY = 'squad_join_suggestions_shown';
const MUTED_UNTIL_KEY = 'squad_join_suggestions_muted_until';
export const SQUAD_JOIN_SUGGESTIONS_MUTE_MS = 7 * 24 * 60 * 60 * 1000;

export interface SquadJoinSuggestion {
  squad: Squad;
  /** Where the join happened. */
  origin: Origin;
}

// Lists of squads already suggest more, and suggestions don't chain
const quietOrigins = new Set<Origin>([
  Origin.SquadDirectory,
  Origin.SimilarSquads,
  Origin.SimilarSquadsPromoted,
  Origin.SquadJoinSuggestions,
  Origin.SquadJoinSuggestionsPromoted,
]);

const wasShownThisSession = (): boolean => {
  try {
    return !!window.sessionStorage.getItem(SHOWN_KEY);
  } catch {
    return false;
  }
};

const isMuted = (): boolean =>
  Number(storageWrapper.getItem(MUTED_UNTIL_KEY)) > Date.now();

export const markSquadJoinSuggestionsShown = (): void => {
  try {
    window.sessionStorage.setItem(SHOWN_KEY, '1');
  } catch {
    // Storage blocked, so the cap falls back to the mute after a dismiss
  }
};

export const muteSquadJoinSuggestions = (): void =>
  storageWrapper.setItem(
    MUTED_UNTIL_KEY,
    String(Date.now() + SQUAD_JOIN_SUGGESTIONS_MUTE_MS),
  );

/** Opens the suggestions after a join, once a session at most. */
export const suggestSquadsAfterJoin = (
  queryClient: QueryClient,
  suggestion: SquadJoinSuggestion,
): void => {
  if (
    quietOrigins.has(suggestion.origin) ||
    wasShownThisSession() ||
    isMuted()
  ) {
    return;
  }

  queryClient.setQueryData(SQUAD_JOIN_SUGGESTIONS_KEY, suggestion);
};

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { SquadJoinSuggestion } from '../lib/joinSuggestions';
import { SQUAD_JOIN_SUGGESTIONS_KEY } from '../lib/joinSuggestions';

export const useSquadJoinSuggestion = () => {
  const client = useQueryClient();
  const getSuggestion = () =>
    client.getQueryData<SquadJoinSuggestion | null>(
      SQUAD_JOIN_SUGGESTIONS_KEY,
    ) ?? null;
  const { data: suggestion } = useQuery<SquadJoinSuggestion | null>({
    queryKey: SQUAD_JOIN_SUGGESTIONS_KEY,
    queryFn: getSuggestion,
    initialData: getSuggestion,
  });
  const closeSuggestion = useCallback(
    () => client.setQueryData(SQUAD_JOIN_SUGGESTIONS_KEY, null),
    [client],
  );

  return { suggestion, closeSuggestion };
};

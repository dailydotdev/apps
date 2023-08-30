import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { getSearchSuggestions } from '../../graphql/search';
import { SearchBarSuggestionListProps } from '../../components/search/SearchBarSuggestionList';
import { disabledRefetch } from '../../lib/func';

type UseSearchSuggestions = (data: {
  origin: SearchBarSuggestionListProps['origin'];
}) => Pick<
  SearchBarSuggestionListProps,
  'origin' | 'suggestions' | 'isLoading'
>;

export const useSearchSuggestions: UseSearchSuggestions = (args) => {
  const { user } = useAuthContext();
  const { data, isLoading } = useQuery(
    generateQueryKey(RequestKey.SearchHistory, user),
    getSearchSuggestions,
    {
      ...disabledRefetch,
    },
  );

  const suggestions = useMemo(
    () =>
      data?.map(({ question }) => ({
        prompt: question,
      })),
    [data],
  );

  return { isLoading, suggestions, ...args };
};

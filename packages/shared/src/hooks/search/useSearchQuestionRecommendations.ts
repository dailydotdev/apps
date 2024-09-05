import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { SearchBarSuggestionListProps } from '../../components/search/SearchBarSuggestionList';
import { useAuthContext } from '../../contexts/AuthContext';
import { getSearchSuggestions } from '../../graphql/search';
import { disabledRefetch } from '../../lib/func';
import { generateQueryKey, RequestKey } from '../../lib/query';

type UseSearchQuestionRecommendations = (data: {
  origin: SearchBarSuggestionListProps['origin'];
  disabled?: boolean;
}) => Pick<
  SearchBarSuggestionListProps,
  'origin' | 'suggestions' | 'isLoading'
>;

export const useSearchQuestionRecommendations: UseSearchQuestionRecommendations =
  ({ disabled, ...args }) => {
    const { user } = useAuthContext();
    const { data, isLoading } = useQuery(
      generateQueryKey(RequestKey.SearchHistory, user),
      getSearchSuggestions,
      { ...disabledRefetch, enabled: !disabled && !!user },
    );

    const suggestions = useMemo(
      () =>
        data?.map(({ id, question }) => ({
          id,
          question,
        })),
      [data],
    );

    return { isLoading, suggestions, ...args };
  };

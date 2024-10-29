import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { getSearchSuggestions } from '../../graphql/search';
import { SearchBarSuggestionListProps } from '../../components/search/SearchBarSuggestionList';
import { disabledRefetch } from '../../lib/func';

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
    const { data, isPending } = useQuery({
      queryKey: generateQueryKey(RequestKey.SearchHistory, user),
      queryFn: getSearchSuggestions,
      ...disabledRefetch,
      enabled: !disabled && !!user,
    });

    const suggestions = useMemo(
      () =>
        data?.map(({ id, question }) => ({
          id,
          question,
        })),
      [data],
    );

    return { isLoading: isPending, suggestions, ...args };
  };

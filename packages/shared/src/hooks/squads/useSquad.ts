import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import type { ClientError } from 'graphql-request';
import type { Squad } from '../../graphql/sources';
import { getSquad } from '../../graphql/squads';
import type { ApiErrorResult } from '../../graphql/common';
import { ApiError, getApiError } from '../../graphql/common';
import AuthContext from '../../contexts/AuthContext';
import { isNullOrUndefined } from '../../lib/func';
import { generateQueryKey, RequestKey } from '../../lib/query';

interface UseSquadProps {
  handle: string;
}

interface UseSquad {
  squad: Squad;
  isForbidden: boolean;
  isLoading: boolean;
  isFetched: boolean;
}

export const useSquad = ({ handle }: UseSquadProps): UseSquad => {
  const { isFetched: isBootFetched, user } = useContext(AuthContext);
  const queryKey = generateQueryKey(RequestKey.Squad, user, handle);
  const {
    data: squad,
    isLoading,
    isFetched,
    error,
  } = useQuery<Squad, ClientError>({
    queryKey,
    queryFn: () => getSquad(handle),
    enabled: isBootFetched && !!handle,
    retry: false,
  });

  return {
    squad,
    isLoading,
    isFetched,
    isForbidden: isNullOrUndefined(error)
      ? false
      : !!getApiError(error as ApiErrorResult, ApiError.Forbidden),
  };
};

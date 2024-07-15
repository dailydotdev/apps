import { useQuery } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import { useContext } from 'react';
import { Squad } from '../../graphql/sources';
import { getSquad } from '../../graphql/squads';
import { ApiError, ApiErrorResult, getApiError } from '../../graphql/common';
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
  } = useQuery<Squad, ClientError>(queryKey, () => getSquad(handle), {
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

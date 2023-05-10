import { useQuery } from 'react-query';
import { useMemo } from 'react';
import { useRequestProtocol } from './useRequestProtocol';
import { GET_USERNAME_SUGGESTION } from '../graphql/users';
import { graphqlUrl } from '../lib/config';

interface UseGenerateUsernameData {
  generateUniqueUsername: string;
}

interface UseGenerateUsername {
  data?: UseGenerateUsernameData;
  isLoading: boolean;
}

export const useGenerateUsername = (name: string): UseGenerateUsername => {
  const { requestMethod } = useRequestProtocol();
  const usernameQueryKey = ['generateUsername', name];
  const { data, isLoading } = useQuery<{
    generateUniqueUsername: string;
  }>(
    usernameQueryKey,
    () =>
      requestMethod(
        graphqlUrl,
        GET_USERNAME_SUGGESTION,
        { name },
        { requestKey: JSON.stringify(usernameQueryKey) },
      ),
    {
      enabled: !!name.length,
    },
  );
  return useMemo(
    () => ({
      data,
      isLoading,
    }),
    [data, isLoading],
  );
};

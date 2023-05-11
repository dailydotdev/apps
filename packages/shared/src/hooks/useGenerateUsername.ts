import { useQuery } from 'react-query';
import { useState, useEffect, useMemo } from 'react';
import { useRequestProtocol } from './useRequestProtocol';
import { GET_USERNAME_SUGGESTION } from '../graphql/users';
import { graphqlUrl } from '../lib/config';

interface UseGenerateUsername {
  username?: string;
  setUsername: (value: string) => void;
}

export const useGenerateUsername = (name: string): UseGenerateUsername => {
  const [username, setUsername] = useState('');
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

  useEffect(() => {
    if (username.length || isLoading) return;

    if (data?.generateUniqueUsername) {
      setUsername(data.generateUniqueUsername);
    }
  }, [data, isLoading, username]);

  return useMemo(
    () => ({
      username,
      setUsername,
    }),
    [username, setUsername],
  );
};

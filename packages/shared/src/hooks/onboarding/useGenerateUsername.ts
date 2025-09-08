import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { useRequestProtocol } from '../useRequestProtocol';
import { GET_USERNAME_SUGGESTION } from '../../graphql/users';
import { StaleTime } from '../../lib/query';
import { disabledRefetch } from '../../lib/func';

interface UseGenerateUsername {
  username?: string;
  setUsername: (value: string) => void;
  isLoading: boolean;
}

export const useGenerateUsername = (
  name: string | undefined,
): UseGenerateUsername => {
  const [username, setUsername] = useState('');
  const usernameRef = useRef(false);
  const { requestMethod } = useRequestProtocol();
  const usernameQueryKey = ['generateUsername', name];
  const { data, isLoading } = useQuery<{
    generateUniqueUsername: string;
  }>({
    queryKey: usernameQueryKey,
    queryFn: () =>
      requestMethod(
        GET_USERNAME_SUGGESTION,
        { name },
        { requestKey: JSON.stringify(usernameQueryKey) },
      ),
    enabled: !!name?.length && usernameRef.current !== true,
    staleTime: StaleTime.Default,
    ...disabledRefetch,
  });

  useEffect(() => {
    if (data?.generateUniqueUsername && !usernameRef.current) {
      usernameRef.current = true;
      setUsername(data.generateUniqueUsername);
    }
  }, [data?.generateUniqueUsername]);

  return {
    username,
    setUsername,
    isLoading,
  };
};

import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { GET_USERNAME_SUGGESTION } from '../graphql/users';
import { useRequestProtocol } from './useRequestProtocol';

interface UseGenerateUsername {
  username?: string;
  setUsername: (value: string) => void;
}

export const useGenerateUsername = (
  name: string | undefined,
): UseGenerateUsername => {
  const [username, setUsername] = useState('');
  const usernameRef = useRef(false);
  const { requestMethod } = useRequestProtocol();
  const usernameQueryKey = ['generateUsername', name];
  const { data } = useQuery<{
    generateUniqueUsername: string;
  }>(
    usernameQueryKey,
    () =>
      requestMethod(
        GET_USERNAME_SUGGESTION,
        { name },
        { requestKey: JSON.stringify(usernameQueryKey) },
      ),
    {
      enabled: !!name?.length && usernameRef.current !== true,
    },
  );

  if (data?.generateUniqueUsername && !usernameRef.current) {
    usernameRef.current = true;

    if (!username.length) {
      setUsername(data.generateUniqueUsername);
    }
  }

  return {
    username,
    setUsername,
  };
};

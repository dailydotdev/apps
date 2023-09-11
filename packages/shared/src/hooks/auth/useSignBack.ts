import { useMemo } from 'react';
import usePersistentContext from '../usePersistentContext';
import { generateStorageKey, RequestKey } from '../../lib/query';
import { SocialProvider } from '../../components/auth/common';
import { LoggedUser } from '../../lib/user';

export const SIGNIN_METHOD_KEY = 'signin_method';

export const signBackKey = generateStorageKey(
  RequestKey.Auth,
  SIGNIN_METHOD_KEY,
);

export type SignedInUser = Pick<LoggedUser, 'name' | 'email' | 'image'>;
export type SignBackProvider = SocialProvider | 'password';

interface UseSignBack {
  isLoaded: boolean;
  signBack?: SignedInUser;
  provider?: SignBackProvider;
  onLogin: (user: LoggedUser, provider: SignBackProvider) => void;
}

export const useSignBack = (): UseSignBack => {
  const [signBack, setSignBack, isLoaded] =
    usePersistentContext<SignedInUser>(signBackKey);

  return {
    onLogin: ({ name, email, image }, provider) => {
      setSignBack({ name, email, image });
      globalThis?.localStorage.setItem(SIGNIN_METHOD_KEY, provider);
    },
    signBack,
    isLoaded,
    provider: useMemo(
      () =>
        globalThis?.localStorage?.getItem(
          SIGNIN_METHOD_KEY,
        ) as SignBackProvider,
      [],
    ),
  };
};

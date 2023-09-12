import { useCallback, useMemo } from 'react';
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
  onLogin: (user: SignedInUser, provider: SignBackProvider) => Promise<void>;
}

export const useSignBack = (): UseSignBack => {
  const [signBack, setSignBack, isLoaded] =
    usePersistentContext<SignedInUser>(signBackKey);

  const onLogin: UseSignBack['onLogin'] = useCallback(
    ({ name, email, image }, provider) => {
      globalThis?.localStorage.setItem(
        SIGNIN_METHOD_KEY,
        provider.toLowerCase(),
      );
      return setSignBack({ name, email, image });
    },
    [setSignBack],
  );

  return {
    onLogin,
    signBack,
    isLoaded,
    provider: useMemo(
      () =>
        globalThis?.localStorage
          ?.getItem(SIGNIN_METHOD_KEY)
          ?.toLowerCase() as SignBackProvider,
      [],
    ),
  };
};

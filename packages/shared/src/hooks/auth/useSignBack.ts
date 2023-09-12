import { useCallback, useMemo } from 'react';
import usePersistentContext from '../usePersistentContext';
import { generateStorageKey, RequestKey } from '../../lib/query';
import { SocialProvider } from '../../components/auth/common';
import { LoggedUser } from '../../lib/user';
import { isNullOrUndefined } from '../../lib/func';

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
  onUpdateSignBack: (
    user: SignedInUser,
    provider: SignBackProvider,
  ) => Promise<void>;
}

export const useSignBack = (): UseSignBack => {
  const [signBack, setSignBack, isLoaded] =
    usePersistentContext<SignedInUser>(signBackKey);

  const onUpdateSignBack: UseSignBack['onUpdateSignBack'] = useCallback(
    (user, provider) => {
      if (isNullOrUndefined(provider)) {
        globalThis?.localStorage.removeItem(SIGNIN_METHOD_KEY);
      } else {
        globalThis?.localStorage.setItem(
          SIGNIN_METHOD_KEY,
          provider.toLowerCase(),
        );
      }

      if (isNullOrUndefined(user)) {
        return setSignBack(undefined);
      }

      const { name, email, image } = user;
      return setSignBack({ name, email, image });
    },
    [setSignBack],
  );

  return {
    onUpdateSignBack,
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

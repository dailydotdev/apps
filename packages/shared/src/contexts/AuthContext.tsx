import React, { ReactElement, ReactNode, useMemo, useState } from 'react';
import {
  AnonymousUser,
  LoggedUser,
  logout as dispatchLogout,
  deleteAccount,
} from '../lib/user';
import { Visit } from '../lib/boot';

export type LoginState = { trigger: string };

export interface AuthContextData {
  user?: LoggedUser;
  referral?: string;
  trackingId?: string;
  shouldShowLogin: boolean;
  showLogin: (trigger: string) => void;
  closeLogin: () => void;
  loginState?: LoginState;
  logout: () => Promise<void>;
  updateUser: (user: LoggedUser) => Promise<void>;
  loadingUser?: boolean;
  isFetched?: boolean;
  tokenRefreshed: boolean;
  loadedUserFromCache?: boolean;
  getRedirectUri: () => string;
  anonymous?: AnonymousUser;
  visit?: Visit;
  isFirstVisit?: boolean;
  deleteAccount?: () => Promise<void>;
  refetchBoot?: () => Promise<unknown>;
}
const isExtension = process.env.TARGET_BROWSER;
const AuthContext = React.createContext<AuthContextData>(null);
export default AuthContext;

export const getQueryParams = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  return params;
};

export const REGISTRATION_PATH = '/register';

const logout = async (): Promise<void> => {
  await dispatchLogout();
  const params = getQueryParams();
  if (params.redirect_uri) {
    window.location.replace(params.redirect_uri);
  } else if (window.location.pathname === REGISTRATION_PATH) {
    window.location.replace(process.env.NEXT_PUBLIC_WEBAPP_URL);
  }

  if (isExtension) {
    window.location.reload();
  } else {
    window.location.replace('/');
  }
};

export type AuthContextProviderProps = {
  user: LoggedUser | AnonymousUser | undefined;
  isFetched?: boolean;
  isLegacyLogout?: boolean;
  firstLoad?: boolean;
  refetchBoot?: () => Promise<unknown>;
  children?: ReactNode;
} & Pick<
  AuthContextData,
  | 'getRedirectUri'
  | 'updateUser'
  | 'loadingUser'
  | 'tokenRefreshed'
  | 'loadedUserFromCache'
  | 'visit'
>;

export const AuthContextProvider = ({
  children,
  user,
  updateUser,
  isFetched,
  loadingUser,
  tokenRefreshed,
  loadedUserFromCache,
  getRedirectUri,
  refetchBoot,
  visit,
  isLegacyLogout,
  firstLoad,
}: AuthContextProviderProps): ReactElement => {
  const [loginState, setLoginState] = useState<LoginState | null>(null);
  const endUser = user && 'providers' in user ? user : null;
  const referral = user?.referrer;

  if (firstLoad === true && endUser && !endUser?.infoConfirmed) {
    logout();
  }

  if (isLegacyLogout && !loginState) {
    setLoginState({ trigger: 'legacy_logout' });
  }

  const authContext: AuthContextData = useMemo(
    () => ({
      user: endUser,
      referral,
      isFirstVisit: user?.isFirstVisit ?? false,
      trackingId: user?.id,
      shouldShowLogin: loginState !== null,
      showLogin: (trigger) => {
        const hasCompanion = !!document.querySelector('daily-companion-app');
        if (hasCompanion) {
          const signup = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/signup?close=true`;
          window.open(signup);
        } else {
          setLoginState({ trigger });
        }
      },
      closeLogin: () => setLoginState(null),
      loginState,
      updateUser,
      logout,
      loadingUser,
      tokenRefreshed,
      loadedUserFromCache,
      getRedirectUri,
      anonymous: user,
      visit,
      isFetched,
      refetchBoot,
      deleteAccount,
    }),
    [
      user,
      loginState,
      isFetched,
      loadingUser,
      tokenRefreshed,
      loadedUserFromCache,
      visit,
    ],
  );

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

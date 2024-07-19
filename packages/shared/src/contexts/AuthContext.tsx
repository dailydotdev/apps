import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { QueryObserverResult } from '@tanstack/react-query';
import {
  AnonymousUser,
  deleteAccount,
  LoggedUser,
  logout as dispatchLogout,
  LogoutReason,
} from '../lib/user';
import { AccessToken, Boot, Visit } from '../lib/boot';
import { isCompanionActivated } from '../lib/element';
import { AuthTriggers, AuthTriggersType } from '../lib/auth';
import { Squad } from '../graphql/sources';
import { checkIsExtension, isNullOrUndefined } from '../lib/func';

export interface LoginState {
  trigger: AuthTriggersType;
  formValues?: {
    email?: string;
  };
  referral?: string;
  referralOrigin?: string;
  onLoginSuccess?: () => void;
  onRegistrationSuccess?: (user?: LoggedUser | AnonymousUser) => void;
  isLogin?: boolean;
}

type LoginOptions = Omit<LoginState, 'trigger'>;

type ShowLoginParams = {
  trigger: AuthTriggersType;
  options?: LoginOptions;
};

export interface AuthContextData {
  user?: LoggedUser;
  isLoggedIn: boolean;
  referral?: string;
  referralOrigin?: string;
  trackingId?: string;
  shouldShowLogin: boolean;
  showLogin: ({ trigger, options }: ShowLoginParams) => void;
  closeLogin: () => void;
  loginState?: LoginState;
  logout: (reason: string) => Promise<void>;
  updateUser: (user: LoggedUser) => Promise<void>;
  loadingUser?: boolean;
  isFetched?: boolean;
  tokenRefreshed: boolean;
  loadedUserFromCache?: boolean;
  getRedirectUri: () => string;
  anonymous?: AnonymousUser;
  visit?: Visit;
  firstVisit?: string;
  deleteAccount?: () => Promise<void>;
  refetchBoot?: () => Promise<QueryObserverResult<Boot>>;
  accessToken?: AccessToken;
  squads?: Squad[];
  isAuthReady?: boolean;
}
const isExtension = checkIsExtension();
const AuthContext = React.createContext<AuthContextData>(null);
export const useAuthContext = (): AuthContextData => useContext(AuthContext);
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

const logout = async (reason: string): Promise<void> => {
  await dispatchLogout(reason);
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
  user?: LoggedUser | AnonymousUser;
  isFetched?: boolean;
  isLegacyLogout?: boolean;
  firstLoad?: boolean;
  refetchBoot?: () => Promise<QueryObserverResult<Boot>>;
  children?: ReactNode;
} & Pick<
  AuthContextData,
  | 'getRedirectUri'
  | 'updateUser'
  | 'loadingUser'
  | 'tokenRefreshed'
  | 'loadedUserFromCache'
  | 'visit'
  | 'accessToken'
  | 'squads'
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
  accessToken,
  squads,
}: AuthContextProviderProps): ReactElement => {
  const [loginState, setLoginState] = useState<LoginState | null>(null);
  const endUser = user && 'providers' in user ? user : null;
  const referral = user?.referralId || user?.referrer;
  const referralOrigin = user?.referralOrigin;

  if (firstLoad === true && endUser && !endUser?.infoConfirmed) {
    logout(LogoutReason.IncomleteOnboarding);
  }

  if (isLegacyLogout && !loginState) {
    setLoginState({ trigger: AuthTriggers.LegacyLogout });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthReady: !isNullOrUndefined(firstLoad),
        user: endUser,
        isLoggedIn: !!endUser?.id,
        referral: loginState?.referral ?? referral,
        referralOrigin: loginState?.referralOrigin ?? referralOrigin,
        firstVisit: user?.firstVisit,
        trackingId: user?.id,
        shouldShowLogin: loginState !== null,
        showLogin: useCallback(({ trigger, options = {} }) => {
          const hasCompanion = !!isCompanionActivated();
          if (hasCompanion) {
            const signup = `${process.env.NEXT_PUBLIC_WEBAPP_URL}signup?close=true`;
            window.open(signup);
          } else {
            setLoginState({ ...options, trigger });
          }
        }, []),
        closeLogin: useCallback(() => setLoginState(null), []),
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
        accessToken,
        squads,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { ReactElement, ReactNode, useMemo, useState } from 'react';
import {
  AnonymousUser,
  LoggedUser,
  logout as dispatchLogout,
  deleteAccount as dispatchDeleteAccount,
} from '../lib/user';
import { LoginModalMode } from '../types/LoginModalMode';
import { Visit } from '../lib/boot';

export type LoginState = { mode: LoginModalMode; trigger: string };

export interface AuthContextData {
  user?: LoggedUser;
  trackingId?: string;
  shouldShowLogin: boolean;
  showLogin: (trigger: string, mode?: LoginModalMode) => void;
  closeLogin: () => void;
  loginState?: LoginState;
  logout: () => Promise<void>;
  updateUser: (user: LoggedUser) => Promise<void>;
  loadingUser?: boolean;
  tokenRefreshed: boolean;
  loadedUserFromCache?: boolean;
  getRedirectUri: () => string;
  anonymous?: AnonymousUser;
  visit?: Visit;
  deleteAccount?: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextData>(null);
export default AuthContext;

const logout = async (): Promise<void> => {
  await dispatchLogout();
  window.location.reload();
};

const deleteAccount = async (): Promise<void> => {
  await dispatchDeleteAccount();
};

export type AuthContextProviderProps = {
  user: LoggedUser | AnonymousUser | undefined;
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
  loadingUser,
  tokenRefreshed,
  loadedUserFromCache,
  getRedirectUri,
  visit,
}: AuthContextProviderProps): ReactElement => {
  const [loginState, setLoginState] = useState<LoginState | null>(null);

  const authContext: AuthContextData = useMemo(
    () => ({
      user: user && 'providers' in user ? user : null,
      trackingId: user?.id,
      shouldShowLogin: loginState !== null,
      showLogin: (trigger, mode = LoginModalMode.Default) =>
        setLoginState({ trigger, mode }),
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
      deleteAccount,
    }),
    [user, loginState, loadingUser, tokenRefreshed, loadedUserFromCache, visit],
  );

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

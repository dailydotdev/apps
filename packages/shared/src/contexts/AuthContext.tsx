import React, { ReactElement, ReactNode, useMemo, useState } from 'react';
import {
  AnonymousUser,
  LoggedUser,
  logout as dispatchLogout,
} from '../lib/user';
import { LoginModalMode } from '../types/LoginModalMode';
import useLoggedUser from '../hooks/useLoggedUser';

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
}

const AuthContext = React.createContext<AuthContextData>(null);
export default AuthContext;

const logout = async (): Promise<void> => {
  await dispatchLogout();
  window.location.reload();
};

export type AuthContextProviderProps = {
  app: string;
  getRedirectUri: () => string;
  children?: ReactNode;
};

export const AuthContextProvider = ({
  app,
  children,
  getRedirectUri,
}: AuthContextProviderProps): ReactElement => {
  const [
    user,
    setUser,
    anonymous,
    loadingUser,
    tokenRefreshed,
    loadedUserFromCache,
  ] = useLoggedUser(app);
  const [loginState, setLoginState] = useState<LoginState | null>(null);

  const authContext: AuthContextData = useMemo(
    () => ({
      user,
      trackingId: anonymous?.id,
      shouldShowLogin: loginState !== null,
      showLogin: (trigger, mode = LoginModalMode.Default) =>
        setLoginState({ trigger, mode }),
      closeLogin: () => setLoginState(null),
      loginState,
      updateUser: setUser,
      logout,
      loadingUser,
      tokenRefreshed,
      loadedUserFromCache,
      getRedirectUri,
      anonymous,
    }),
    [
      user,
      anonymous,
      loginState,
      loadingUser,
      tokenRefreshed,
      loadedUserFromCache,
    ],
  );

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

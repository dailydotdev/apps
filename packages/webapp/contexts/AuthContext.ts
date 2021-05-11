import React from 'react';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { LoginModalMode } from '../components/modals/LoginModal';

export interface AuthContextData {
  user: LoggedUser;
  shouldShowLogin: boolean;
  showLogin: (mode?: LoginModalMode) => void;
  logout: () => Promise<void>;
  updateUser: (user: LoggedUser) => Promise<void>;
  loadingUser?: boolean;
  tokenRefreshed: boolean;
  loadedUserFromCache?: boolean;
}

const AuthContext = React.createContext<AuthContextData>(null);
export default AuthContext;

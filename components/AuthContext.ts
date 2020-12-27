import React from 'react';
import { LoggedUser } from '../lib/user';

export interface AuthContextData {
  user: LoggedUser;
  shouldShowLogin: boolean;
  showLogin: () => void;
  logout: () => Promise<void>;
  updateUser: (user: LoggedUser) => Promise<void>;
  loadingUser?: boolean;
  tokenRefreshed: boolean;
}

const AuthContext = React.createContext<AuthContextData>(null);
export default AuthContext;

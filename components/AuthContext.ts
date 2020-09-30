import React from 'react';
import { LoggedUser } from '../lib/user';

interface AuthContextData {
  user: LoggedUser;
  shouldShowLogin: boolean;
  showLogin: () => void;
  logout: () => Promise<void>;
  updateUser: (user: LoggedUser) => void;
  loadingUser?: boolean;
}

const AuthContext = React.createContext<AuthContextData>(null);
export default AuthContext;

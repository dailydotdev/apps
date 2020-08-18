import React from 'react';
import { LoggedUser } from '../lib/user';

interface AuthContextData {
  user: LoggedUser;
  shouldShowLogin: boolean;
  showLogin: () => void;
  showProfile: () => void;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextData>(null);
export default AuthContext;

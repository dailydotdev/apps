import React from 'react';
import { LoggedUser } from '../lib/user';

const UserContext = React.createContext<LoggedUser>(null);
export default UserContext;

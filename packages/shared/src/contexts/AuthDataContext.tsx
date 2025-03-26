import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';

interface AuthDataContextData {
  email: string;
  setEmail: (email: string) => void;
}

const AuthDataContext = createContext<AuthDataContextData | null>(null);

interface AuthDataProviderProps {
  children: ReactNode;
  initialEmail?: string;
}

export const AuthDataProvider = ({
  children,
  initialEmail = '',
}: AuthDataProviderProps): ReactElement => {
  const [email, setEmail] = useState(initialEmail);

  return (
    <AuthDataContext.Provider
      value={{
        email,
        setEmail,
      }}
    >
      {children}
    </AuthDataContext.Provider>
  );
};

export const useAuthData = (): AuthDataContextData => {
  const context = useContext(AuthDataContext);

  if (!context) {
    throw new Error('useAuthData must be used within an AuthDataProvider');
  }

  return context;
};

import { useEffect } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { closeDmTransports, isDmAvailable } from '../transport';

type UseMessagesEnabled = {
  isEnabled: boolean;
  // Signed in on a build without chat configured: pages redirect, an
  // anonymous visitor gets the sign-in wall instead.
  isGatedOut: boolean;
};

export const useMessagesEnabled = (): UseMessagesEnabled => {
  const { user, isAuthReady } = useAuthContext();
  const isLoggedIn = isAuthReady && !!user;
  const isEnabled = isLoggedIn && isDmAvailable;

  // Every surface that can open a chat session renders this hook, so logging
  // out here ends the session instead of leaving the socket up.
  useEffect(() => {
    if (isAuthReady && !user) {
      closeDmTransports();
    }
  }, [isAuthReady, user]);

  return {
    isEnabled,
    isGatedOut: isLoggedIn && !isDmAvailable,
  };
};

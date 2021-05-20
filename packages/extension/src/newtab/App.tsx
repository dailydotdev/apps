import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import dynamic from 'next/dynamic';
import Modal from 'react-modal';
import 'focus-visible';
import useLoggedUser from '@dailydotdev/shared/src/hooks/useLoggedUser';
import useProgressiveEnhancement from '@dailydotdev/shared/src/hooks/useProgressiveEnhancement';
import { LoginModalMode } from '@dailydotdev/shared/src/types/LoginModalMode';
import { logout as dispatchLogout } from '@dailydotdev/shared/src/lib/user';
import useOnboarding from '@dailydotdev/shared/src/hooks/useOnboarding';
import useSubscriptionClient from '@dailydotdev/shared/src/hooks/useSubscriptionClient';
import useSettings from '@dailydotdev/shared/src/hooks/useSettings';
import useAnalytics from '@dailydotdev/shared/src/hooks/useAnalytics';
import ProgressiveEnhancementContext from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import AuthContext, {
  AuthContextData,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import SubscriptionContext from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import { browser } from 'webextension-polyfill-ts';
import getPageForAnalytics from '../lib/getPageForAnalytics';

const router = new CustomRouter();
const queryClient = new QueryClient();
const LoginModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "loginModal"*/ '@dailydotdev/shared/src/components/modals/LoginModal'
    ),
);
const HelpUsGrowModal = dynamic(
  () => import('@dailydotdev/shared/src/components/modals/HelpUsGrowModal'),
);

Modal.setAppElement('#__next');
Modal.defaultStyles = {};

function InternalApp(): ReactElement {
  const [
    user,
    setUser,
    trackingId,
    loadingUser,
    tokenRefreshed,
    loadedUserFromCache,
  ] = useLoggedUser();
  const progressiveContext = useProgressiveEnhancement();
  const [loginMode, setLoginMode] = useState<LoginModalMode | null>(null);

  const closeLogin = () => setLoginMode(null);

  const logout = async (): Promise<void> => {
    await dispatchLogout();
    location.reload();
  };

  const authContext: AuthContextData = useMemo(
    () => ({
      user,
      shouldShowLogin: loginMode !== null,
      showLogin: (mode: LoginModalMode = LoginModalMode.Default) =>
        setLoginMode(mode),
      updateUser: setUser,
      logout,
      loadingUser,
      tokenRefreshed,
      loadedUserFromCache,
      getRedirectUri: () => browser.extension.getURL('index.html'),
    }),
    [user, loginMode, loadingUser, tokenRefreshed],
  );
  const canFetchUserData = progressiveContext.windowLoaded && tokenRefreshed;
  const onboardingContext = useOnboarding(user, loadedUserFromCache);
  const subscriptionContext = useSubscriptionClient(canFetchUserData);
  const settingsContext = useSettings(user?.id, canFetchUserData);
  // TODO: disable analytics until consent in ff
  useAnalytics(
    trackingId,
    user,
    false,
    progressiveContext.windowLoaded,
    `extension v${version}`,
    () => getPageForAnalytics(''),
  );

  useEffect(() => {
    if (user && !user.infoConfirmed) {
      window.location.replace(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}register?redirect_uri=${encodeURI(
          window.location.pathname,
        )}`,
      );
    }
  }, [user, loadingUser]);

  return (
    <ProgressiveEnhancementContext.Provider value={progressiveContext}>
      <AuthContext.Provider value={authContext}>
        <SubscriptionContext.Provider value={subscriptionContext}>
          <SettingsContext.Provider value={settingsContext}>
            <OnboardingContext.Provider value={onboardingContext}>
              <MainFeedPage />
              {!user &&
                !loadingUser &&
                (progressiveContext.windowLoaded || loginMode !== null) && (
                  <LoginModal
                    isOpen={loginMode !== null}
                    onRequestClose={closeLogin}
                    contentLabel="Login Modal"
                    mode={loginMode}
                  />
                )}
              {onboardingContext.showReferral && (
                <HelpUsGrowModal
                  isOpen={true}
                  onRequestClose={onboardingContext.closeReferral}
                />
              )}
            </OnboardingContext.Provider>
          </SettingsContext.Provider>
        </SubscriptionContext.Provider>
      </AuthContext.Provider>
    </ProgressiveEnhancementContext.Provider>
  );
}

export default function App(): ReactElement {
  return (
    <RouterContext.Provider value={router}>
      <QueryClientProvider client={queryClient}>
        <InternalApp />
      </QueryClientProvider>
    </RouterContext.Provider>
  );
}

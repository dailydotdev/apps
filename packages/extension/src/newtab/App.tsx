import React, { ReactElement, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import dynamic from 'next/dynamic';
import Modal from 'react-modal';
import 'focus-visible';
import useOnboarding from '@dailydotdev/shared/src/hooks/useOnboarding';
import useSettings from '@dailydotdev/shared/src/hooks/useSettings';
import useAnalytics from '@dailydotdev/shared/src/hooks/useAnalytics';
import ProgressiveEnhancementContext, {
  ProgressiveEnhancementContextProvider,
} from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';
import AuthContext, {
  AuthContextProvider,
} from '@dailydotdev/shared/src/contexts/AuthContext';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { SubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { FeaturesContextProvider } from '@dailydotdev/shared/src/contexts/FeaturesContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { RouterContext } from 'next/dist/next-server/lib/router-context';
import CustomRouter from '../lib/CustomRouter';
import { version } from '../../package.json';
import MainFeedPage from './MainFeedPage';
import { browser } from 'webextension-polyfill-ts';
import getPageForAnalytics from '../lib/getPageForAnalytics';
import DndContext from './DndContext';
import useDndContext from './useDndContext';
import DndBanner from './DndBanner';
import usePersistentState from '@dailydotdev/shared/src/hooks/usePersistentState';
import BellIcon from '@dailydotdev/shared/icons/bell.svg';
import useSettingsMigration from './useSettingsMigration';

const AnalyticsConsentModal = dynamic(() => import('./AnalyticsConsentModal'));
const MigrateSettingsModal = dynamic(() => import('./MigrateSettingsModal'));
const MigrationCompletedModal = dynamic(
  () => import('./MigrationCompletedModal'),
);

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

const shouldShowConsent = process.env.TARGET_BROWSER === 'firefox';

const syncSettingsNotification = (
  <div className="flex bg-theme-status-help text-theme-label-invert py-3 px-4 mt-6 rounded-xl">
    <BellIcon className="icon text-2xl" />
    <p className="ml-2 flex-1 typo-callout">
      We noticed that you filtered your feed or saved bookmarks (awesome!).
      Please sign up to automatically sync everything to your account.
    </p>
  </div>
);

const getRedirectUri = () => browser.runtime.getURL('index.html');

function InternalApp(): ReactElement {
  const {
    user,
    tokenRefreshed,
    loadedUserFromCache,
    trackingId,
    closeLogin,
    loadingUser,
    showLogin,
    shouldShowLogin,
    loginState,
  } = useContext(AuthContext);
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const [analyticsConsent, setAnalyticsConsent] = usePersistentState(
    'consent',
    false,
    shouldShowConsent ? null : true,
  );
  const dndContext = useDndContext();
  const canFetchUserData = windowLoaded && tokenRefreshed;
  const onboardingContext = useOnboarding(user, loadedUserFromCache);
  const settingsContext = useSettings(user?.id, canFetchUserData);
  const {
    hasSettings,
    postponeMigration,
    showMigrationModal,
    migrateAfterSignIn,
    migrate,
    isMigrating,
    migrationCompleted,
    ackMigrationCompleted,
    forceMigrationModal,
    postponed,
  } = useSettingsMigration(user, tokenRefreshed);

  useAnalytics(
    trackingId,
    user,
    analyticsConsent !== true,
    windowLoaded,
    `extension v${version}`,
    () => getPageForAnalytics(''),
  );

  useEffect(() => {
    if (tokenRefreshed && user && !user.infoConfirmed) {
      window.location.replace(
        `${process.env.NEXT_PUBLIC_WEBAPP_URL}register?redirect_uri=${encodeURI(
          browser.runtime.getURL('index.html'),
        )}`,
      );
    }
  }, [user, loadingUser, tokenRefreshed]);

  const onMigrationSignIn = async () => {
    await migrateAfterSignIn();
    showLogin('sync');
  };

  return (
    <DndContext.Provider value={dndContext}>
      <SettingsContext.Provider value={settingsContext}>
        <OnboardingContext.Provider value={onboardingContext}>
          {dndContext.isActive && <DndBanner />}
          <MainFeedPage
            forceMigrationModal={forceMigrationModal}
            postponedMigration={postponed}
          />
          {!user && !loadingUser && (windowLoaded || shouldShowLogin) && (
            <LoginModal
              isOpen={shouldShowLogin}
              onRequestClose={closeLogin}
              contentLabel="Login Modal"
              {...loginState}
            >
              {hasSettings && syncSettingsNotification}
            </LoginModal>
          )}
          {onboardingContext.showReferral && (
            <HelpUsGrowModal
              isOpen={true}
              onRequestClose={onboardingContext.closeReferral}
            />
          )}
          {analyticsConsent === null && (
            <AnalyticsConsentModal
              onDecline={() => setAnalyticsConsent(false)}
              onAccept={() => setAnalyticsConsent(true)}
              isOpen={true}
            />
          )}
          {showMigrationModal && (
            <MigrateSettingsModal
              isOpen={showMigrationModal}
              onLater={postponeMigration}
              onSignIn={onMigrationSignIn}
              onMerge={migrate}
              loading={isMigrating}
            />
          )}
          {migrationCompleted && (
            <MigrationCompletedModal
              isOpen={migrationCompleted}
              onRequestClose={ackMigrationCompleted}
            />
          )}
        </OnboardingContext.Provider>
      </SettingsContext.Provider>
    </DndContext.Provider>
  );
}

export default function App(): ReactElement {
  return (
    <RouterContext.Provider value={router}>
      <ProgressiveEnhancementContextProvider>
        <FeaturesContextProvider>
          <QueryClientProvider client={queryClient}>
            <AuthContextProvider
              app="extension"
              getRedirectUri={getRedirectUri}
            >
              <SubscriptionContextProvider>
                <InternalApp />
              </SubscriptionContextProvider>
            </AuthContextProvider>
          </QueryClientProvider>
        </FeaturesContextProvider>
      </ProgressiveEnhancementContextProvider>
    </RouterContext.Provider>
  );
}

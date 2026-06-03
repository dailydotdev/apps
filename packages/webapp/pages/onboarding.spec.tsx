import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type {
  AnonymousUser,
  LoggedUser,
} from '@dailydotdev/shared/src/lib/user';
import { FeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import user from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { useOnboardingBoot } from '@dailydotdev/shared/src/features/onboarding/hooks/useOnboardingBoot';
import { useOnboardingActions } from '@dailydotdev/shared/src/hooks/auth';
import OnboardingPage from './onboarding';

jest.mock(
  '@dailydotdev/shared/src/features/onboarding/hooks/useOnboardingBoot',
  () => ({
    ONBOARDING_BOOT_QUERY_KEY: ['onboarding-boot'],
    useOnboardingBoot: jest.fn(),
  }),
);

jest.mock('@dailydotdev/shared/src/hooks/auth', () => ({
  useOnboardingActions: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => ({ value: false }),
}));

jest.mock('@dailydotdev/shared/src/contexts/SettingsContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/SettingsContext'),
  useSettingsContext: () => ({ autoDismissNotifications: true }),
}));

jest.mock('@dailydotdev/shared/src/components/notifications/Toast', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@dailydotdev/shared/src/components/auth/AuthOptions', () => ({
  __esModule: true,
  default: () => <div data-testid="auth-options">auth options</div>,
}));

jest.mock(
  '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepper',
  () => ({
    FunnelStepper: () => <div data-testid="funnel-stepper">funnel</div>,
  }),
);

const routerReplace = jest.fn();

const funnelState = {
  funnel: { chapters: [] },
  session: {},
} as never;

beforeEach(() => {
  jest.clearAllMocks();
  window.history.replaceState({}, '', '/onboarding');
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/onboarding',
        query: { action: 'login' },
        replace: routerReplace,
        push: jest.fn(),
        isReady: true,
      } as unknown as NextRouter),
  );
  jest.mocked(useOnboardingBoot).mockReturnValue({
    data: { funnelState },
  } as never);
  jest.mocked(useOnboardingActions).mockReturnValue({
    isOnboardingComplete: true,
    isOnboardingActionsReady: true,
    shouldShowAuthBanner: false,
    completeStep: jest.fn(),
  });
});

type AuthValue = {
  user?: LoggedUser;
  anonymous?: AnonymousUser;
  isLoggedIn: boolean;
};

const renderPage = ({ user: authUser, anonymous, isLoggedIn }: AuthValue) => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <FeaturesReadyContext.Provider
        value={{
          ready: true,
          getFeatureValue: (feature) => feature.defaultValue,
        }}
      >
        <AuthContext.Provider
          value={
            {
              user: authUser,
              anonymous,
              isLoggedIn,
              isAuthReady: true,
              shouldShowLogin: false,
              showLogin: jest.fn(),
              logout: jest.fn(),
              updateUser: jest.fn(),
              tokenRefreshed: true,
              getRedirectUri: jest.fn(),
              closeLogin: jest.fn(),
            } as never
          }
        >
          <OnboardingPage dehydratedState={{} as never} initialStepId={null} />
        </AuthContext.Provider>
      </FeaturesReadyContext.Provider>
    </QueryClientProvider>,
  );
};

it('redirects a logged-in user landing with action=login to the app', async () => {
  renderPage({ user, anonymous: undefined, isLoggedIn: true });

  await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/'));
  expect(screen.queryByTestId('auth-options')).not.toBeInTheDocument();
});

it('honors the after_auth destination when redirecting', async () => {
  window.history.replaceState({}, '', '/onboarding?after_auth=/my-feed');

  renderPage({ user, anonymous: undefined, isLoggedIn: true });

  await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/my-feed'));
});

it('keeps showing the auth UI for a logged-out user with action=login', async () => {
  renderPage({ user: undefined, anonymous: undefined, isLoggedIn: false });

  expect(await screen.findByTestId('auth-options')).toBeInTheDocument();
  expect(routerReplace).not.toHaveBeenCalled();
});

it('keeps showing email verification for a logged-in user needing verification', async () => {
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/onboarding',
        query: { action: 'verify' },
        replace: routerReplace,
        push: jest.fn(),
        isReady: true,
      } as unknown as NextRouter),
  );

  renderPage({
    user,
    anonymous: { id: user.id, shouldVerify: true } as AnonymousUser,
    isLoggedIn: true,
  });

  expect(await screen.findByTestId('auth-options')).toBeInTheDocument();
  expect(routerReplace).not.toHaveBeenCalled();
});

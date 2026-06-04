import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import {
  AuthDisplay,
  SocialProvider,
} from '@dailydotdev/shared/src/components/auth/common';
import { HijackingVariant } from '@dailydotdev/shared/src/lib/featureManagement';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import HijackingLoginStrip from './HijackingLoginStrip';

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/AuthContext'),
  useAuthContext: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks'),
  useConditionalFeature: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/auth/useSignBack', () => ({
  useSignBack: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/components/auth/AuthOptions', () => {
  const { AuthDisplay: MockAuthDisplay } = jest.requireActual(
    '@dailydotdev/shared/src/components/auth/common',
  );

  return {
    __esModule: true,
    default: ({
      onAuthStateUpdate,
    }: {
      onAuthStateUpdate?: (props: { defaultDisplay?: string }) => void;
    }) => (
      <div>
        <button type="button">Continue with Google</button>
        <button type="button">Continue with GitHub</button>
        <button
          type="button"
          onClick={() =>
            onAuthStateUpdate?.({
              defaultDisplay: MockAuthDisplay.Registration,
            })
          }
        >
          Continue with email
        </button>
        <button
          type="button"
          onClick={() =>
            onAuthStateUpdate?.({ defaultDisplay: MockAuthDisplay.Default })
          }
        >
          Log in
        </button>
        <p>By continuing, you agree to the Terms of Service</p>
      </div>
    ),
  };
});

const LogContext = getLogContextStatic();
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockUseSignBack = useSignBack as jest.MockedFunction<typeof useSignBack>;
const mockUseConditionalFeature = useConditionalFeature as jest.MockedFunction<
  typeof useConditionalFeature
>;
const logEvent = jest.fn();
const showLogin = jest.fn();

const defaultAuthContext = {
  user: undefined,
  isLoggedIn: false,
  referral: undefined,
  referralOrigin: undefined,
  trackingId: undefined,
  shouldShowLogin: false,
  showLogin,
  closeLogin: jest.fn(),
  loginState: undefined,
  logout: jest.fn(),
  updateUser: jest.fn(),
  loadingUser: false,
  isFetched: true,
  tokenRefreshed: false,
  loadedUserFromCache: false,
  getRedirectUri: jest.fn(),
  anonymous: undefined,
  visit: undefined,
  firstVisit: undefined,
  deleteAccount: jest.fn(),
  refetchBoot: jest.fn(),
  accessToken: undefined,
  squads: [],
  isAuthReady: true,
  geo: undefined,
  isAndroidApp: false,
  isGdprCovered: false,
  isValidRegion: true,
  isFunnel: false,
} satisfies AuthContextData;

const setVariant = (
  variant: HijackingVariant,
  { isLoading = false }: { isLoading?: boolean } = {},
): void => {
  mockUseConditionalFeature.mockReturnValue({
    value: variant,
    isLoading,
  });
};

const renderComponent = (
  authContext: Partial<AuthContextData> = {},
): ReturnType<typeof render> => {
  mockUseAuthContext.mockReturnValue({
    ...defaultAuthContext,
    ...authContext,
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const Wrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => (
    <QueryClientProvider client={queryClient}>
      <LogContext.Provider
        value={{
          logEvent,
          logEventStart: jest.fn(),
          logEventEnd: jest.fn(),
          sendBeacon: jest.fn(),
        }}
      >
        {children}
      </LogContext.Provider>
    </QueryClientProvider>
  );

  return render(<HijackingLoginStrip />, { wrapper: Wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
  setVariant(HijackingVariant.Default);
  mockUseSignBack.mockReturnValue({
    isLoaded: true,
    signBack: undefined,
    provider: undefined,
    onUpdateSignBack: jest.fn(),
  });
});

describe('HijackingLoginStrip', () => {
  it('renders nothing while the experiment is loading', () => {
    setVariant(HijackingVariant.Default, { isLoading: true });

    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });

  describe('default variant', () => {
    it('shows the original banner with a log in CTA for logged out users', () => {
      renderComponent();

      expect(
        screen.getByRole('heading', {
          name: 'Unlock the full daily.dev experience',
        }),
      ).toBeVisible();
      expect(
        screen.getByText('Log in to pick up where you left off.'),
      ).toBeVisible();

      fireEvent.click(
        screen.getByRole('button', { name: 'Log in to continue' }),
      );

      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Click,
        target_type: TargetType.LoginButton,
        target_id: 'hijacking',
      });
      expect(showLogin).toHaveBeenCalledWith({
        trigger: AuthTriggers.Onboarding,
        options: { isLogin: true },
      });
    });

    it('shows an onboarding CTA for logged in users who still need onboarding', () => {
      renderComponent({ user: loggedUser, isLoggedIn: true });

      expect(
        screen.getByText(/You still have a few onboarding steps left/),
      ).toBeVisible();

      const cta = screen.getByRole('link', { name: 'Continue onboarding' });
      const expectedUrl = new URL(onboardingUrl);
      expectedUrl.searchParams.append('r', 'extension');

      expect(cta).toHaveAttribute('href', expectedUrl.toString());

      fireEvent.click(cta);

      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Click,
        target_type: TargetType.LoginButton,
        target_id: 'hijacking',
      });
      expect(showLogin).not.toHaveBeenCalled();
    });
  });

  describe('cta variant', () => {
    beforeEach(() => {
      setVariant(HijackingVariant.CTA);
    });

    it('shows the cat stage hero with sign up and log in CTAs', () => {
      renderComponent();

      expect(
        screen.getByRole('heading', {
          name: 'Own your new tab. Make it your dev briefing.',
        }),
      ).toBeVisible();

      fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Click,
        target_type: TargetType.SignupButton,
        target_id: 'hijacking',
      });
      expect(showLogin).toHaveBeenCalledWith({
        trigger: AuthTriggers.Onboarding,
        options: { isLogin: false },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
      expect(showLogin).toHaveBeenCalledWith({
        trigger: AuthTriggers.Onboarding,
        options: { isLogin: true },
      });
    });

    it('logs a signup impression for new visitors', () => {
      renderComponent();

      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Impression,
        target_type: TargetType.SignupButton,
        target_id: 'hijacking',
      });
    });
  });

  describe('auth variant', () => {
    beforeEach(() => {
      setVariant(HijackingVariant.Auth);
    });

    it('encourages signup for logged out users without a remembered account', () => {
      renderComponent();

      expect(
        screen.getByRole('heading', {
          name: 'Where developers make every tab count.',
        }),
      ).toBeVisible();

      expect(
        screen.getByRole('button', { name: 'Continue with Google' }),
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Continue with GitHub' }),
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Continue with email' }),
      ).toBeVisible();
      expect(
        screen.getByText(/By continuing, you agree to the Terms of Service/),
      ).toBeVisible();

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue with email' }),
      );

      expect(showLogin).toHaveBeenCalledWith({
        trigger: AuthTriggers.Onboarding,
        options: {
          isLogin: false,
          defaultDisplay: AuthDisplay.Registration,
          formValues: undefined,
        },
      });
    });

    it('logs a signup impression for new visitors', () => {
      renderComponent();

      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Impression,
        target_type: TargetType.SignupButton,
        target_id: 'hijacking',
      });
    });

    it('waits for remembered account storage before logging the impression', () => {
      let signBackState: ReturnType<typeof useSignBack> = {
        isLoaded: false,
        signBack: undefined,
        provider: undefined,
        onUpdateSignBack: jest.fn(),
      };

      mockUseSignBack.mockImplementation(() => signBackState);

      const { rerender } = renderComponent();

      expect(logEvent).not.toHaveBeenCalled();

      signBackState = {
        isLoaded: true,
        signBack: {
          name: 'Tsahi Matsliah',
          email: 'tsahi@daily.dev',
          image: 'https://daily.dev/tsahi.png',
        },
        provider: SocialProvider.Google,
        onUpdateSignBack: jest.fn(),
      };

      rerender(<HijackingLoginStrip />);

      expect(
        screen.getByRole('heading', { name: /Welcome back, Tsahi/ }),
      ).toBeVisible();
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Impression,
        target_type: TargetType.LoginButton,
        target_id: 'hijacking',
      });
      expect(logEvent).not.toHaveBeenCalledWith({
        event_name: LogEvent.Impression,
        target_type: TargetType.SignupButton,
        target_id: 'hijacking',
      });
    });

    it('offers a welcome-back "Continue as" for users with a remembered account', () => {
      mockUseSignBack.mockReturnValue({
        isLoaded: true,
        signBack: {
          name: 'Tsahi Matsliah',
          email: 'tsahi@daily.dev',
          image: 'https://daily.dev/tsahi.png',
        },
        provider: SocialProvider.Google,
        onUpdateSignBack: jest.fn(),
      });

      renderComponent();

      expect(
        screen.getByRole('heading', { name: /Welcome back, Tsahi/ }),
      ).toBeVisible();
      expect(screen.getByText('tsahi@daily.dev')).toBeVisible();

      const cta = screen.getByRole('button', { name: /Continue as Tsahi/ });
      fireEvent.click(cta);

      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Impression,
        target_type: TargetType.LoginButton,
        target_id: 'hijacking',
      });
      expect(showLogin).toHaveBeenCalledWith({
        trigger: AuthTriggers.Onboarding,
        options: { isLogin: true },
      });
    });

    it('lets remembered users create a different account', () => {
      mockUseSignBack.mockReturnValue({
        isLoaded: true,
        signBack: {
          name: 'Tsahi Matsliah',
          email: 'tsahi@daily.dev',
          image: 'https://daily.dev/tsahi.png',
        },
        provider: SocialProvider.Google,
        onUpdateSignBack: jest.fn(),
      });

      renderComponent();

      fireEvent.click(
        screen.getByRole('button', { name: 'Create an account' }),
      );

      expect(showLogin).toHaveBeenCalledWith({
        trigger: AuthTriggers.Onboarding,
        options: { isLogin: false },
      });
    });

    it('shows an onboarding CTA for logged in users who still need onboarding', () => {
      renderComponent({ user: loggedUser, isLoggedIn: true });

      expect(
        screen.getByText(
          'Finish onboarding to unlock the full daily.dev experience.',
        ),
      ).toBeVisible();

      const cta = screen.getByRole('link', { name: /Continue/ });
      const expectedUrl = new URL(onboardingUrl);
      expectedUrl.searchParams.append('r', 'extension');

      expect(cta).toHaveAttribute('href', expectedUrl.toString());

      fireEvent.click(cta);

      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Click,
        target_type: TargetType.LoginButton,
        target_id: 'hijacking',
      });
      expect(showLogin).not.toHaveBeenCalled();
    });
  });
});

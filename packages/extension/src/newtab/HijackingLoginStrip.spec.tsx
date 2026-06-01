import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { SocialProvider } from '@dailydotdev/shared/src/components/auth/common';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import HijackingLoginStrip from './HijackingLoginStrip';

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/AuthContext'),
  useAuthContext: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/auth/useSignBack', () => ({
  useSignBack: jest.fn(),
}));

const LogContext = getLogContextStatic();
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockUseSignBack = useSignBack as jest.MockedFunction<typeof useSignBack>;
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
  mockUseSignBack.mockReturnValue({
    isLoaded: true,
    signBack: undefined,
    provider: undefined,
    onUpdateSignBack: jest.fn(),
  });
});

describe('HijackingLoginStrip', () => {
  it('encourages signup for logged out users without a remembered account', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: 'Own your new tab. Make it your dev briefing.',
      }),
    ).toBeVisible();

    const signup = screen.getByRole('button', { name: 'Sign up' });
    fireEvent.click(signup);

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.SignupButton,
      target_id: 'hijacking',
    });
    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: false },
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

    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));

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

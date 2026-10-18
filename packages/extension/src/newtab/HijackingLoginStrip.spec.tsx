import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { useViewSize } from '@dailydotdev/shared/src/hooks';
import { useSignBack } from '@dailydotdev/shared/src/hooks/auth/useSignBack';
import { SocialProvider } from '@dailydotdev/shared/src/components/auth/common';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import HijackingLoginStrip from './HijackingLoginStrip';

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/AuthContext'),
  useAuthContext: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks'),
  useViewSize: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/auth/useSignBack', () => ({
  useSignBack: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/hooks/layout/useLayoutVariant', () => ({
  useLayoutVariant: jest.fn(),
}));

const signupHref = (() => {
  const url = new URL(onboardingUrl);
  url.searchParams.append('r', 'extension');

  return url.toString();
})();

const loginHref = (() => {
  const url = new URL(onboardingUrl);
  url.searchParams.append('r', 'extension');
  url.searchParams.append('action', 'login');

  return url.toString();
})();

const LogContext = getLogContextStatic();
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockUseSignBack = useSignBack as jest.MockedFunction<typeof useSignBack>;
const mockUseLayoutVariant = useLayoutVariant as jest.MockedFunction<
  typeof useLayoutVariant
>;
const mockUseViewSize = useViewSize as jest.MockedFunction<typeof useViewSize>;
const logEvent = jest.fn();
const showLogin = jest.fn();
const assignMock = jest.fn();

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
  isTokenValid: false,
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
  isAuthReadyOrCached: true,
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

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, assign: assignMock },
  });
});

const rememberedAccount: ReturnType<typeof useSignBack> = {
  isLoaded: true,
  signBack: {
    name: 'Tsahi Matsliah',
    email: 'tsahi@daily.dev',
    image: 'https://daily.dev/tsahi.png',
  },
  provider: SocialProvider.Google,
  onUpdateSignBack: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseViewSize.mockReturnValue(true);
  mockUseLayoutVariant.mockReturnValue({ isV2: false, isLoading: false });
  mockUseSignBack.mockReturnValue({
    isLoaded: true,
    signBack: undefined,
    provider: undefined,
    onUpdateSignBack: jest.fn(),
  });
});

const HEADING = 'Unlock the full daily.dev experience';
const LOGGED_OUT_BODY = 'Log in to pick up where you left off.';

const loginClick = {
  event_name: LogEvent.Click,
  target_type: TargetType.LoginButton,
  target_id: 'hijacking',
};

describe('HijackingLoginStrip', () => {
  // `isV2` is false while auth resolves, indistinguishable from a settled
  // "not v2".
  it('renders nothing on laptop while the layout is still resolving', () => {
    mockUseLayoutVariant.mockReturnValue({ isV2: false, isLoading: true });

    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
  });

  // Below laptop the layout hook never evaluates, so `isLoading` stays true
  // for good.
  it('still renders below laptop, where the layout never resolves', () => {
    mockUseViewSize.mockReturnValue(false);
    mockUseLayoutVariant.mockReturnValue({ isV2: false, isLoading: true });

    renderComponent();

    expect(screen.getByRole('heading', { name: HEADING })).toBeVisible();
  });

  describe('logged out', () => {
    it('sends the single CTA to the webapp login', () => {
      renderComponent();

      expect(screen.getByRole('heading', { name: HEADING })).toBeVisible();
      expect(
        screen.queryByRole('button', { name: /Sign up/ }),
      ).not.toBeInTheDocument();

      fireEvent.click(
        screen.getByRole('button', { name: 'Log in to continue' }),
      );
      expect(logEvent).toHaveBeenCalledWith(loginClick);
      expect(assignMock).toHaveBeenCalledWith(loginHref);
    });

    it('reserves the original strip height with an invisible copy', () => {
      renderComponent();

      // once visible, once in the height sizer
      expect(screen.getAllByText(LOGGED_OUT_BODY)).toHaveLength(2);
    });

    it('logs a login impression', () => {
      renderComponent();

      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Impression,
        target_type: TargetType.LoginButton,
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

      expect(logEvent).not.toHaveBeenCalledWith(
        expect.objectContaining({ event_name: LogEvent.Impression }),
      );

      signBackState = rememberedAccount;
      rerender(<HijackingLoginStrip />);

      expect(
        screen.getByRole('heading', { name: /Welcome back, Tsahi/ }),
      ).toBeVisible();
      expect(logEvent).toHaveBeenCalledTimes(1);
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Impression,
        target_type: TargetType.LoginButton,
        target_id: 'hijacking',
      });
    });
  });

  describe('remembered account', () => {
    beforeEach(() => {
      mockUseSignBack.mockReturnValue(rememberedAccount);
    });

    it('offers "Continue as" that opens the webapp login', () => {
      renderComponent();

      expect(screen.getByText('tsahi@daily.dev')).toBeVisible();

      fireEvent.click(
        screen.getByRole('button', { name: /Continue as Tsahi/ }),
      );

      expect(logEvent).toHaveBeenCalledWith(loginClick);
      expect(assignMock).toHaveBeenCalledWith(loginHref);
    });

    it('lets remembered users create a different account', () => {
      renderComponent();

      fireEvent.click(
        screen.getByRole('button', { name: 'Create an account' }),
      );

      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Click,
        target_type: TargetType.SignupButton,
        target_id: 'hijacking',
      });
      expect(assignMock).toHaveBeenCalledWith(signupHref);
    });
  });

  it('shows an onboarding CTA for logged in users who still need onboarding', () => {
    renderComponent({ user: loggedUser, isLoggedIn: true });

    expect(screen.getByRole('heading', { name: HEADING })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: /Welcome back/ }),
    ).not.toBeInTheDocument();

    const cta = screen.getByRole('link', { name: 'Continue onboarding' });
    expect(cta).toHaveAttribute('href', signupHref);

    fireEvent.click(cta);
    expect(logEvent).toHaveBeenCalledWith(loginClick);
    expect(showLogin).not.toHaveBeenCalled();
  });
});

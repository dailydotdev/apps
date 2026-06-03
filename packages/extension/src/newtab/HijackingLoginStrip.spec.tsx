import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import HijackingLoginStrip from './HijackingLoginStrip';

jest.mock('@dailydotdev/shared/src/contexts/AuthContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/AuthContext'),
  useAuthContext: jest.fn(),
}));

const LogContext = getLogContextStatic();
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
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

const renderComponent = (
  authContext: Partial<AuthContextData> = {},
): ReturnType<typeof render> => {
  mockUseAuthContext.mockReturnValue({
    ...defaultAuthContext,
    ...authContext,
  });

  return render(
    <LogContext.Provider
      value={{
        logEvent,
        logEventStart: jest.fn(),
        logEventEnd: jest.fn(),
        sendBeacon: jest.fn(),
      }}
    >
      <HijackingLoginStrip />
    </LogContext.Provider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('HijackingLoginStrip', () => {
  it('shows a login CTA for logged out users', () => {
    renderComponent();

    expect(
      screen.getByText('Unlock the full daily.dev experience'),
    ).toBeVisible();
    expect(
      screen.getByText('Log in to pick up where you left off.'),
    ).toBeVisible();

    const cta = screen.getByRole('button', { name: 'Log in to continue' });
    fireEvent.click(cta);

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
      screen.getByText(
        'You still have a few onboarding steps left. Finish them to unlock the full experience.',
      ),
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

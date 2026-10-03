import type { ReactNode } from 'react';
import React from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import { useViewSize } from '../../../hooks/useViewSize';
import { isIOSNative } from '../../../lib/func';
import { AuthTriggers } from '../../../lib/auth';
import { useMobileAppHeaderIconOnlyRead } from '../hooks/useMobileAppHeader';
import { MobileAppHeader } from './MobileAppHeader';
import SettingsContext from '../../../contexts/SettingsContext';
import type { SettingsContextData } from '../../../contexts/SettingsContext';
import { openAppUrl } from './MobileAppActions';

jest.mock('../../../components/layout/HeaderLogo', () => () => null);

jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  isIOSNative: jest.fn(),
}));

const mockIsTablet = jest.mocked(useViewSize);
const mockIsIOSNative = jest.mocked(isIOSNative);
const showLogin = jest.fn();

const LogContext = getLogContextStatic();

const Auth = ({
  auth = {},
  children,
}: {
  auth?: Partial<AuthContextData>;
  children: ReactNode;
}) => (
  <AuthContext.Provider
    value={
      {
        isAuthReady: true,
        isLoggedIn: false,
        isAndroidApp: false,
        showLogin,
        ...auth,
      } as unknown as AuthContextData
    }
  >
    {children}
  </AuthContext.Provider>
);

const renderComponent = (auth: Partial<AuthContextData> = {}) =>
  render(
    <Auth auth={auth}>
      <LogContext.Provider
        value={{ logEvent: jest.fn() } as unknown as LogContextData}
      >
        <MobileAppHeader />
      </LogContext.Provider>
    </Auth>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockIsTablet.mockReturnValue(false);
  mockIsIOSNative.mockReturnValue(false);
});

describe('MobileAppHeader', () => {
  it('should show Log in and Open app to a logged-out phone visitor', async () => {
    renderComponent();

    expect(screen.getByRole('link', { name: 'Open app' })).toHaveAttribute(
      'href',
      openAppUrl,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.MainButton,
      options: { isLogin: true },
    });
  });

  it('should wait for auth so members never see it', () => {
    renderComponent({ isAuthReady: false });

    expect(screen.queryByText('Open app')).not.toBeInTheDocument();
  });

  it('should leave logged-in readers with their header', () => {
    renderComponent({ isLoggedIn: true });

    expect(screen.queryByText('Open app')).not.toBeInTheDocument();
  });

  it('should leave tablets with the Log in / Sign up strip', () => {
    mockIsTablet.mockReturnValue(true);
    renderComponent();

    expect(screen.queryByText('Open app')).not.toBeInTheDocument();
  });

  it.each([
    ['iOS', () => mockIsIOSNative.mockReturnValue(true), {}],
    ['Android', () => undefined, { isAndroidApp: true }],
  ])('should never ask the %s app to open the app', (_, arrange, auth) => {
    arrange();
    renderComponent(auth);

    expect(screen.queryByText('Open app')).not.toBeInTheDocument();
  });

  describe('post bar Read button', () => {
    const renderIconOnlyRead = (
      width: number,
      auth: Partial<AuthContextData> = {},
    ) => {
      window.matchMedia = jest.fn().mockImplementation((query: string) => ({
        matches: query === '(min-width: 360px)' && width >= 360,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      return renderHook(() => useMobileAppHeaderIconOnlyRead(), {
        wrapper: ({ children }) => <Auth auth={auth}>{children}</Auth>,
      }).result.current;
    };

    it('should drop to its icon below 360px', () => {
      expect(renderIconOnlyRead(320)).toBe(true);
      expect(renderIconOnlyRead(360)).toBe(false);
    });

    it('should keep its label for logged-in readers', () => {
      expect(renderIconOnlyRead(320, { isLoggedIn: true })).toBe(false);
    });
  });

  it('leaves once the shell block is on the page', () => {
    render(
      <Auth>
        <SettingsContext.Provider
          value={{ loadedSettings: true } as unknown as SettingsContextData}
        >
          <LogContext.Provider
            value={{ logEvent: jest.fn() } as unknown as LogContextData}
          >
            <MobileAppHeader />
          </LogContext.Provider>
        </SettingsContext.Provider>
      </Auth>,
    );

    expect(screen.queryByText('Open app')).not.toBeInTheDocument();
  });
});

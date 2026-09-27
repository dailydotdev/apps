import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize } from '../../../hooks/useViewSize';
import { isIOSNative } from '../../../lib/func';
import { AuthTriggers } from '../../../lib/auth';
import { MobileAppHeader } from './MobileAppHeader';
import { openAppUrl } from './MobileAppActions';

jest.mock('../../../components/layout/HeaderLogo', () => () => null);

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  isIOSNative: jest.fn(),
}));

const mockFeature = jest.mocked(useConditionalFeature);
const mockIsTablet = jest.mocked(useViewSize);
const mockIsIOSNative = jest.mocked(isIOSNative);
const showLogin = jest.fn();

const LogContext = getLogContextStatic();

const renderComponent = (auth: Partial<AuthContextData> = {}) =>
  render(
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
      <LogContext.Provider
        value={{ logEvent: jest.fn() } as unknown as LogContextData}
      >
        <MobileAppHeader />
      </LogContext.Provider>
    </AuthContext.Provider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockFeature.mockReturnValue({ value: true, isLoading: false });
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

  it('should render nothing when the experiment is off', () => {
    mockFeature.mockReturnValue({ value: false, isLoading: false });
    renderComponent();

    expect(screen.queryByText('Open app')).not.toBeInTheDocument();
  });

  it('should not enroll logged-in readers', () => {
    renderComponent({ isLoggedIn: true });

    expect(screen.queryByText('Open app')).not.toBeInTheDocument();
    expect(mockFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('should not enroll tablets, which keep the Log in / Sign up strip', () => {
    mockIsTablet.mockReturnValue(true);
    renderComponent();

    expect(screen.queryByText('Open app')).not.toBeInTheDocument();
    expect(mockFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it.each([
    ['iOS', () => mockIsIOSNative.mockReturnValue(true), {}],
    ['Android', () => undefined, { isAndroidApp: true }],
  ])('should never ask the %s app to open the app', (_, arrange, auth) => {
    arrange();
    renderComponent(auth);

    expect(screen.queryByText('Open app')).not.toBeInTheDocument();
  });
});

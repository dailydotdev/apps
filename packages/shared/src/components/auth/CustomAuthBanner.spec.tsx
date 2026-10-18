import React from 'react';
import { render, screen } from '@testing-library/react';
import type { AuthContextData } from '../../contexts/AuthContext';
import AuthContext from '../../contexts/AuthContext';
import { getLogContextStatic } from '../../contexts/LogContext';
import type { LogContextData } from '../../hooks/log/useLogContextData';
import { useOnboardingActions } from '../../hooks/auth';
import { useViewSize } from '../../hooks';
import { useMobileAppHeader } from '../../features/getApp/hooks/useMobileAppHeader';
import CustomAuthBanner from './CustomAuthBanner';

jest.mock('../../hooks/auth', () => ({
  useOnboardingActions: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useViewSize: jest.fn(),
}));

jest.mock('../../features/getApp/hooks/useMobileAppHeader', () => ({
  useMobileAppHeader: jest.fn(),
}));

const mockOnboardingActions = jest.mocked(useOnboardingActions);
const mockViewSize = jest.mocked(useViewSize);
const mockMobileAppHeader = jest.mocked(useMobileAppHeader);

const LogContext = getLogContextStatic();

const renderComponent = () =>
  render(
    <AuthContext.Provider
      value={
        {
          shouldShowLogin: false,
          showLogin: jest.fn(),
        } as unknown as AuthContextData
      }
    >
      <LogContext.Provider
        value={{ logEvent: jest.fn() } as unknown as LogContextData}
      >
        <CustomAuthBanner />
      </LogContext.Provider>
    </AuthContext.Provider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockOnboardingActions.mockReturnValue({
    shouldShowAuthBanner: true,
  } as ReturnType<typeof useOnboardingActions>);
  mockViewSize.mockReturnValue(false);
});

describe('CustomAuthBanner', () => {
  it('should show Log in and Sign up to logged-out phones by default', () => {
    mockMobileAppHeader.mockReturnValue(false);
    renderComponent();

    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
  });

  it('should step aside when the page bar carries Log in and Open app', () => {
    mockMobileAppHeader.mockReturnValue(true);
    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'Sign up' }),
    ).not.toBeInTheDocument();
  });
});

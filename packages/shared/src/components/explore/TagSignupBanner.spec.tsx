import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';
import { TagSignupBanner } from './TagSignupBanner';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

const showLogin = jest.fn();
const logEvent = jest.fn();

const mockAuth = (overrides: Record<string, unknown> = {}) =>
  (useAuthContext as jest.Mock).mockReturnValue({
    isAuthReady: true,
    isLoggedIn: false,
    showLogin,
    ...overrides,
  });

beforeEach(() => {
  jest.clearAllMocks();
  (useLogContext as jest.Mock).mockReturnValue({ logEvent });
});

describe('TagSignupBanner', () => {
  it('renders a signup-first CTA and logs an impression for logged-out users', () => {
    mockAuth();
    render(<TagSignupBanner tag="React" />);

    expect(screen.getByRole('heading', { name: /Follow React/ })).toBeVisible();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: 'tag_page',
    });
  });

  it('opens registration on signup click', () => {
    mockAuth();
    render(<TagSignupBanner tag="React" />);

    fireEvent.click(screen.getByRole('button', { name: /Sign up/ }));

    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: false },
    });
  });

  it('renders nothing for logged-in users', () => {
    mockAuth({ isLoggedIn: true });
    const { container } = render(<TagSignupBanner tag="React" />);

    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
  });
});

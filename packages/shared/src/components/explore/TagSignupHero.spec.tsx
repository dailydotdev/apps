import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { TagSignupHero } from './TagSignupHero';

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));
jest.mock('../auth/AuthOptions', () => ({
  __esModule: true,
  default: () => <div data-testid="auth-options" />,
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

describe('TagSignupHero', () => {
  it('shows the auth hero and logs an impression for logged-out users', () => {
    mockAuth();
    render(<TagSignupHero tag="React" />);

    expect(
      screen.getByRole('heading', { name: /make every tab count/i }),
    ).toBeVisible();
    expect(screen.getByTestId('auth-options')).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: 'tag_page',
    });
  });

  it('renders nothing for logged-in users', () => {
    mockAuth({ isLoggedIn: true });
    const { container } = render(<TagSignupHero tag="React" />);

    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
  });
});

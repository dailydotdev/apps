import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';
import { ExploreSignupCard } from './ExploreSignupCard';

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

describe('ExploreSignupCard', () => {
  it('makes the tag value explicit and logs a tag_page impression', () => {
    mockAuth();
    render(<ExploreSignupCard tag="claude" postsCount={1200} />);

    expect(
      screen.getByRole('heading', { name: /Keep up with #claude/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/New #claude posts/)).toBeInTheDocument();
    expect(screen.getByText('1.2K posts')).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: 'tag_page',
    });
  });

  it('uses lobby copy and a tags_lobby target when no tag is given', () => {
    mockAuth();
    render(<ExploreSignupCard />);

    expect(
      screen.getByRole('heading', { name: /Make daily.dev your feed/ }),
    ).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: 'tags_lobby',
    });
  });

  it('opens registration on signup click', () => {
    mockAuth();
    render(<ExploreSignupCard tag="claude" />);

    fireEvent.click(screen.getByRole('button', { name: /Sign up/ }));
    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: false },
    });
  });

  it('renders nothing for logged-in users', () => {
    mockAuth({ isLoggedIn: true });
    const { container } = render(<ExploreSignupCard tag="claude" />);

    expect(container).toBeEmptyDOMElement();
  });
});

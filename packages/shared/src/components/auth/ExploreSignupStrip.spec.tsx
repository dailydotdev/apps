import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ExploreSignupStrip } from './ExploreSignupStrip';
import { useViewSize } from '../../hooks/useViewSize';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetType } from '../../lib/log';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const mockUseViewSize = useViewSize as jest.Mock;
const logEvent = jest.fn();
const showLogin = jest.fn();

const renderComponent = (auth = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{
        isAuthReady: true,
        isLoggedIn: false,
        user: undefined,
        showLogin,
        ...auth,
      }}
      log={{ logEvent }}
    >
      <ExploreSignupStrip />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUseViewSize.mockReturnValue(true);
});

describe('ExploreSignupStrip', () => {
  it('should render the strip for anonymous visitors', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: 'Own your feed. Make it your dev briefing.',
      }),
    ).toBeInTheDocument();
  });

  it('should render nothing for logged-in users', () => {
    renderComponent({ isLoggedIn: true, user: { id: 'u1' } });

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('should hold the slot at the strip height until boot answers', () => {
    const { container } = renderComponent({ isAuthReady: false });

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass('hidden', 'tablet:block');
    expect(logEvent).not.toHaveBeenCalled();
  });

  // The phone gate is CSS so the SSR HTML keeps the slot, but the impression
  // needs the matching JS gate or every anonymous phone visitor reports seeing
  // a strip their viewport never paints.
  it('should not log an impression below the tablet breakpoint', () => {
    mockUseViewSize.mockReturnValue(false);
    renderComponent();

    expect(logEvent).not.toHaveBeenCalled();
  });

  it('should log a single impression from the tablet breakpoint up', () => {
    const { rerender } = renderComponent();

    rerender(
      <TestBootProvider
        client={new QueryClient()}
        auth={{
          isAuthReady: true,
          isLoggedIn: false,
          user: undefined,
          showLogin,
        }}
        log={{ logEvent }}
      >
        <ExploreSignupStrip />
      </TestBootProvider>,
    );

    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.SignupButton,
      target_id: 'explore strip',
    });
  });

  it('should open signup inline and log the click', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /Sign up/ }));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.SignupButton,
      target_id: 'explore strip',
    });
    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: false },
    });
  });

  it('should open login inline and log the click', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.LoginButton,
      target_id: 'explore strip',
    });
    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: true },
    });
  });
});

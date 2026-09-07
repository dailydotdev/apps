import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ExploreSignupStrip } from './ExploreSignupStrip';
import { hijackingCoverStripMinHeight } from './HijackingCoverStrip';
import { useViewSize } from '../../hooks/useViewSize';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetId, TargetType } from '../../lib/log';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const mockUseViewSize = useViewSize as jest.Mock;
const logEvent = jest.fn();
const showLogin = jest.fn();

const tree = (auth = {}) => (
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
  </TestBootProvider>
);

const renderComponent = (auth = {}) => render(tree(auth));

const impression = {
  event_name: LogEvent.Impression,
  target_type: TargetType.SignupButton,
  target_id: TargetId.ExploreStrip,
};

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
    expect(logEvent).toHaveBeenCalledWith(impression);
  });

  it('should render nothing for logged-in users', () => {
    const { container } = renderComponent({
      isLoggedIn: true,
      user: { id: 'u1' },
    });

    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('should hold the slot at the strip height until boot answers', () => {
    const { container } = renderComponent({ isAuthReady: false });

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(container.firstElementChild?.firstElementChild).toHaveClass(
      hijackingCoverStripMinHeight,
    );
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('should not hold the slot for a member known from the boot cache', () => {
    const { container } = renderComponent({
      isAuthReady: false,
      user: { id: 'u1' },
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing and log nothing below the tablet breakpoint', () => {
    mockUseViewSize.mockReturnValue(false);
    const { container } = renderComponent();

    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('should log one impression once the viewport reaches tablet', () => {
    mockUseViewSize.mockReturnValue(false);
    const { rerender } = renderComponent();

    mockUseViewSize.mockReturnValue(true);
    rerender(tree());
    rerender(tree());

    expect(logEvent).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith(impression);
  });

  it('should open signup inline and log the click', async () => {
    renderComponent();

    await userEvent.click(screen.getByRole('button', { name: /Sign up/ }));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.SignupButton,
      target_id: TargetId.ExploreStrip,
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
      target_id: TargetId.ExploreStrip,
    });
    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.Onboarding,
      options: { isLogin: true },
    });
  });
});

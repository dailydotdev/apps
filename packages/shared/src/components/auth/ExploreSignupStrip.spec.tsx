import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ExploreSignupStrip } from './ExploreSignupStrip';
import { AuthDisplay } from './common';
import { useViewSize } from '../../hooks/useViewSize';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent, TargetId, TargetType } from '../../lib/log';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

jest.mock('./AuthOptions', () => ({
  __esModule: true,
  default: ({
    onAuthStateUpdate,
  }: {
    onAuthStateUpdate?: (props: Record<string, unknown>) => void;
  }) => {
    const { AuthDisplay: Display } = jest.requireActual('./common');

    return (
      <div>
        <button
          type="button"
          onClick={() =>
            onAuthStateUpdate?.({
              isAuthenticating: true,
              defaultDisplay: Display.Registration,
            })
          }
        >
          Continue with email
        </button>
        <button
          type="button"
          onClick={() =>
            onAuthStateUpdate?.({
              isAuthenticating: true,
              isLoginFlow: true,
              email: '',
            })
          }
        >
          Log in
        </button>
      </div>
    );
  },
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

beforeAll(() => {
  Object.defineProperty(global, 'ResizeObserver', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    })),
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseViewSize.mockReturnValue(true);
});

describe('ExploreSignupStrip', () => {
  it('should render the strip for anonymous visitors', () => {
    renderComponent();

    expect(
      screen.getByRole('heading', {
        name: 'Unlock the full daily.dev experience',
      }),
    ).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith(impression);
  });

  it("should pin the card at the slot's box", () => {
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ left: 120, width: 900 } as DOMRect);
    renderComponent();

    const heading = screen.getByRole('heading', {
      name: 'Unlock the full daily.dev experience',
    });
    expect(heading.closest('.fixed')).toHaveStyle({
      left: '120px',
      width: '900px',
    });
  });

  it('should render nothing for logged-in users', () => {
    const { container } = renderComponent({
      isLoggedIn: true,
      user: { id: 'u1' },
    });

    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
  });

  it('should render nothing until boot answers', () => {
    const { container } = renderComponent({ isAuthReady: false });

    expect(container).toBeEmptyDOMElement();
    expect(logEvent).not.toHaveBeenCalled();
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

  it('should hand the email signup off to the modal', async () => {
    renderComponent();

    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with email' }),
    );

    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.Onboarding,
      options: {
        isLogin: false,
        defaultDisplay: AuthDisplay.Registration,
        formValues: undefined,
      },
    });
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ event_name: LogEvent.Click }),
    );
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
      options: {
        isLogin: true,
        defaultDisplay: undefined,
        formValues: undefined,
      },
    });
  });
});

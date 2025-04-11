// Mock BroadcastChannel
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunnelRegistration } from './FunnelRegistration';
import useRegistration from '../../../hooks/useRegistration';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import {
  useEventListener,
  useToastNotification,
  useViewSize,
} from '../../../hooks';
import { AuthEvent, getKratosFlow } from '../../../lib/kratos';
import { isNativeAuthSupported, AuthEventNames } from '../../../lib/auth';
import { SocialProvider } from '../../../components/auth/common';
import { labels } from '../../../lib';
import { isWebView } from '../../../components/auth/OnboardingRegistrationForm';
import { isIOS } from '../../../lib/func';
import type { FunnelStepSignup } from '../types/funnel';
import { FunnelStepType, FunnelStepTransitionType } from '../types/funnel';

// Mock the hooks and dependencies
jest.mock('../../../hooks/useRegistration');
jest.mock('../../../contexts/AuthContext');
jest.mock('../../../contexts/LogContext');
jest.mock('../../../hooks');
jest.mock('../../../lib/kratos');
jest.mock('../../../lib/auth');
jest.mock('../../../components/auth/OnboardingRegistrationForm');
jest.mock('../../../lib/func');
jest.mock('../../../hooks/useViewSize');
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(() => ({
    isReady: true,
  })),
}));
jest.mock('../shared', () => ({
  sanitizeMessage: jest.fn().mockImplementation((message) => message),
}));

describe('FunnelRegistration', () => {
  const mockOnTransition = jest.fn();
  const mockOnSocialRegistration = jest.fn();
  const mockDisplayToast = jest.fn();
  const mockRefetchBoot = jest.fn();
  const mockLogEvent = jest.fn();
  const mockUseEventListener = jest.fn();

  const defaultProps: FunnelStepSignup = {
    type: FunnelStepType.Signup,
    id: 'test-step',
    parameters: {
      headline: 'Test Heading',
      image: 'test-image.jpg',
      imageMobile: 'test-image-mobile.jpg',
    },
    isActive: true,
    onTransition: mockOnTransition,
    transitions: [
      {
        on: FunnelStepTransitionType.Complete,
        destination: 'next-step',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementations
    (useRegistration as jest.Mock).mockReturnValue({
      onSocialRegistration: mockOnSocialRegistration,
    });

    (useAuthContext as jest.Mock).mockReturnValue({
      refetchBoot: mockRefetchBoot,
      isLoggedIn: false,
      isAuthReady: true,
    });

    (useLogContext as jest.Mock).mockReturnValue({
      logEvent: mockLogEvent,
    });

    (useToastNotification as jest.Mock).mockReturnValue({
      displayToast: mockDisplayToast,
    });

    (useEventListener as jest.Mock).mockImplementation(mockUseEventListener);

    (getKratosFlow as jest.Mock).mockResolvedValue({
      id: 'test-flow-id',
      ui: { messages: [] },
    });

    // Default to non-native auth
    (isNativeAuthSupported as jest.Mock).mockImplementation((provider) => {
      return provider === SocialProvider.Apple;
    });

    // Default WebView and iOS states
    (isWebView as jest.Mock).mockReturnValue(false);
    (isIOS as jest.Mock).mockReturnValue(false);

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Default to mobile view
    (useViewSize as jest.Mock).mockReturnValue(false);
  });

  it('should not render when isActive is false', () => {
    render(<FunnelRegistration {...defaultProps} isActive={false} />);
    expect(
      screen.queryByTestId('registration-container'),
    ).not.toBeInTheDocument();
  });

  it('should not render when auth is not ready', () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      isAuthReady: false,
      isLoggedIn: false,
    });
    render(<FunnelRegistration {...defaultProps} />);
    expect(
      screen.queryByTestId('registration-container'),
    ).not.toBeInTheDocument();
  });

  it('should transition when user is already logged in', () => {
    (useAuthContext as jest.Mock).mockReturnValue({
      isAuthReady: true,
      isLoggedIn: true,
    });
    render(<FunnelRegistration {...defaultProps} />);
    expect(mockOnTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
    });
    expect(
      screen.queryByTestId('registration-container'),
    ).not.toBeInTheDocument();
  });

  it('should configure registration with redirect_to when in Android WebView', () => {
    // Mock Android WebView environment
    (isWebView as jest.Mock).mockReturnValue(true);
    (isIOS as jest.Mock).mockReturnValue(false);

    render(<FunnelRegistration {...defaultProps} />);

    expect(useRegistration).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        params: { redirect_to: expect.any(String) },
      }),
    );
  });

  it('should handle direct navigation for Android WebView', async () => {
    // Mock Android WebView environment
    (isWebView as jest.Mock).mockReturnValue(true);
    (isIOS as jest.Mock).mockReturnValue(false);

    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    let registrationHook;
    (useRegistration as jest.Mock).mockImplementation((props) => {
      registrationHook = props;
      return {
        onSocialRegistration: mockOnSocialRegistration,
      };
    });

    render(<FunnelRegistration {...defaultProps} />);

    const redirectUrl = 'https://example.com/auth';
    // Call onRedirect directly
    registrationHook.onRedirect(redirectUrl);

    expect(mockLocation.href).toBe(redirectUrl);
  });

  it('should not open popup for non-native auth in Android WebView', async () => {
    // Mock Android WebView environment
    (isWebView as jest.Mock).mockReturnValue(true);
    (isIOS as jest.Mock).mockReturnValue(false);

    const mockWindowOpen = jest.fn();
    global.open = mockWindowOpen;

    render(<FunnelRegistration {...defaultProps} />);

    const githubButton = screen.getByTestId('social-button-github');
    await userEvent.click(githubButton);

    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it('renders the registration form with provided heading and image', () => {
    render(<FunnelRegistration {...defaultProps} />);

    // Check for the title text
    expect(screen.getByTestId('registgration-heading')).toBeInTheDocument();
    expect(screen.getByTestId('registration-container')).toBeInTheDocument();

    // Check for background image
    const backgroundImage = screen.getByAltText('background');
    expect(backgroundImage).toHaveAttribute(
      'src',
      defaultProps.parameters.imageMobile,
    );

    // Check for social buttons - GitHub is always shown
    expect(screen.getByTestId('social-button-github')).toBeInTheDocument();
  });

  it('renders the registration form with mobile image by default', () => {
    render(<FunnelRegistration {...defaultProps} />);

    const backgroundImage = screen.getByAltText('background');
    expect(backgroundImage).toHaveAttribute(
      'src',
      defaultProps.parameters.imageMobile,
    );
  });

  it('shows tablet image on tablet view', () => {
    // Mock tablet view
    (useViewSize as jest.Mock).mockReturnValue(true);

    render(<FunnelRegistration {...defaultProps} />);

    const backgroundImage = screen.getByAltText('background');
    expect(backgroundImage).toHaveAttribute(
      'src',
      defaultProps.parameters.image,
    );
  });

  it('shows Google as first provider when not in webview', async () => {
    const mockWindowOpen = jest.fn();
    global.open = mockWindowOpen;

    // Mock isWebView to return false
    (isWebView as jest.Mock).mockReturnValue(false);

    render(<FunnelRegistration {...defaultProps} />);

    const googleButton = screen.getByTestId('social-button-google');
    await userEvent.click(googleButton);

    expect(mockWindowOpen).toHaveBeenCalled();
    expect(mockOnSocialRegistration).toHaveBeenCalledWith(
      SocialProvider.Google,
    );
    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: SocialProvider.Google,
      extra: JSON.stringify({ trigger: 'funnel registration' }),
    });
  });

  it('shows Apple as first provider when in webview on iOS', async () => {
    const mockWindowOpen = jest.fn();
    global.open = mockWindowOpen;

    // Mock isWebView to return true and isIOS to return true
    (isWebView as jest.Mock).mockReturnValue(true);
    (isIOS as jest.Mock).mockReturnValue(true);

    render(<FunnelRegistration {...defaultProps} />);

    const appleButton = screen.getByTestId('social-button-apple');
    await userEvent.click(appleButton);

    expect(mockWindowOpen).not.toHaveBeenCalled();
    expect(mockOnSocialRegistration).toHaveBeenCalledWith(SocialProvider.Apple);
    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: SocialProvider.Apple,
      extra: JSON.stringify({ trigger: 'funnel registration' }),
    });
  });

  it('shows toast and calls onTransition for non-Plus users', async () => {
    mockRefetchBoot.mockResolvedValueOnce({
      data: {
        user: {
          email: 'test@example.com',
          id: 'test-user-id',
          isPlus: false,
          providers: ['google'],
        },
      },
    });

    render(<FunnelRegistration {...defaultProps} />);

    const messageHandler = mockUseEventListener.mock.calls[0][2];
    messageHandler({
      data: {
        eventKey: AuthEvent.SocialRegistration,
      },
    });

    await waitFor(() => {
      expect(mockRefetchBoot).toHaveBeenCalled();
      expect(mockOnTransition).toHaveBeenCalled();
      expect(mockDisplayToast).not.toHaveBeenCalled();
    });
  });

  it('handles registration error with existing email', async () => {
    (getKratosFlow as jest.Mock).mockResolvedValueOnce({
      id: 'test-flow-id',
      ui: {
        messages: [{ id: 'NO_STRATEGY_TO_SIGNUP' }],
      },
    });

    render(<FunnelRegistration {...defaultProps} />);

    const messageHandler = mockUseEventListener.mock.calls[0][2];
    messageHandler({
      data: {
        eventKey: AuthEvent.SocialRegistration,
        flow: 'test-flow',
      },
    });

    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalledWith(labels.auth.error.generic);
      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: AuthEventNames.RegistrationError,
        extra: JSON.stringify({
          error: {
            flowId: 'test-flow-id',
            messages: [{ id: 'NO_STRATEGY_TO_SIGNUP' }],
          },
          origin: 'window registration flow error',
        }),
      });
    });
  });

  it('handles registration error with missing user data', async () => {
    mockRefetchBoot.mockResolvedValueOnce({
      data: { user: null },
    });

    render(<FunnelRegistration {...defaultProps} />);

    const messageHandler = mockUseEventListener.mock.calls[0][2];
    messageHandler({
      data: {
        eventKey: AuthEvent.SocialRegistration,
      },
    });

    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalledWith(labels.auth.error.generic);
    });
  });

  it('handles registration error with missing providers', async () => {
    mockRefetchBoot.mockResolvedValueOnce({
      data: {
        user: {
          email: 'test@example.com',
          id: 'test-user-id',
        },
      },
    });

    render(<FunnelRegistration {...defaultProps} />);

    const messageHandler = mockUseEventListener.mock.calls[0][2];
    messageHandler({
      data: {
        eventKey: AuthEvent.SocialRegistration,
      },
    });

    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalledWith(labels.auth.error.generic);
    });
  });
});

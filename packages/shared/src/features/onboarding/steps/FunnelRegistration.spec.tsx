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
import { isIOSNative } from '../../../lib/func';
import { SocialProvider } from '../../../components/auth/common';
import { labels } from '../../../lib';
import { AuthEventNames } from '../../../lib/auth';

// Mock the hooks and dependencies
jest.mock('../../../hooks/useRegistration');
jest.mock('../../../contexts/AuthContext');
jest.mock('../../../contexts/LogContext');
jest.mock('../../../hooks');
jest.mock('../../../lib/kratos');
jest.mock('../../../lib/func');

describe('FunnelRegistration', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSocialRegistration = jest.fn();
  const mockDisplayToast = jest.fn();
  const mockRefetchBoot = jest.fn();
  const mockLogEvent = jest.fn();
  const mockUseEventListener = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementations
    (useRegistration as jest.Mock).mockReturnValue({
      onSocialRegistration: mockOnSocialRegistration,
    });

    (useAuthContext as jest.Mock).mockReturnValue({
      refetchBoot: mockRefetchBoot,
    });

    (useLogContext as jest.Mock).mockReturnValue({
      logEvent: mockLogEvent,
    });

    (useToastNotification as jest.Mock).mockReturnValue({
      displayToast: mockDisplayToast,
    });

    (useEventListener as jest.Mock).mockImplementation(mockUseEventListener);

    (useViewSize as jest.Mock).mockReturnValue(false);

    (getKratosFlow as jest.Mock).mockResolvedValue({
      id: 'test-flow-id',
      ui: { messages: [] },
    });

    // Default to non-iOS
    (isIOSNative as jest.Mock).mockReturnValue(false);
  });

  describe('Viewport Responsiveness', () => {
    it('uses mobile background on mobile viewport', () => {
      (useViewSize as jest.Mock).mockReturnValue(false);
      render(<FunnelRegistration onSuccess={mockOnSuccess} />);

      const backgroundImage = screen.getByAltText('background');
      expect(backgroundImage).toHaveAttribute(
        'src',
        expect.stringContaining('login%20background'),
      );
    });

    it('uses desktop background on tablet viewport', () => {
      (useViewSize as jest.Mock).mockReturnValue(true);
      render(<FunnelRegistration onSuccess={mockOnSuccess} />);

      const backgroundImage = screen.getByAltText('background');
      expect(backgroundImage).toHaveAttribute(
        'src',
        expect.stringContaining('login%20background%20web'),
      );
    });

    it('updates background when viewport changes', () => {
      const { rerender } = render(
        <FunnelRegistration onSuccess={mockOnSuccess} />,
      );

      // Initial mobile view
      let backgroundImage = screen.getByAltText('background');
      expect(backgroundImage).toHaveAttribute(
        'src',
        expect.stringContaining('login%20background'),
      );

      // Change to tablet view
      (useViewSize as jest.Mock).mockReturnValue(true);
      rerender(<FunnelRegistration onSuccess={mockOnSuccess} />);

      backgroundImage = screen.getByAltText('background');
      expect(backgroundImage).toHaveAttribute(
        'src',
        expect.stringContaining('login%20background%20web'),
      );

      // Change back to mobile view
      (useViewSize as jest.Mock).mockReturnValue(false);
      rerender(<FunnelRegistration onSuccess={mockOnSuccess} />);

      backgroundImage = screen.getByAltText('background');
      expect(backgroundImage).toHaveAttribute(
        'src',
        expect.stringContaining('login%20background'),
      );
    });

    it('applies correct classes based on viewport', () => {
      (useViewSize as jest.Mock).mockReturnValue(true);
      render(<FunnelRegistration onSuccess={mockOnSuccess} />);

      const container = screen.getByTestId('registration-container');
      expect(container).toHaveClass('tablet:max-w-96');
    });
  });

  it('renders the registration form with social login options', () => {
    render(<FunnelRegistration onSuccess={mockOnSuccess} />);

    // Check for the title text
    const titleElement = screen.getByTestId('registration-title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(/Yes, this is the signup screen/);

    // Check for social buttons
    expect(screen.getByTestId('social-button-google')).toBeInTheDocument();
    expect(screen.getByTestId('social-button-github')).toBeInTheDocument();
  });

  it('calls onSocialRegistration with Google provider when clicked on non-iOS', async () => {
    render(<FunnelRegistration onSuccess={mockOnSuccess} />);

    const googleButton = screen.getByTestId('social-button-google');
    await userEvent.click(googleButton);

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

  it('calls onSocialRegistration with Apple provider when clicked on iOS', async () => {
    (isIOSNative as jest.Mock).mockReturnValue(true);
    render(<FunnelRegistration onSuccess={mockOnSuccess} />);

    const appleButton = screen.getByTestId('social-button-apple');
    await userEvent.click(appleButton);

    expect(mockOnSocialRegistration).toHaveBeenCalledWith(SocialProvider.Apple);
    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: SocialProvider.Apple,
      extra: JSON.stringify({ trigger: 'funnel registration' }),
    });
  });

  it('calls onSocialRegistration with GitHub provider when clicked', async () => {
    render(<FunnelRegistration onSuccess={mockOnSuccess} />);

    const githubButton = screen.getByTestId('social-button-github');
    await userEvent.click(githubButton);

    expect(mockOnSocialRegistration).toHaveBeenCalledWith(
      SocialProvider.GitHub,
    );
    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: SocialProvider.GitHub,
      extra: JSON.stringify({ trigger: 'funnel registration' }),
    });
  });

  it('handles successful social registration with isPlus', async () => {
    mockRefetchBoot.mockResolvedValueOnce({
      data: {
        user: {
          email: 'test@example.com',
          id: 'test-user-id',
          isPlus: true,
          providers: ['google'],
        },
      },
    });

    render(<FunnelRegistration onSuccess={mockOnSuccess} />);

    // Get the message handler from the useEventListener mock
    const messageHandler = mockUseEventListener.mock.calls[0][2];

    // Simulate successful social registration message
    messageHandler({
      data: {
        eventKey: AuthEvent.SocialRegistration,
      },
    });

    await waitFor(() => {
      expect(mockRefetchBoot).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalledWith(true);
    });
  });

  it('handles successful social registration without isPlus', async () => {
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

    render(<FunnelRegistration onSuccess={mockOnSuccess} />);

    // Get the message handler from the useEventListener mock
    const messageHandler = mockUseEventListener.mock.calls[0][2];

    // Simulate successful social registration message
    messageHandler({
      data: {
        eventKey: AuthEvent.SocialRegistration,
      },
    });

    await waitFor(() => {
      expect(mockRefetchBoot).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalledWith(false);
    });
  });

  it('handles registration error with existing email', async () => {
    (getKratosFlow as jest.Mock).mockResolvedValueOnce({
      id: 'test-flow-id',
      ui: {
        messages: [{ id: 'NO_STRATEGY_TO_SIGNUP' }],
      },
    });

    render(<FunnelRegistration onSuccess={mockOnSuccess} />);

    // Get the message handler from the useEventListener mock
    const messageHandler = mockUseEventListener.mock.calls[0][2];

    // Simulate error message with flow property
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

    render(<FunnelRegistration onSuccess={mockOnSuccess} />);

    // Get the message handler from the useEventListener mock
    const messageHandler = mockUseEventListener.mock.calls[0][2];

    // Simulate message with missing user data
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

    render(<FunnelRegistration onSuccess={mockOnSuccess} />);

    // Get the message handler from the useEventListener mock
    const messageHandler = mockUseEventListener.mock.calls[0][2];

    // Simulate message with missing providers
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

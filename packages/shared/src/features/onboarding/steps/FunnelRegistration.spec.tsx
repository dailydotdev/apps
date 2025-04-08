// Mock BroadcastChannel
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FunnelRegistration } from './FunnelRegistration';
import useRegistration from '../../../hooks/useRegistration';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useEventListener, useToastNotification } from '../../../hooks';
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

    // Mock useLogContext for both components
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

    // Default to non-iOS
    (isIOSNative as jest.Mock).mockReturnValue(false);
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

  it('handles successful social registration', async () => {
    // Setup the mock to return a user with email
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

    // Simulate successful social registration message
    messageHandler({
      data: {
        eventKey: AuthEvent.SocialRegistration,
        // No flow property to indicate success
      },
    });

    // Verify the conditions
    await waitFor(() => {
      expect(mockRefetchBoot).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles registration error with existing email', async () => {
    // Setup the mock to return a specific error
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

    // Verify the error handling
    await waitFor(() => {
      // First verify the toast message
      expect(mockDisplayToast).toHaveBeenCalledWith(labels.auth.error.generic);

      // Then verify the log event
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
      expect(mockLogEvent).toHaveBeenCalledWith({
        event_name: AuthEventNames.SubmitSignUpFormError,
        extra: JSON.stringify({
          error: 'Could not find email on social registration',
        }),
      });
    });
  });
});

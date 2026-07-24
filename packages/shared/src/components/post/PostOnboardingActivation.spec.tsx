import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostOnboardingActivation } from './PostOnboardingActivation';

const mockPush = jest.fn();
const mockLogEvent = jest.fn();
const mockUseConditionalFeature = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/posts/post-1?ref=share',
    pathname: '/posts/[id]',
    query: {},
    push: mockPush,
  }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'new-user' } }),
}));

jest.mock('../../hooks/auth/useOnboardingActions', () => ({
  useOnboardingActions: () => ({
    isOnboardingActionsReady: true,
    isOnboardingComplete: false,
  }),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: (args: unknown) => mockUseConditionalFeature(args),
}));

describe('PostOnboardingActivation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });
  });

  it('shows the feed setup prompt and routes to onboarding on click', async () => {
    render(<PostOnboardingActivation />);

    expect(
      await screen.findByText("Your feed isn't set up yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You're one step away from discovering what's next."),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Finish setup' }));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/onboarding',
      query: { after_auth: '/posts/post-1?ref=share' },
    });
  });

  it('is a required step with no dismiss control', async () => {
    render(<PostOnboardingActivation />);

    await screen.findByRole('complementary', {
      name: 'Personalize your feed',
    });

    expect(
      screen.queryByRole('button', { name: 'Dismiss feed personalization' }),
    ).not.toBeInTheDocument();
  });

  it('stays hidden while the feature flag is off', () => {
    mockUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });

    render(<PostOnboardingActivation />);

    expect(
      screen.queryByRole('complementary', { name: 'Personalize your feed' }),
    ).not.toBeInTheDocument();
  });
});

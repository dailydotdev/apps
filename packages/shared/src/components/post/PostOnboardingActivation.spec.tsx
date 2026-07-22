import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostOnboardingActivation } from './PostOnboardingActivation';
import {
  clearPostSignupActivation,
  hasPostSignupActivation,
} from '../../lib/postSignupActivation';

const mockPush = jest.fn();
const mockLogEvent = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/posts/post-1?ref=share',
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

jest.mock('../../lib/postSignupActivation', () => ({
  clearPostSignupActivation: jest.fn(),
  hasPostSignupActivation: jest.fn(() => true),
  isPostOnboardingPreviewEnabled: jest.fn(() => false),
  POST_ONBOARDING_PREVIEW_QUERY: 'postOnboardingPreview',
}));

const mockHasPostSignupActivation = jest.mocked(hasPostSignupActivation);
const mockClearPostSignupActivation = jest.mocked(clearPostSignupActivation);

describe('PostOnboardingActivation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPostSignupActivation.mockReturnValue(true);
  });

  it('frames feed setup as the final step with a clear value proposition', async () => {
    render(<PostOnboardingActivation />);

    expect(
      await screen.findByText("Your feed isn't set up yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Finish setup to discover what's next and stay up to date.",
      ),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Personalize my feed' }),
    );

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/onboarding',
      query: { after_auth: '/posts/post-1?ref=share' },
    });
  });

  it('dismisses the prompt without completing onboarding', async () => {
    render(<PostOnboardingActivation />);

    await screen.findByRole('complementary', {
      name: 'Personalize your feed',
    });
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Dismiss feed personalization',
      }),
    );

    expect(mockClearPostSignupActivation).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(
        screen.queryByRole('complementary', {
          name: 'Personalize your feed',
        }),
      ).not.toBeInTheDocument();
    });
  });
});

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
}));

const mockHasPostSignupActivation = jest.mocked(hasPostSignupActivation);
const mockClearPostSignupActivation = jest.mocked(clearPostSignupActivation);

describe('PostOnboardingActivation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPostSignupActivation.mockReturnValue(true);
  });

  it('connects the current post topics to the feed value proposition', async () => {
    render(
      <PostOnboardingActivation
        post={{ tags: ['react', 'typescript', 'webdev'] }}
      />,
    );

    expect(
      await screen.findByText(
        'One good post is luck. Build a feed full of them.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
    expect(screen.getByText('#webdev')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Build my feed' }),
    );

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/onboarding',
      query: { after_auth: '/posts/post-1?ref=share' },
    });
  });

  it('dismisses the prompt without completing onboarding', async () => {
    render(<PostOnboardingActivation post={{ tags: [] }} />);

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

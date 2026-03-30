import React from 'react';
import { render, waitFor } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { AFTER_AUTH_PARAM } from '@dailydotdev/shared/src/components/auth/common';
import { onboardingUrl } from '@dailydotdev/shared/src/lib/constants';
import ProtectedPage from './ProtectedPage';

const replace = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({
    asPath: '/following?sort=latest',
    replace,
  } as unknown as NextRouter);
});

describe('ProtectedPage', () => {
  it('redirects anonymous users to onboarding with after_auth', async () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          isAuthReady: true,
          isFetched: true,
          isLoggedIn: false,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
        }}
      >
        <ProtectedPage>
          <div>content</div>
        </ProtectedPage>
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        `${onboardingUrl}?${new URLSearchParams({
          [AFTER_AUTH_PARAM]: '/following?sort=latest',
        }).toString()}`,
      );
    });
  });
});

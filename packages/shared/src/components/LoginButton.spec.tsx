/* eslint-disable no-console */
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, act } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import LoginButton from './LoginButton';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import type { LoggedUser } from '../lib/user';
import { AuthContextProvider } from '../contexts/AuthContext';
import { AuthTriggers } from '../lib/auth';

describe('LoginButton', () => {
  const showLogin = jest.fn();
  const logEvent = jest.fn();

  beforeEach(() => {
    showLogin.mockReset();
    logEvent.mockReset();
  });

  const renderLayout = (user: LoggedUser = null): RenderResult => {
    const client = new QueryClient();

    return render(
      <AuthContextProvider
        user={user}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
      >
        <TestBootProvider client={client} auth={{ user, showLogin }}>
          <LoginButton />
        </TestBootProvider>
      </AuthContextProvider>,
    );
  };

  it('should call showLogin when clicking the login button', async () => {
    renderLayout();
    const loginButton = await screen.findByText('Log in');
    expect(loginButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(loginButton);
    });

    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.MainButton,
      options: {
        isLogin: true,
      },
    });
  });

  it('should call showLogin when clicking the signup button', async () => {
    renderLayout();
    const signupButton = await screen.findByText('Sign up');
    expect(signupButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(signupButton);
    });

    expect(showLogin).toHaveBeenCalledWith({
      trigger: AuthTriggers.MainButton,
      options: {
        isLogin: false,
      },
    });
  });
});

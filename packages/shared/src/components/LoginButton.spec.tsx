/* eslint-disable no-console */
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import LoginButton from './LoginButton';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import type { LoggedUser } from '../lib/user';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('LoginButton', () => {
  const showLogin = jest.fn();
  const routerPush = jest.fn();

  beforeEach(() => {
    showLogin.mockReset();
    routerPush.mockReset();
    mocked(useRouter).mockImplementation(() => ({
      push: routerPush,
      pathname: '/',
      query: {},
      replace: jest.fn(),
    }));
  });

  const renderLayout = (user: LoggedUser = null): RenderResult => {
    const client = new QueryClient();

    return render(
      <TestBootProvider client={client} auth={{ user, showLogin }}>
        <LoginButton />
      </TestBootProvider>,
    );
  };

  it('should redirect to onboarding when clicking the button', async () => {
    renderLayout();
    const el = await screen.findByText('Log in');

    fireEvent.click(el);
    const decodedURL = decodeURIComponent(routerPush.mock.calls[0][0]);
    expect(decodedURL).toBe('/onboarding?authTrigger=main+button&afterAuth=/');
  });
});

/* eslint-disable no-console */
import { QueryClient } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import React from 'react';

import { TestBootProvider } from '../../__tests__/helpers/boot';
import { LoggedUser } from '../lib/user';
import LoginButton from './LoginButton';

describe('LoginButton', () => {
  const showLogin = jest.fn();

  beforeEach(() => {
    showLogin.mockReset();
  });

  const renderLayout = (user: LoggedUser = null): RenderResult => {
    const client = new QueryClient();

    return render(
      <TestBootProvider client={client} auth={{ user, showLogin }}>
        <LoginButton />
      </TestBootProvider>,
    );
  };

  it('should show login when clicking on the button', async () => {
    renderLayout();
    const el = await screen.findByText('Log in');

    fireEvent.click(el);

    expect(showLogin).toBeCalledTimes(1);
  });
});

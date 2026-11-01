import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import AuthDefault from './AuthDefault';
import { providers } from './common';
import { AuthEventNames, AuthTriggers } from '../../lib/auth';
import { TestBootProvider } from '../../../__tests__/helpers/boot';

const renderAuthDefault = (
  props: Partial<React.ComponentProps<typeof AuthDefault>> = {},
) => {
  const logEvent = jest.fn();
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ isLoggedIn: false, user: undefined }}
      log={{ logEvent }}
    >
      <AuthDefault
        isReady
        providers={providers}
        trigger={AuthTriggers.Upvote}
        {...props}
      />
    </TestBootProvider>,
  );
  return { logEvent };
};

describe('AuthDefault', () => {
  it('opens the email sign-up form and logs it as the email provider', () => {
    const onSignup = jest.fn();
    const { logEvent } = renderAuthDefault({ onSignup });

    fireEvent.click(screen.getByText('Continue with email'));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: 'email',
      extra: JSON.stringify({ trigger: AuthTriggers.Upvote }),
    });
    expect(onSignup).toHaveBeenCalledWith('');
  });

  it('asks for the missing fields instead of submitting an empty log in', async () => {
    const onPasswordLogin = jest.fn();
    renderAuthDefault({ isLoginFlow: true, onPasswordLogin });

    fireEvent.submit(screen.getByTestId('login_form'));

    expect(await screen.findByText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(onPasswordLogin).not.toHaveBeenCalled();
  });
});

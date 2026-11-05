import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { betterAuthSignIn } from '../../../../lib/betterAuth';
import { StartupsCheckout, StartupsCheckoutStep } from './StartupsCheckout';

jest.mock('../../../../lib/betterAuth', () => ({
  ...jest.requireActual('../../../../lib/betterAuth'),
  betterAuthSignIn: jest.fn(),
}));

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null,
}));

const renderAccountStep = (refetchBoot = jest.fn()) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ isLoggedIn: false, user: undefined, refetchBoot }}
    >
      <StartupsCheckout initialStep={StartupsCheckoutStep.Account} />
    </TestBootProvider>,
  );

const click = async (name: RegExp) =>
  fireEvent.click(await screen.findByRole('button', { name }));

const openEmailLogIn = async () => {
  await click(/^log in$/i);
  await click(/continue with email/i);
};

describe('StartupsCheckout account step', () => {
  it('opens the log-in screen from the sign-up options', async () => {
    renderAccountStep();
    expect(await screen.findByText('Create your account')).toBeInTheDocument();

    await click(/^log in$/i);

    expect(await screen.findByText('Welcome back')).toBeInTheDocument();
    expect(screen.queryByText('Create your account')).not.toBeInTheDocument();
  });

  it('opens forgot password from log in, and goes back', async () => {
    renderAccountStep();
    await openEmailLogIn();

    await click(/forgot password/i);
    expect(await screen.findByText('Reset password')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/back to log in/i));
    expect(await screen.findByText('Forgot password?')).toBeInTheDocument();
  });

  it('asks an unverified account for the email code after log in', async () => {
    (betterAuthSignIn as jest.Mock).mockResolvedValue({});
    const refetchBoot = jest.fn().mockResolvedValue({
      data: { user: { shouldVerify: true, email: 'founder@acme.dev' } },
    });
    renderAccountStep(refetchBoot);
    await openEmailLogIn();

    const email = await screen.findByLabelText('Email');
    fireEvent.input(email, { target: { value: 'founder@acme.dev' } });
    const password = document.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    fireEvent.input(password, { target: { value: 'not-my-password' } });
    fireEvent.submit(screen.getByTestId('login_form'));

    expect(await screen.findByText('Verify your email')).toBeInTheDocument();
  });

  it('opens the email form from log in, then back to the sign-up options', async () => {
    renderAccountStep();
    await click(/^log in$/i);
    await click(/^sign up$/i);
    await click(/continue with email/i);

    await click(/^go back$/i);

    expect(await screen.findByText('Create your account')).toBeInTheDocument();
  });
});

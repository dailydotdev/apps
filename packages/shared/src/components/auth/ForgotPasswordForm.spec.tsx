import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from './ForgotPasswordForm';
import { betterAuthForgetPassword } from '../../lib/betterAuth';

jest.mock('../../lib/betterAuth', () => ({
  betterAuthForgetPassword: jest.fn(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('../../contexts/AuthDataContext', () => ({
  useAuthData: () => ({ email: '', setEmail: jest.fn() }),
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should ask for an email when the field is empty', async () => {
    render(<ForgotPasswordForm />);

    await userEvent.click(screen.getByText('Send reset link'));

    expect(await screen.findByText('Enter your email')).toBeVisible();
    expect(betterAuthForgetPassword).not.toHaveBeenCalled();
  });
});

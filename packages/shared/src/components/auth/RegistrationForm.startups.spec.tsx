import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { AuthDataProvider } from '../../contexts/AuthDataContext';
import { generateUsername } from '../../graphql/users';
import { AuthTriggers } from '../../lib/auth';
import { waitForTurnstileToken } from '../../lib/turnstile';
import RegistrationForm from './RegistrationForm';

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null,
}));

jest.mock('../../lib/turnstile', () => ({
  ...jest.requireActual('../../lib/turnstile'),
  waitForTurnstileToken: jest.fn(),
}));

jest.mock('../../graphql/users', () => ({
  ...jest.requireActual('../../graphql/users'),
  generateUsername: jest.fn(),
}));

const onSignup = jest.fn();

const renderForm = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AuthDataProvider initialEmail="">
        <RegistrationForm
          isStartups
          simplified
          showHeadline={false}
          trigger={AuthTriggers.StartupsCheckout}
          onSignup={onSignup}
        />
      </AuthDataProvider>
    </TestBootProvider>,
  );

const fill = (name: string, value: string) =>
  fireEvent.input(
    document.querySelector(`input[name="${name}"]`) as HTMLInputElement,
    { target: { value } },
  );

describe('RegistrationForm on the Startups page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(waitForTurnstileToken).mockResolvedValue('token');
    jest.mocked(generateUsername).mockResolvedValue('ada_lovelace');
  });

  it('asks for email, name and password, opted in to marketing', () => {
    renderForm();

    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', {
        name: /don.t want to receive updates and promotions/,
      }),
    ).not.toBeChecked();
    expect(
      document.querySelector('input[name="traits.username"]'),
    ).toHaveAttribute('type', 'hidden');
  });

  it('generates the username and opts in to marketing by default', async () => {
    renderForm();
    fill('traits.email', 'ada@acme.dev');
    fill('traits.name', 'Ada Lovelace');
    fill('password', 'longenough1');
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(onSignup).toHaveBeenCalled());
    expect(onSignup.mock.calls[0][0]).toMatchObject({
      'traits.username': 'ada_lovelace',
      'traits.acceptedMarketing': true,
    });
  });

  it('opts out of marketing when the box is ticked', async () => {
    renderForm();
    fill('traits.email', 'ada@acme.dev');
    fill('traits.name', 'Ada Lovelace');
    fill('password', 'longenough1');
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: /don.t want to receive updates and promotions/,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(onSignup).toHaveBeenCalled());
    expect(onSignup.mock.calls[0][0]).toMatchObject({
      'traits.acceptedMarketing': false,
    });
  });

  it('shows the errors inline and does not submit', async () => {
    const onUpdateHints = jest.fn();
    render(
      <TestBootProvider client={new QueryClient()}>
        <AuthDataProvider initialEmail="">
          <RegistrationForm
            isStartups
            simplified
            showHeadline={false}
            trigger={AuthTriggers.StartupsCheckout}
            onSignup={onSignup}
            onUpdateHints={onUpdateHints}
          />
        </AuthDataProvider>
      </TestBootProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() =>
      expect(onUpdateHints).toHaveBeenCalledWith({
        'traits.email': 'Enter your email',
        'traits.name': 'Add your name so your team recognizes you.',
        password: 'Use at least 8 characters.',
      }),
    );
    expect(onSignup).not.toHaveBeenCalled();
  });

  it('shows the username field when it needs fixing', () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <AuthDataProvider initialEmail="">
          <RegistrationForm
            isStartups
            simplified
            showHeadline={false}
            trigger={AuthTriggers.StartupsCheckout}
            hints={{ 'traits.username': 'That username is taken' }}
          />
        </AuthDataProvider>
      </TestBootProvider>,
    );

    expect(
      document.querySelector('input[name="traits.username"]'),
    ).not.toHaveAttribute('type', 'hidden');
    expect(screen.getByText('That username is taken')).toBeInTheDocument();
  });
});

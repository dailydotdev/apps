import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createStore, Provider } from 'jotai';
import RegistrationForm from './RegistrationForm';
import { AuthTriggers } from '../../lib/auth';
import { authAtom } from '../../features/onboarding/store/onboarding.store';

jest.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => <div data-testid="turnstile" />,
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('../../contexts/AuthDataContext', () => ({
  useAuthData: () => ({ email: 'ada@daily.dev' }),
}));

// Stub the two query-backed hooks at their source modules rather than through
// the `hooks` barrel — the barrel re-exports the whole hook surface, and
// replacing it takes out everything else the form's fields pull from it.
jest.mock('../../hooks/onboarding/useGenerateUsername', () => ({
  useGenerateUsername: () => ({
    username: '',
    setUsername: jest.fn(),
    isLoading: false,
  }),
}));

jest.mock('../../hooks/onboarding/useCheckExistingEmail', () => ({
  useCheckExistingEmail: () => ({
    email: { isCheckPending: false, alreadyExists: false },
    onEmailCheck: jest.fn(),
  }),
}));

const renderForm = (props = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RegistrationForm
        trigger={AuthTriggers.Onboarding}
        simplified
        {...props}
      />
    </QueryClientProvider>,
  );

describe('RegistrationForm', () => {
  it('keeps its title while /onboarding is authenticating', () => {
    const store = createStore();
    store.set(authAtom, (prev) => ({ ...prev, isAuthenticating: true }));
    render(
      <Provider store={store}>
        <QueryClientProvider client={new QueryClient()}>
          <RegistrationForm
            trigger={AuthTriggers.Onboarding}
            simplified
            isOnboardingFunnel
          />
        </QueryClientProvider>
      </Provider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Sign up' }),
    ).toBeInTheDocument();
  });

  it('lets someone who meant to log in switch to login from the funnel', () => {
    const onExistingEmailLoginClick = jest.fn();
    renderForm({ isOnboardingFunnel: true, onExistingEmailLoginClick });

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(onExistingEmailLoginClick).toHaveBeenCalledTimes(1);
  });

  it('keeps the login link out of the other signup surfaces', () => {
    renderForm({ onExistingEmailLoginClick: jest.fn() });

    expect(
      screen.queryByText('Already have an account?'),
    ).not.toBeInTheDocument();
  });

  it('shows a password error on the password field, not under email', () => {
    const onUpdateHints = jest.fn();
    renderForm({ hints: { password: 'Password too short' }, onUpdateHints });
    const password = document.querySelector<HTMLInputElement>(
      'input[name="password"]',
    ) as HTMLInputElement;
    fireEvent.input(password, { target: { value: 'short12' } });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Password too short');
    // The hint belongs to the password field's own container.
    expect(
      alert.parentElement?.querySelector('input[name="password"]'),
    ).toBeInTheDocument();
    expect(
      alert.parentElement?.querySelector('input[name="traits.email"]'),
    ).not.toBeInTheDocument();
    // Editing the password clears its server error.
    expect(onUpdateHints).toHaveBeenCalledWith({ password: '' });
  });
});

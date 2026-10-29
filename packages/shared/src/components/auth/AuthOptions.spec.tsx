import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import AuthOptions from './AuthOptions';
import { AuthDisplay } from './common';
import { AuthTriggers } from '../../lib/auth';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { SOCIAL_AUTH_POPUP_CLOSED_ERROR } from './socialAuth';

jest.mock('../../lib/betterAuth', () => ({
  ...jest.requireActual('../../lib/betterAuth'),
  getBetterAuthSocialRedirectData: jest
    .fn()
    .mockResolvedValue({ url: 'https://accounts.google.com/o/oauth2' }),
}));

jest.mock('./RegistrationForm', () => ({
  __esModule: true,
  default: () => <div data-testid="registration-form" />,
}));

jest.mock('./OnboardingRegistrationForm', () => {
  const ProviderChoice = () => <div data-testid="provider-choice" />;
  ProviderChoice.default = ProviderChoice;
  return { OnboardingRegistrationForm: ProviderChoice };
});

jest.mock('./AuthDefault', () => ({
  __esModule: true,
  default: ({
    onProviderClick,
  }: {
    onProviderClick: (provider: string) => void;
  }) => (
    <button
      type="button"
      data-testid="auth-default"
      onClick={() => onProviderClick('google')}
    >
      Google
    </button>
  ),
}));

const renderOptions = (defaultDisplay: AuthDisplay) => {
  const client = new QueryClient();
  const formRef = { current: document.createElement('form') };
  const options = (display: AuthDisplay) => (
    <TestBootProvider client={client} auth={{ isLoggedIn: false }}>
      <AuthOptions
        simplified
        isOnboardingFunnel
        formRef={formRef}
        trigger={AuthTriggers.Onboarding}
        defaultDisplay={display}
      />
    </TestBootProvider>
  );
  const view = render(options(defaultDisplay));

  return {
    rerenderWith: (display: AuthDisplay) => view.rerender(options(display)),
  };
};

describe('AuthOptions', () => {
  it('follows the parent when it moves the default display', async () => {
    const { rerenderWith } = renderOptions(AuthDisplay.Registration);
    expect(await screen.findByTestId('registration-form')).toBeInTheDocument();

    rerenderWith(AuthDisplay.OnboardingSignup);

    expect(await screen.findByTestId('provider-choice')).toBeInTheDocument();
    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
  });
});

describe('AuthOptions social popup', () => {
  it('logs a closed popup without a sign-in as a cancellation', async () => {
    const popup = { closed: false, close: jest.fn(), location: { href: '' } };
    jest.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
    const logEvent = jest.fn();
    const refetchBoot = jest
      .fn()
      .mockResolvedValue({ data: { user: { id: 'anonymous' } } });

    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isLoggedIn: false, user: undefined, refetchBoot }}
        log={{ logEvent }}
      >
        <AuthOptions
          formRef={{ current: document.createElement('form') }}
          trigger={AuthTriggers.MainButton}
          defaultDisplay={AuthDisplay.Default}
          forceDefaultDisplay
        />
      </TestBootProvider>,
    );

    fireEvent.click(await screen.findByTestId('auth-default'));
    await waitFor(() =>
      expect(popup.location.href).toBe('https://accounts.google.com/o/oauth2'),
    );
    popup.closed = true;

    await waitFor(
      () =>
        expect(logEvent).toHaveBeenCalledWith({
          event_name: 'login error',
          extra: JSON.stringify({
            provider: 'google',
            error: SOCIAL_AUTH_POPUP_CLOSED_ERROR,
            origin: 'betterauth social popup closed',
          }),
        }),
      { timeout: 3000 },
    );
    expect(refetchBoot).toHaveBeenCalledWith({ cancelRefetch: false });
  });

  it('finishes the sign-in when the session lands after the popup closed', async () => {
    const popup = { closed: false, close: jest.fn(), location: { href: '' } };
    jest.spyOn(window, 'open').mockReturnValue(popup as unknown as Window);
    const logEvent = jest.fn();
    const onAuthStateUpdate = jest.fn();
    const anonymous = { data: { user: { id: 'anonymous' } } };
    const refetchBoot = jest
      .fn()
      // the immediate popup-closed check (3 attempts) sees no session yet
      .mockResolvedValueOnce(anonymous)
      .mockResolvedValueOnce(anonymous)
      .mockResolvedValueOnce(anonymous)
      // the background re-check finds it
      .mockResolvedValue({
        data: {
          user: { id: 'u1', email: 'u1@daily.dev', infoConfirmed: false },
        },
      });

    render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isLoggedIn: false, user: undefined, refetchBoot }}
        log={{ logEvent }}
      >
        <AuthOptions
          formRef={{ current: document.createElement('form') }}
          trigger={AuthTriggers.MainButton}
          defaultDisplay={AuthDisplay.Default}
          forceDefaultDisplay
          onAuthStateUpdate={onAuthStateUpdate}
        />
      </TestBootProvider>,
    );

    fireEvent.click(await screen.findByTestId('auth-default'));
    await waitFor(() =>
      expect(popup.location.href).toBe('https://accounts.google.com/o/oauth2'),
    );
    popup.closed = true;

    await waitFor(
      () =>
        expect(onAuthStateUpdate).toHaveBeenCalledWith({
          defaultDisplay: AuthDisplay.SocialRegistration,
        }),
      { timeout: 8000 },
    );
    expect(refetchBoot.mock.calls.length).toBeGreaterThanOrEqual(4);
  }, 15000);
});

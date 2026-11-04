import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
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
  default: ({
    onExistingEmailLoginClick,
  }: {
    onExistingEmailLoginClick?: (existingEmail?: string) => void;
  }) => (
    <div data-testid="registration-form">
      <button type="button" onClick={() => onExistingEmailLoginClick?.()}>
        Existing email
      </button>
      <button
        type="button"
        onClick={() => onExistingEmailLoginClick?.('taken@daily.dev')}
      >
        Email is taken
      </button>
    </div>
  ),
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
    onForgotPassword,
    onSignup,
    emailLogin,
    loginEmail,
  }: {
    onProviderClick: (provider: string) => void;
    onForgotPassword?: (email?: string) => void;
    onSignup?: (email: string) => void;
    emailLogin?: [boolean, (value: boolean) => void];
    loginEmail?: string;
  }) => (
    <>
      {emailLogin?.[0] && (
        <span data-testid="email-login">{loginEmail ?? ''}</span>
      )}
      <button
        type="button"
        data-testid="auth-default"
        onClick={() => onProviderClick('google')}
      >
        Google
      </button>
      <button type="button" onClick={() => onForgotPassword?.()}>
        Forgot password?
      </button>
      <button type="button" onClick={() => onSignup?.('')}>
        Sign up with email
      </button>
    </>
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

describe('AuthOptions forgot password', () => {
  // Mirrors /onboarding, the funnels and the recruiter modal: they store the
  // display AuthOptions reports and feed it back as `defaultDisplay`.
  const MirroringParent = () => {
    const [display, setDisplay] = React.useState(AuthDisplay.Default);
    return (
      <TestBootProvider client={new QueryClient()} auth={{ isLoggedIn: false }}>
        <AuthOptions
          simplified
          formRef={{ current: document.createElement('form') }}
          trigger={AuthTriggers.Onboarding}
          defaultDisplay={display}
          onAuthStateUpdate={({ defaultDisplay }) =>
            defaultDisplay && setDisplay(defaultDisplay)
          }
        />
      </TestBootProvider>
    );
  };

  it.each([
    ['header back button', () => screen.getByLabelText('Go back')],
    ['back to log in link', () => screen.getByText(/Back to log in/)],
  ])('goes back to log in with the %s', async (_, getBack) => {
    render(<MirroringParent />);

    fireEvent.click(await screen.findByText('Forgot password?'));
    expect(await screen.findByText('Reset password')).toBeInTheDocument();

    fireEvent.click(getBack());

    expect(await screen.findByTestId('auth-default')).toBeInTheDocument();
    expect(screen.queryByText('Reset password')).not.toBeInTheDocument();
  });
});

describe('AuthOptions screen back', () => {
  const renderMirrored = (initialDisplay: AuthDisplay) => {
    const onScreenBackChange = jest.fn();
    const onAuthStateUpdate = jest.fn();
    const MirroringParent = () => {
      const [display, setDisplay] = React.useState(initialDisplay);
      return (
        <TestBootProvider
          client={new QueryClient()}
          auth={{ isLoggedIn: false }}
        >
          <AuthOptions
            simplified
            formRef={{ current: document.createElement('form') }}
            trigger={AuthTriggers.Onboarding}
            defaultDisplay={display}
            onScreenBackChange={onScreenBackChange}
            onAuthStateUpdate={(state) => {
              onAuthStateUpdate(state);
              if (state.defaultDisplay) {
                setDisplay(state.defaultDisplay);
              }
            }}
          />
        </TestBootProvider>
      );
    };
    render(<MirroringParent />);

    return {
      onAuthStateUpdate,
      goBack: () => act(() => onScreenBackChange.mock.lastCall?.[0]()),
      expectBack: (back: unknown) =>
        waitFor(() =>
          expect(onScreenBackChange).toHaveBeenLastCalledWith(back),
        ),
    };
  };

  it('hands Reset password back to a page with its own top bar', async () => {
    const { goBack, expectBack } = renderMirrored(AuthDisplay.Default);

    fireEvent.click(await screen.findByText('Forgot password?'));

    expect(await screen.findByText('Reset password')).toBeInTheDocument();
    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument();
    await expectBack(expect.any(Function));

    goBack();

    expect(await screen.findByTestId('auth-default')).toBeInTheDocument();
    await expectBack(undefined);
  });

  it('returns email sign-up to the Sign up list it came from', async () => {
    const { goBack, expectBack, onAuthStateUpdate } = renderMirrored(
      AuthDisplay.Default,
    );

    fireEvent.click(await screen.findByText('Sign up with email'));
    expect(await screen.findByTestId('registration-form')).toBeInTheDocument();
    await expectBack(expect.any(Function));

    goBack();

    expect(onAuthStateUpdate).toHaveBeenCalledWith({ isLoginFlow: false });
    expect(await screen.findByTestId('auth-default')).toBeInTheDocument();
  });

  it('leaves a directly opened email form for the funnel', async () => {
    const { goBack, expectBack, onAuthStateUpdate } = renderMirrored(
      AuthDisplay.Registration,
    );

    expect(await screen.findByTestId('registration-form')).toBeInTheDocument();
    await expectBack(expect.any(Function));

    goBack();

    expect(onAuthStateUpdate).toHaveBeenCalledWith({
      defaultDisplay: AuthDisplay.OnboardingSignup,
    });
  });

  it('has no back on Log in reached from the email form', async () => {
    const { expectBack, onAuthStateUpdate } = renderMirrored(
      AuthDisplay.Registration,
    );

    fireEvent.click(await screen.findByText('Existing email'));

    expect(await screen.findByTestId('auth-default')).toBeInTheDocument();
    expect(onAuthStateUpdate).toHaveBeenCalledWith({
      isLoginFlow: true,
      defaultDisplay: AuthDisplay.Default,
    });
    await expectBack(undefined);
  });

  it('opens the email Log in screen with the taken email', async () => {
    const { goBack, expectBack } = renderMirrored(AuthDisplay.Registration);

    fireEvent.click(await screen.findByText('Email is taken'));

    expect(await screen.findByTestId('email-login')).toHaveTextContent(
      'taken@daily.dev',
    );
    await expectBack(expect.any(Function));

    goBack();

    expect(screen.queryByTestId('email-login')).not.toBeInTheDocument();
    expect(screen.getByTestId('auth-default')).toBeInTheDocument();
    await expectBack(undefined);
  });
});

describe('AuthOptions email Log in entry', () => {
  const renderLogin = (initialEmail?: string) =>
    render(
      <TestBootProvider client={new QueryClient()} auth={{ isLoggedIn: false }}>
        <AuthOptions
          simplified
          isLoginFlow
          initialEmail={initialEmail}
          formRef={{ current: document.createElement('form') }}
          trigger={AuthTriggers.Onboarding}
          defaultDisplay={AuthDisplay.Default}
        />
      </TestBootProvider>,
    );

  it('opens on the email screen when Log in starts with a known email', async () => {
    renderLogin('taken@daily.dev');

    expect(await screen.findByTestId('email-login')).toHaveTextContent(
      'taken@daily.dev',
    );
  });

  it('opens on the provider list without an email', async () => {
    renderLogin();

    expect(await screen.findByTestId('auth-default')).toBeInTheDocument();
    expect(screen.queryByTestId('email-login')).not.toBeInTheDocument();
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
